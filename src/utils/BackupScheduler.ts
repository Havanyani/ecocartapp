import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { performanceDataManager } from './PerformanceDataManager';

export type BackupSchedule = {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm format
  lastBackup?: number;
  retentionPolicy: {
    maxBackups: number;
    keepDays: number;
  };
  statistics: {
    totalBackups: number;
    totalSize: number;
    successRate: number;
    lastFailure?: number;
    compressionSavings: number;
  };
  notifications: {
    enabled: boolean;
    onSuccess: boolean;
    onFailure: boolean;
  };
};

const SCHEDULE_STORAGE_KEY = '@backup_schedule';
const BACKUP_STATS_KEY = '@backup_stats';

export class BackupScheduler {
  private static instance: BackupScheduler;
  private schedule: BackupSchedule = {
    enabled: false,
    frequency: 'daily',
    time: '00:00',
    retentionPolicy: {
      maxBackups: 10,
      keepDays: 30,
    },
    statistics: {
      totalBackups: 0,
      totalSize: 0,
      successRate: 100,
      compressionSavings: 0,
    },
    notifications: {
      enabled: true,
      onSuccess: true,
      onFailure: true,
    },
  };
  private timer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeNotifications();
    this.loadSchedule();
  }

  private async initializeNotifications() {
    await Notifications.requestPermissionsAsync();
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  static getInstance(): BackupScheduler {
    if (!BackupScheduler.instance) {
      BackupScheduler.instance = new BackupScheduler();
    }
    return BackupScheduler.instance;
  }

  private async loadSchedule(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (stored) {
        this.schedule = { ...this.schedule, ...JSON.parse(stored) };
        if (this.schedule.enabled) {
          this.startScheduler();
        }
      }
    } catch (error) {
      console.error('Failed to load backup schedule:', error);
    }
  }

  private async saveSchedule(): Promise<void> {
    try {
      await AsyncStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(this.schedule));
    } catch (error) {
      console.error('Failed to save backup schedule:', error);
    }
  }

  private async updateStatistics(success: boolean, size: number, compressionSavings: number): Promise<void> {
    const stats = this.schedule.statistics;
    stats.totalBackups++;
    stats.totalSize += size;
    stats.compressionSavings += compressionSavings;
    
    if (!success) {
      stats.lastFailure = Date.now();
      const totalAttempts = stats.totalBackups;
      const successfulAttempts = totalAttempts - (stats.successRate < 100 ? Math.floor(totalAttempts * (1 - stats.successRate / 100)) + 1 : 0);
      stats.successRate = (successfulAttempts / totalAttempts) * 100;
    }

    await this.saveSchedule();
  }

  private async sendNotification(title: string, body: string): Promise<void> {
    if (!this.schedule.notifications.enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'backup' },
      },
      trigger: null,
    });
  }

  private async applyRetentionPolicy(): Promise<void> {
    try {
      const backups = await performanceDataManager.getBackupFiles();
      const { maxBackups, keepDays } = this.schedule.retentionPolicy;
      const now = Date.now();

      // Sort backups by date, newest first
      const sortedBackups = backups.sort((a, b) => {
        const aTime = this.getBackupTimestamp(a);
        const bTime = this.getBackupTimestamp(b);
        return bTime - aTime;
      });

      // Keep only the specified number of backups
      const backupsToDelete = sortedBackups.slice(maxBackups);

      // Delete old backups based on keepDays
      const oldBackups = sortedBackups.filter(
        backup => (now - this.getBackupTimestamp(backup)) > keepDays * 24 * 60 * 60 * 1000
      );

      // Combine and remove duplicates
      const filesToDelete = [...new Set([...backupsToDelete, ...oldBackups])];

      for (const file of filesToDelete) {
        await performanceDataManager.deleteBackup(file);
      }
    } catch (error) {
      console.error('Failed to apply retention policy:', error);
    }
  }

  private getBackupTimestamp(filePath: string): number {
    const timestamp = filePath.split('_').pop()?.split('.')[0];
    return timestamp ? new Date(timestamp.replace(/-/g, ':')).getTime() : 0;
  }

  private calculateNextBackupTime(): number {
    const now = new Date();
    const [hours, minutes] = this.schedule.time.split(':').map(Number);
    const nextBackup = new Date(now);
    nextBackup.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for next occurrence
    if (nextBackup <= now) {
      switch (this.schedule.frequency) {
        case 'daily':
          nextBackup.setDate(nextBackup.getDate() + 1);
          break;
        case 'weekly':
          nextBackup.setDate(nextBackup.getDate() + 7);
          break;
        case 'monthly':
          nextBackup.setMonth(nextBackup.getMonth() + 1);
          break;
      }
    }

    return nextBackup.getTime();
  }

  private startScheduler(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const nextBackup = this.calculateNextBackupTime();
    const delay = nextBackup - Date.now();

    this.timer = setTimeout(async () => {
      try {
        const backupPath = await performanceDataManager.createBackup();
        const fileInfo = await performanceDataManager.getBackupInfo(backupPath);
        
        await this.updateStatistics(
          true,
          fileInfo.size,
          fileInfo.compressionSavings
        );

        if (this.schedule.notifications.onSuccess) {
          await this.sendNotification(
            'Backup Completed',
            `Successfully created backup (${(fileInfo.size / 1024 / 1024).toFixed(1)} MB)`
          );
        }

        this.schedule.lastBackup = Date.now();
        await this.saveSchedule();
        await this.applyRetentionPolicy();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
        
        await this.updateStatistics(false, 0, 0);
        
        if (this.schedule.notifications.onFailure) {
          await this.sendNotification(
            'Backup Failed',
            'Failed to create scheduled backup. Check the app for details.'
          );
        }
      }
      this.startScheduler(); // Schedule next backup
    }, delay);
  }

  private stopScheduler(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async setSchedule(schedule: Partial<BackupSchedule>): Promise<void> {
    this.schedule = { ...this.schedule, ...schedule };
    
    if (this.schedule.enabled) {
      this.startScheduler();
    } else {
      this.stopScheduler();
    }
    
    await this.saveSchedule();
  }

  getSchedule(): BackupSchedule {
    return { ...this.schedule };
  }

  async performBackup(): Promise<void> {
    try {
      const backupPath = await performanceDataManager.createBackup();
      const fileInfo = await performanceDataManager.getBackupInfo(backupPath);
      
      await this.updateStatistics(
        true,
        fileInfo.size,
        fileInfo.compressionSavings
      );

      this.schedule.lastBackup = Date.now();
      await this.saveSchedule();
      await this.applyRetentionPolicy();

      if (this.schedule.notifications.onSuccess) {
        await this.sendNotification(
          'Manual Backup Completed',
          `Successfully created backup (${(fileInfo.size / 1024 / 1024).toFixed(1)} MB)`
        );
      }
    } catch (error) {
      console.error('Manual backup failed:', error);
      
      await this.updateStatistics(false, 0, 0);
      
      if (this.schedule.notifications.onFailure) {
        await this.sendNotification(
          'Manual Backup Failed',
          'Failed to create backup. Check the app for details.'
        );
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const backupScheduler = BackupScheduler.getInstance(); 