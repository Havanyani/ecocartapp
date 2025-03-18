/**
 * LocalStorageService.ts
 * 
 * A comprehensive service for handling offline data storage and synchronization.
 * This service provides:
 * - Persistent storage with data expiration
 * - Offline data queue for actions that need to be synchronized when back online
 * - Data schemas and validation
 * - Automatic sync with the backend when connectivity is restored
 */

import { SafeStorage } from '@/utils/storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { z } from 'zod';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

// Constants
const STORAGE_PREFIX = '@EcoCart:';
const SYNC_QUEUE_KEY = `${STORAGE_PREFIX}syncQueue`;
const DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Types
export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
  version: number;
}

export interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
}

export type ValidationSchema<T> = z.ZodType<T>;

// Main LocalStorageService class
export class LocalStorageService {
  // Class properties to track state
  private static isInitialized = false;
  private static isOnline = true;
  private static syncInProgress = false;
  private static schemas = new Map<string, z.ZodType<any>>();
  private static syncHandlers = new Map<string, (item: SyncQueueItem) => Promise<boolean>>();
  private static dataVersions = new Map<string, number>();
  private static syncInterval: NodeJS.Timeout | null = null;
  private static networkListener: any = null;

  /**
   * Initialize the service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check initial network state
      const networkState = await NetInfo.fetch();
      this.isOnline = networkState.isConnected === true;

      // Set up network state listener
      this.networkListener = NetInfo.addEventListener((state: NetInfoState) => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected === true;

        // If we're coming back online, trigger sync
        if (wasOffline && this.isOnline) {
          this.synchronize();
        }
      });

      // Set up periodic sync (every 5 minutes)
      this.syncInterval = setInterval(() => {
        if (this.isOnline) {
          this.synchronize();
        }
      }, 5 * 60 * 1000);

      this.isInitialized = true;
      PerformanceMonitor.addBreadcrumb('storage', 'LocalStorageService initialized');
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error('Failed to initialize storage'));
    }
  }

  /**
   * Clean up when the app is closed or service is no longer needed
   */
  static cleanup(): void {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isInitialized = false;
  }

  /**
   * Register a schema for data validation
   */
  static registerSchema<T>(key: string, schema: ValidationSchema<T>, version: number = 1): void {
    this.schemas.set(key, schema);
    this.dataVersions.set(key, version);
  }

  /**
   * Register a sync handler for a specific action type
   */
  static registerSyncHandler(
    action: string, 
    handler: (item: SyncQueueItem) => Promise<boolean>
  ): void {
    this.syncHandlers.set(action, handler);
  }

  /**
   * Store data with optional validation and expiration
   */
  static async setItem<T>(
    key: string, 
    data: T, 
    options: { 
      expiry?: number;
      validate?: boolean;
      offlineSync?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const { expiry = DEFAULT_EXPIRY, validate = true, offlineSync = false } = options;
      
      // Validate data if schema exists
      if (validate && this.schemas.has(key)) {
        const schema = this.schemas.get(key)!;
        const validationResult = schema.safeParse(data);
        
        if (!validationResult.success) {
          throw new Error(`Data validation failed for ${key}: ${validationResult.error.message}`);
        }
      }
      
      // Create storage item
      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiry > 0 ? Date.now() + expiry : undefined,
        version: this.dataVersions.get(key) || 1
      };
      
      // Store data
      await SafeStorage.setItem(storageKey, JSON.stringify(storageItem));
      
      // Handle offline sync if needed
      if (offlineSync && !this.isOnline) {
        await this.addToSyncQueue('update', key, data);
      }
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to store data for ${key}`)
      );
      throw error;
    }
  }

  /**
   * Retrieve data with validation and expiry check
   */
  static async getItem<T>(
    key: string, 
    options: { 
      defaultValue?: T;
      validate?: boolean;
    } = {}
  ): Promise<T | null> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const { defaultValue = null, validate = true } = options;
      
      // Get data from storage
      const rawData = await SafeStorage.getItem(storageKey);
      
      if (rawData === null) {
        return defaultValue;
      }
      
      // Parse storage item
      const storageItem = JSON.parse(rawData) as StorageItem<T>;
      
      // Check if data has expired
      if (storageItem.expiry && storageItem.expiry < Date.now()) {
        await this.removeItem(key);
        return defaultValue;
      }
      
      // Validate data if schema exists
      if (validate && this.schemas.has(key)) {
        const schema = this.schemas.get(key)!;
        const validationResult = schema.safeParse(storageItem.data);
        
        if (!validationResult.success) {
          await this.removeItem(key);
          return defaultValue;
        }
      }
      
      return storageItem.data;
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to retrieve data for ${key}`)
      );
      return options.defaultValue || null;
    }
  }

  /**
   * Remove item from storage
   */
  static async removeItem(key: string, syncDelete: boolean = false): Promise<void> {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      await SafeStorage.removeItem(storageKey);
      
      // Handle offline sync if needed
      if (syncDelete && !this.isOnline) {
        await this.addToSyncQueue('delete', key, null);
      }
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to remove data for ${key}`)
      );
    }
  }

  /**
   * Manually trigger synchronization
   */
  static async synchronize(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      const queue = await this.getSyncQueue();
      
      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }
      
      PerformanceMonitor.addBreadcrumb('storage', `Processing sync queue with ${queue.length} items`);
      
      for (const item of queue) {
        await this.processSyncQueueItem(item);
      }
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to synchronize data')
      );
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Add action to the sync queue for offline processing
   */
  private static async addToSyncQueue(
    action: string, 
    key: string, 
    payload: any
  ): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      
      // Create unique ID for sync item
      const id = `${action}_${key}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Create sync queue item
      const syncItem: SyncQueueItem = {
        id,
        action,
        payload: {
          key,
          data: payload
        },
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 5
      };
      
      // Add to queue
      queue.push(syncItem);
      
      // Save updated queue
      await SafeStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      PerformanceMonitor.addBreadcrumb('storage', `Added ${action} operation for ${key} to sync queue`);
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to add item to sync queue')
      );
    }
  }

  /**
   * Process a sync queue item
   */
  private static async processSyncQueueItem(item: SyncQueueItem): Promise<boolean> {
    // Skip items that have exceeded max attempts
    if (item.attempts >= item.maxAttempts) {
      PerformanceMonitor.addBreadcrumb('storage', `Removing failed sync item ${item.id} after ${item.attempts} attempts`);
      await this.removeSyncQueueItem(item.id);
      return false;
    }
    
    // Increment attempts
    item.attempts++;
    
    try {
      // Check if we have a handler for this action
      if (this.syncHandlers.has(item.action)) {
        const handler = this.syncHandlers.get(item.action)!;
        const success = await handler(item);
        
        if (success) {
          // Remove from queue if successful
          await this.removeSyncQueueItem(item.id);
          return true;
        }
      } else {
        PerformanceMonitor.addBreadcrumb('storage', `No handler for sync action ${item.action}`);
        // Remove items without handlers
        await this.removeSyncQueueItem(item.id);
      }
      
      // Update item in queue with incremented attempts
      await this.updateSyncQueueItem(item);
      return false;
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to process sync item ${item.id}`)
      );
      
      // Update item in queue with incremented attempts
      await this.updateSyncQueueItem(item);
      return false;
    }
  }

  /**
   * Retrieve the sync queue
   */
  private static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await SafeStorage.getItem(SYNC_QUEUE_KEY);
      
      if (data) {
        return JSON.parse(data) as SyncQueueItem[];
      }
      
      return [];
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to retrieve sync queue')
      );
      return [];
    }
  }

  /**
   * Update a sync queue item
   */
  private static async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const index = queue.findIndex(i => i.id === item.id);
      
      if (index !== -1) {
        queue[index] = item;
        await SafeStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to update sync item ${item.id}`)
      );
    }
  }

  /**
   * Remove a sync queue item
   */
  private static async removeSyncQueueItem(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter(item => item.id !== id);
      await SafeStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error(`Failed to remove sync item ${id}`)
      );
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await SafeStorage.getAllKeys();
      const ecoCartKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      if (ecoCartKeys.length > 0) {
        await SafeStorage.multiRemove(ecoCartKeys);
      }
      
      PerformanceMonitor.addBreadcrumb('storage', `Cleared all storage (${ecoCartKeys.length} items)`);
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to clear storage')
      );
    }
  }

  /**
   * Clear expired items
   */
  static async clearExpired(): Promise<number> {
    try {
      const keys = await SafeStorage.getAllKeys();
      const ecoCartKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      let removedCount = 0;
      
      for (const key of ecoCartKeys) {
        const rawData = await SafeStorage.getItem(key);
        
        if (rawData) {
          try {
            const storageItem = JSON.parse(rawData) as StorageItem<any>;
            
            if (storageItem.expiry && storageItem.expiry < Date.now()) {
              await SafeStorage.removeItem(key);
              removedCount++;
            }
          } catch (e) {
            // Skip invalid items
          }
        }
      }
      
      return removedCount;
    } catch (error) {
      PerformanceMonitor.captureError(
        error instanceof Error ? error : new Error('Failed to clear expired items')
      );
      return 0;
    }
  }
}

// Export default for convenience
export default LocalStorageService; 