import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { OfflineQueueManager } from './OfflineQueueManager';
import { PerformanceMonitor } from './PerformanceMonitoring';

declare module 'expo-background-fetch' {
  export type BackgroundFetchStatus = number;
  export enum BackgroundFetchResult {
    NoData = 1,
    NewData = 2,
    Failed = 3,
  }
  export function getStatusAsync(): Promise<BackgroundFetchStatus>;
  export function registerTaskAsync(taskName: string, options?: {
    minimumInterval: number;
    stopOnTerminate?: boolean;
    startOnBoot?: boolean;
  }): Promise<void>;
  export function unregisterTaskAsync(taskName: string): Promise<void>;
}

declare module 'expo-task-manager' {
  export function defineTask(taskName: string, callback: () => Promise<BackgroundFetch.BackgroundFetchResult>): void;
  export function isTaskRegisteredAsync(taskName: string): Promise<boolean>;
}

const SYNC_TASK = 'BACKGROUND_SYNC';

interface SyncStatus {
  isRegistered: boolean;
  status: BackgroundFetch.BackgroundFetchStatus | null;
}

export class BackgroundSyncManager {
  static async registerBackgroundSync(): Promise<void> {
    try {
      TaskManager.defineTask(SYNC_TASK, async () => {
        try {
          await OfflineQueueManager.processQueue();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error: unknown) {
          PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      PerformanceMonitor.addBreadcrumb('sync', 'Background sync registered');
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  static async unregisterBackgroundSync(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(SYNC_TASK);
      PerformanceMonitor.addBreadcrumb('sync', 'Background sync unregistered');
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  static async checkSyncStatus(): Promise<SyncStatus> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      return {
        isRegistered: await TaskManager.isTaskRegisteredAsync(SYNC_TASK),
        status: status
      };
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      return { isRegistered: false, status: null };
    }
  }
} 