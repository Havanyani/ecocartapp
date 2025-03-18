import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { AnomalyDetector } from './AnomalyDetector';
import { PerformanceAnalytics } from './PerformanceAnalytics';

const PERFORMANCE_TEST_TASK = 'PERFORMANCE_TEST_TASK';
const SCHEDULE_STORAGE_KEY = '@performance_schedules';

interface TestSchedule {
  id: string;
  name: string;
  metrics: Array<keyof Metrics>;
  interval: number; // in minutes
  startTime?: string; // HH:mm format
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  isEnabled: boolean;
  lastRun?: number;
  alertThresholds?: {
    [K in keyof Metrics]?: {
      warning: number;
      critical: number;
    };
  };
  notifyOnAnomaly: boolean;
}

interface TestResult {
  scheduleId: string;
  timestamp: number;
  metrics: ExtendedProfileResult;
  anomalies: ReturnType<typeof AnomalyDetector.detectAnomalies>;
}

export class TestScheduler {
  private static instance: TestScheduler;
  private schedules: Map<string, TestSchedule> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TestScheduler {
    if (!TestScheduler.instance) {
      TestScheduler.instance = new TestScheduler();
    }
    return TestScheduler.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load saved schedules
    await this.loadSchedules();

    // Register background task
    TaskManager.defineTask(PERFORMANCE_TEST_TASK, async () => {
      try {
        await this.runDueTests();
        return BackgroundFetch.Result.NewData;
      } catch (error) {
        console.error('Background task failed:', error);
        return BackgroundFetch.Result.Failed;
      }
    });

    // Configure notifications
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Register background fetch
    await BackgroundFetch.registerTaskAsync(PERFORMANCE_TEST_TASK, {
      minimumInterval: 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    this.isInitialized = true;
  }

  private async loadSchedules(): Promise<void> {
    try {
      const savedSchedules = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (savedSchedules) {
        const schedules = JSON.parse(savedSchedules) as TestSchedule[];
        this.schedules = new Map(schedules.map(s => [s.id, s]));
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  }

  private async saveSchedules(): Promise<void> {
    try {
      const schedules = Array.from(this.schedules.values());
      await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save schedules:', error);
    }
  }

  async createSchedule(schedule: Omit<TestSchedule, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const newSchedule: TestSchedule = {
      ...schedule,
      id,
    };

    this.schedules.set(id, newSchedule);
    await this.saveSchedules();
    return id;
  }

  async updateSchedule(id: string, updates: Partial<TestSchedule>): Promise<void> {
    const schedule = this.schedules.get(id);
    if (!schedule) throw new Error(`Schedule ${id} not found`);

    const updatedSchedule = {
      ...schedule,
      ...updates,
    };

    this.schedules.set(id, updatedSchedule);
    await this.saveSchedules();
  }

  async deleteSchedule(id: string): Promise<void> {
    this.schedules.delete(id);
    await this.saveSchedules();
  }

  async toggleSchedule(id: string): Promise<void> {
    const schedule = this.schedules.get(id);
    if (!schedule) throw new Error(`Schedule ${id} not found`);

    schedule.isEnabled = !schedule.isEnabled;
    await this.saveSchedules();
  }

  private async runDueTests(): Promise<void> {
    const now = new Date();
    const enabledSchedules = Array.from(this.schedules.values())
      .filter(s => s.isEnabled);

    for (const schedule of enabledSchedules) {
      if (!this.isScheduleDue(schedule, now)) continue;

      try {
        // Run performance tests
        const analytics = PerformanceAnalytics.getInstance();
        const metrics = await analytics.getLatestMetrics();

        if (!metrics) continue;

        // Check for anomalies
        const anomalies = AnomalyDetector.detectAnomalies([metrics]);

        // Save test result
        const result: TestResult = {
          scheduleId: schedule.id,
          timestamp: Date.now(),
          metrics,
          anomalies,
        };

        await this.saveTestResult(result);

        // Check thresholds and send notifications
        await this.checkThresholdsAndNotify(schedule, result);

        // Update last run time
        await this.updateSchedule(schedule.id, { lastRun: Date.now() });
      } catch (error) {
        console.error(`Failed to run test for schedule ${schedule.id}:`, error);
      }
    }
  }

  private isScheduleDue(schedule: TestSchedule, now: Date): boolean {
    if (!schedule.lastRun) return true;

    const minutesSinceLastRun = (now.getTime() - schedule.lastRun) / (60 * 1000);
    if (minutesSinceLastRun < schedule.interval) return false;

    if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(now.getDay())) {
      return false;
    }

    if (schedule.startTime) {
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (now < scheduledTime) return false;
    }

    return true;
  }

  private async saveTestResult(result: TestResult): Promise<void> {
    try {
      const key = `@test_result_${result.scheduleId}_${result.timestamp}`;
      await AsyncStorage.setItem(key, JSON.stringify(result));
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  }

  private async checkThresholdsAndNotify(
    schedule: TestSchedule,
    result: TestResult
  ): Promise<void> {
    if (!schedule.alertThresholds) return;

    const notifications: { title: string; body: string }[] = [];

    // Check metric thresholds
    for (const [metric, value] of Object.entries(result.metrics.metrics)) {
      const threshold = schedule.alertThresholds[metric as keyof Metrics];
      if (!threshold) continue;

      if (value >= threshold.critical) {
        notifications.push({
          title: `Critical: ${metric} Performance Alert`,
          body: `${metric} value (${value}) has exceeded critical threshold (${threshold.critical})`,
        });
      } else if (value >= threshold.warning) {
        notifications.push({
          title: `Warning: ${metric} Performance Alert`,
          body: `${metric} value (${value}) has exceeded warning threshold (${threshold.warning})`,
        });
      }
    }

    // Check anomalies
    if (schedule.notifyOnAnomaly && result.anomalies.length > 0) {
      const criticalAnomalies = result.anomalies.filter(a => a.severity === 'high');
      if (criticalAnomalies.length > 0) {
        notifications.push({
          title: 'Critical Performance Anomalies Detected',
          body: `Found ${criticalAnomalies.length} critical anomalies in metrics: ${criticalAnomalies
            .map(a => a.metric)
            .join(', ')}`,
        });
      }
    }

    // Send notifications
    for (const notification of notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { scheduleId: schedule.id },
        },
        trigger: null,
      });
    }
  }

  async getSchedules(): Promise<TestSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async getTestResults(
    scheduleId: string,
    startTime?: number,
    endTime?: number
  ): Promise<TestResult[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const resultKeys = keys.filter(k => 
        k.startsWith(`@test_result_${scheduleId}`)
      );

      const results: TestResult[] = [];
      for (const key of resultKeys) {
        const result = JSON.parse(
          await AsyncStorage.getItem(key) || '{}'
        ) as TestResult;

        if (startTime && result.timestamp < startTime) continue;
        if (endTime && result.timestamp > endTime) continue;

        results.push(result);
      }

      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get test results:', error);
      return [];
    }
  }

  async clearTestResults(
    scheduleId: string,
    olderThan?: number
  ): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const resultKeys = keys.filter(k => 
        k.startsWith(`@test_result_${scheduleId}`)
      );

      for (const key of resultKeys) {
        if (olderThan) {
          const timestamp = parseInt(key.split('_')[3]);
          if (timestamp < olderThan) {
            await AsyncStorage.removeItem(key);
          }
        } else {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear test results:', error);
    }
  }
} 