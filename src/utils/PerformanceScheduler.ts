import { ExtendedProfileResult } from '@/types/performance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import BackgroundFetch from 'react-native-background-fetch';

interface ScheduleConfig {
  testId: string;
  interval: 'hourly' | 'daily' | 'weekly';
  startTime?: string; // HH:mm format
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  alertThreshold?: {
    metric: keyof ExtendedProfileResult['metrics'];
    threshold: number;
    condition: '>' | '<' | '=';
  }[];
}

interface TestSchedule {
  id: string;
  config: ScheduleConfig;
  lastRun: number;
  nextRun: number;
  enabled: boolean;
}

export class PerformanceScheduler {
  private static STORAGE_KEY = '@performance_schedules';
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Configure background fetch
    try {
      await BackgroundFetch.configure({
        minimumFetchInterval: 15, // minutes
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: false,
        requiresStorageNotLow: false,
      }, async (taskId) => {
        await this.handleBackgroundTask();
        BackgroundFetch.finish(taskId);
      }, (error) => {
        console.error('Background fetch failed to start:', error);
      });

      // Configure notifications
      await Notifications.requestPermissionsAsync();
      await Notifications.setNotificationChannelAsync('performance-alerts', {
        name: 'Performance Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        enableVibrate: true,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PerformanceScheduler:', error);
    }
  }

  static async scheduleTest(config: ScheduleConfig): Promise<string> {
    const schedules = await this.getSchedules();
    const id = `schedule_${Date.now()}`;

    const nextRun = this.calculateNextRun(config);
    const schedule: TestSchedule = {
      id,
      config,
      lastRun: 0,
      nextRun,
      enabled: true,
    };

    schedules.push(schedule);
    await this.saveSchedules(schedules);

    // Start background task if not already running
    const status = await BackgroundFetch.status();
    if (status === BackgroundFetch.STATUS_RESTRICTED) {
      await BackgroundFetch.start();
    }

    return id;
  }

  static async updateSchedule(id: string, config: Partial<ScheduleConfig>): Promise<void> {
    const schedules = await this.getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');

    schedules[index].config = { ...schedules[index].config, ...config };
    schedules[index].nextRun = this.calculateNextRun(schedules[index].config);
    await this.saveSchedules(schedules);
  }

  static async deleteSchedule(id: string): Promise<void> {
    const schedules = await this.getSchedules();
    const filteredSchedules = schedules.filter(s => s.id !== id);
    await this.saveSchedules(filteredSchedules);

    // Stop background task if no schedules remain
    if (filteredSchedules.length === 0) {
      await BackgroundFetch.stop();
    }
  }

  static async toggleSchedule(id: string, enabled: boolean): Promise<void> {
    const schedules = await this.getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');

    schedules[index].enabled = enabled;
    if (enabled) {
      schedules[index].nextRun = this.calculateNextRun(schedules[index].config);
    }
    await this.saveSchedules(schedules);
  }

  private static async handleBackgroundTask(): Promise<void> {
    const schedules = await this.getSchedules();
    const now = Date.now();

    for (const schedule of schedules) {
      if (!schedule.enabled || schedule.nextRun > now) continue;

      try {
        // Run the test
        const result = await this.runScheduledTest(schedule.config.testId);

        // Check alert thresholds
        if (schedule.config.alertThreshold) {
          for (const threshold of schedule.config.alertThreshold) {
            const value = result.metrics[threshold.metric];
            const shouldAlert = this.checkThreshold(value, threshold.threshold, threshold.condition);

            if (shouldAlert) {
              await this.sendAlert({
                title: 'Performance Alert',
                body: `${threshold.metric} ${threshold.condition} ${threshold.threshold}\nCurrent value: ${value}`,
                data: { scheduleId: schedule.id, metric: threshold.metric },
              });
            }
          }
        }

        // Update schedule
        schedule.lastRun = now;
        schedule.nextRun = this.calculateNextRun(schedule.config);
      } catch (error) {
        console.error(`Failed to run scheduled test ${schedule.id}:`, error);
      }
    }

    await this.saveSchedules(schedules);
  }

  private static async runScheduledTest(testId: string): Promise<ExtendedProfileResult> {
    // TODO: Implement actual test running logic
    // This is a placeholder that returns mock data
    return {
      id: `scheduled_${Date.now()}`,
      name: 'Scheduled Test',
      timestamp: Date.now(),
      duration: Math.random() * 2000 + 1000,
      metrics: {
        memory: Math.random() * 100,
        cpu: Math.random() * 100,
        fps: Math.random() * 60,
        renderTime: Math.random() * 1000,
        networkCalls: Math.floor(Math.random() * 20),
        diskOperations: Math.floor(Math.random() * 10),
      },
      thresholds: {
        memory: 100,
        cpu: 80,
        fps: 30,
        renderTime: 1000,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    };
  }

  private static calculateNextRun(config: ScheduleConfig): number {
    const now = new Date();
    let nextRun = new Date(now);

    switch (config.interval) {
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1);
        break;

      case 'daily':
        if (config.startTime) {
          const [hours, minutes] = config.startTime.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
          if (nextRun.getTime() <= now.getTime()) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
        } else {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        if (config.daysOfWeek?.length) {
          const currentDay = now.getDay();
          const nextDay = config.daysOfWeek.find(day => day > currentDay) ?? config.daysOfWeek[0];
          const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
          nextRun.setDate(nextRun.getDate() + daysToAdd);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }

        if (config.startTime) {
          const [hours, minutes] = config.startTime.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return nextRun.getTime();
  }

  private static checkThreshold(value: number, threshold: number, condition: '>' | '<' | '='): boolean {
    switch (condition) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '=': return value === threshold;
    }
  }

  private static async sendAlert(alert: { title: string; body: string; data?: any }): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.body,
        data: alert.data,
      },
      trigger: null,
    });
  }

  private static async getSchedules(): Promise<TestSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load schedules:', error);
      return [];
    }
  }

  private static async saveSchedules(schedules: TestSchedule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save schedules:', error);
    }
  }
} 