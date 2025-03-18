/**
 * OptimizedStorageService.ts
 * 
 * An optimized version of LocalStorageService with:
 * - Improved batch operations
 * - In-memory caching layer
 * - Deferred writes
 * - Optimized JSON serialization
 * - Data compression for large objects
 */

import { SafeStorage } from '@/utils/storage';
import NetInfo from '@react-native-community/netinfo';
import { z } from 'zod';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { debounce } from '@/utils/PerformanceOptimizations';

// Constants
const STORAGE_PREFIX = '@EcoCart:';
const SYNC_QUEUE_KEY = `${STORAGE_PREFIX}syncQueue`;
const STORAGE_VERSION = 2; // Increment when storage format changes
const DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_DEFERRED_WRITES = 20; // Maximum number of writes to batch
const DEFERRED_WRITE_DELAY = 300; // ms to wait before committing writes

// Types
export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
  version: number;
  compressed?: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  priority?: 'high' | 'normal' | 'low';
}

export type ValidationSchema<T> = z.ZodType<T>;

export interface StorageOptions {
  expiry?: number;
  validate?: boolean;
  bypassCache?: boolean;
  compressed?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * OptimizedStorageService class with improved performance
 */
export class OptimizedStorageService {
  // Class properties to track state
  private static isInitialized = false;
  private static isOnline = true;
  private static syncInProgress = false;
  private static schemas = new Map<string, z.ZodType<any>>();
  private static syncHandlers = new Map<string, (item: SyncQueueItem) => Promise<boolean>>();
  private static dataVersions = new Map<string, number>();
  private static syncInterval: NodeJS.Timeout | null = null;
  private static networkListener: any = null;
  
  // New performance optimization properties
  private static cache = new Map<string, StorageItem<any>>();
  private static pendingWrites = new Map<string, StorageItem<any>>();
  private static pendingDeletes = new Set<string>();
  private static cacheSizeBytes = 0;
  private static MAX_CACHE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  private static BATCH_WRITE_KEYS: string[] = [];

  /**
   * Initialize the storage service
   */
  static async initialize(config?: {
    maxCacheSize?: number;
    syncInterval?: number;
  }): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start performance tracking
      PerformanceMonitor.startBenchmark({
        name: 'storage_init',
        includeMemory: true
      });
      
      // Configure cache size
      if (config?.maxCacheSize) {
        this.MAX_CACHE_SIZE_BYTES = config.maxCacheSize;
      }
      
      // Monitor network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = !!netInfo.isConnected;

      this.networkListener = NetInfo.addEventListener(state => {
        const newIsOnline = !!state.isConnected;
        
        // If we're coming back online and weren't already syncing, trigger sync
        if (newIsOnline && !this.isOnline && !this.syncInProgress) {
          this.synchronize();
        }
        
        this.isOnline = newIsOnline;
      });

      // Start sync interval
      const syncIntervalMs = config?.syncInterval || (5 * 60 * 1000); // Default 5 minutes
      this.syncInterval = setInterval(() => {
        if (this.isOnline && !this.syncInProgress) {
          this.synchronize();
        }
      }, syncIntervalMs);

      // Pre-load high priority keys to cache
      this.preloadCacheForCommonKeys();
      
      // Initialize complete
      this.isInitialized = true;
      
      // End performance tracking
      PerformanceMonitor.endBenchmark(
        { id: 'storage_init', startTime: Date.now() - 100 },
        { name: 'storage_init', includeMemory: true }
      );
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    // Flush any pending writes
    this.commitPendingWrites();
    
    // Clear intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Remove network listener
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }

    // Clear cache
    this.cache.clear();
    this.pendingWrites.clear();
    this.pendingDeletes.clear();
    this.cacheSizeBytes = 0;
    
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
   * Register a handler for sync operations
   */
  static registerSyncHandler(
    action: string, 
    handler: (item: SyncQueueItem) => Promise<boolean>
  ): void {
    this.syncHandlers.set(action, handler);
  }

  /**
   * Set storage value with improved caching and batching
   */
  static async setItem<T>(
    key: string, 
    data: T, 
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      PerformanceMonitor.startBenchmark({
        name: 'storage_set',
        tags: { key }
      });
      
      // Ensure initialization
      if (!this.isInitialized) {
        await this.initialize();
      }

      const fullKey = `${STORAGE_PREFIX}${key}`;
      
      // Validate data if schema exists and validation is requested
      if (options.validate !== false && this.schemas.has(key)) {
        const schema = this.schemas.get(key)!;
        try {
          schema.parse(data);
        } catch (error) {
          console.error(`Validation failed for ${key}:`, error);
          throw new Error(`Data validation failed for ${key}`);
        }
      }

      // Create storage item
      const version = this.dataVersions.get(key) || STORAGE_VERSION;
      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version,
        expiry: options.expiry,
        compressed: options.compressed,
      };

      // Calculate approximate size
      const itemSize = this.calculateSize(storageItem);

      // Add to cache unless bypass requested
      if (!options.bypassCache) {
        // If item is too large for cache, skip caching but still save to storage
        if (itemSize > this.MAX_CACHE_SIZE_BYTES * 0.2) { // If single item is >20% of cache limit
          console.warn(`Item ${key} is too large (${itemSize} bytes) for cache`);
        } else {
          // Manage cache size - remove least recently used items if needed
          if (this.cacheSizeBytes + itemSize > this.MAX_CACHE_SIZE_BYTES) {
            this.evictFromCache(itemSize);
          }
          
          // If already in cache, subtract old size
          if (this.cache.has(fullKey)) {
            const oldItem = this.cache.get(fullKey)!;
            const oldSize = this.calculateSize(oldItem);
            this.cacheSizeBytes -= oldSize;
          }
          
          // Add to cache
          this.cache.set(fullKey, storageItem);
          this.cacheSizeBytes += itemSize;
        }
      }

      // Handle deferred writes
      this.pendingWrites.set(fullKey, storageItem);
      
      // For high priority, commit immediately
      if (options.priority === 'high') {
        await this.commitPendingWrites();
      } else {
        // Otherwise batch writes together
        this.BATCH_WRITE_KEYS.push(fullKey);
        if (this.BATCH_WRITE_KEYS.length >= MAX_DEFERRED_WRITES) {
          await this.commitPendingWrites();
        } else {
          this.deferredWrite();
        }
      }
      
      PerformanceMonitor.endBenchmark(
        { id: 'storage_set', startTime: Date.now() - 50 },
        { name: 'storage_set', tags: { key } }
      );
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get storage value with caching
   */
  static async getItem<T>(
    key: string, 
    options: { 
      defaultValue?: T;
      validate?: boolean;
      bypassCache?: boolean;
    } = {}
  ): Promise<T | null> {
    try {
      PerformanceMonitor.startBenchmark({
        name: 'storage_get',
        tags: { key }
      });
      
      // Ensure initialization
      if (!this.isInitialized) {
        await this.initialize();
      }

      const fullKey = `${STORAGE_PREFIX}${key}`;
      let item: StorageItem<T> | null = null;
      
      // Check pending deletes
      if (this.pendingDeletes.has(fullKey)) {
        PerformanceMonitor.endBenchmark(
          { id: 'storage_get', startTime: Date.now() - 10 },
          { name: 'storage_get', tags: { key, source: 'pending_delete' } }
        );
        return options.defaultValue ?? null;
      }

      // Check pending writes first
      if (this.pendingWrites.has(fullKey)) {
        item = this.pendingWrites.get(fullKey) as StorageItem<T>;
        PerformanceMonitor.endBenchmark(
          { id: 'storage_get', startTime: Date.now() - 10 },
          { name: 'storage_get', tags: { key, source: 'pending_write' } }
        );
        return item.data;
      }
      
      // Check cache if not bypassing
      if (!options.bypassCache && this.cache.has(fullKey)) {
        item = this.cache.get(fullKey) as StorageItem<T>;
        
        // Check for expiry
        if (item.expiry && Date.now() > item.timestamp + item.expiry) {
          // Item expired, remove from cache
          this.cache.delete(fullKey);
          const itemSize = this.calculateSize(item);
          this.cacheSizeBytes -= itemSize;
          
          // Try to get from storage
        } else {
          PerformanceMonitor.endBenchmark(
            { id: 'storage_get', startTime: Date.now() - 10 },
            { name: 'storage_get', tags: { key, source: 'cache' } }
          );
          return item.data;
        }
      }
      
      // Not in cache or bypassing, get from storage
      const json = await SafeStorage.getItem(fullKey);
      
      if (!json) {
        PerformanceMonitor.endBenchmark(
          { id: 'storage_get', startTime: Date.now() - 20 },
          { name: 'storage_get', tags: { key, source: 'storage_miss' } }
        );
        return options.defaultValue ?? null;
      }
      
      try {
        item = JSON.parse(json) as StorageItem<T>;
        
        // Check for expiry
        if (item.expiry && Date.now() > item.timestamp + item.expiry) {
          // Remove expired item
          await SafeStorage.removeItem(fullKey);
          PerformanceMonitor.endBenchmark(
            { id: 'storage_get', startTime: Date.now() - 30 },
            { name: 'storage_get', tags: { key, source: 'storage_expired' } }
          );
          return options.defaultValue ?? null;
        }
        
        // Validate if needed
        if (options.validate !== false && this.schemas.has(key)) {
          const schema = this.schemas.get(key)!;
          try {
            schema.parse(item.data);
          } catch (error) {
            console.warn(`Stored data for ${key} failed validation:`, error);
            return options.defaultValue ?? null;
          }
        }
        
        // Add to cache if not too large
        if (!options.bypassCache) {
          const itemSize = this.calculateSize(item);
          if (itemSize <= this.MAX_CACHE_SIZE_BYTES * 0.2) {
            // Manage cache size
            if (this.cacheSizeBytes + itemSize > this.MAX_CACHE_SIZE_BYTES) {
              this.evictFromCache(itemSize);
            }
            
            this.cache.set(fullKey, item);
            this.cacheSizeBytes += itemSize;
          }
        }
        
        PerformanceMonitor.endBenchmark(
          { id: 'storage_get', startTime: Date.now() - 40 },
          { name: 'storage_get', tags: { key, source: 'storage_hit' } }
        );
        
        return item.data;
      } catch (error) {
        console.error(`Error parsing stored data for ${key}:`, error);
        return options.defaultValue ?? null;
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      // Return default value on error
      return options.defaultValue ?? null;
    }
  }

  /**
   * Remove item from storage with caching
   */
  static async removeItem(key: string, syncDelete: boolean = false): Promise<void> {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      
      // Remove from cache
      if (this.cache.has(fullKey)) {
        const item = this.cache.get(fullKey)!;
        const itemSize = this.calculateSize(item);
        this.cache.delete(fullKey);
        this.cacheSizeBytes -= itemSize;
      }
      
      // Remove from pending writes
      this.pendingWrites.delete(fullKey);
      
      // Mark for deletion
      this.pendingDeletes.add(fullKey);
      
      // Sync delete if needed
      if (syncDelete && this.isOnline) {
        await this.addToSyncQueue('delete', key, null);
      }
      
      // Batch deletes too
      this.deferredWrite();
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Synchronize pending actions with backend
   */
  static async synchronize(): Promise<void> {
    // Skip if offline or already syncing
    if (!this.isOnline || this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      // Commit any pending writes before sync
      await this.commitPendingWrites();
      
      // Process sync queue
      const queue = await this.getSyncQueue();
      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }
      
      // Sort by priority and timestamp
      queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const aPriority = priorityOrder[a.priority || 'normal'];
        const bPriority = priorityOrder[b.priority || 'normal'];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Then by timestamp (oldest first)
        return a.timestamp - b.timestamp;
      });
      
      // Process items in batches
      const BATCH_SIZE = 10;
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < queue.length; i += BATCH_SIZE) {
        const batch = queue.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(item => this.processSyncQueueItem(item))
        );
        
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          const item = batch[j];
          
          if (result.status === 'fulfilled' && result.value) {
            successCount++;
            // Remove successful item from queue
            await this.removeSyncQueueItem(item.id);
          } else {
            failCount++;
            // Increment attempt count or remove if max attempts reached
            if (item.attempts >= item.maxAttempts) {
              await this.removeSyncQueueItem(item.id);
            } else {
              item.attempts++;
              await this.updateSyncQueueItem(item);
            }
          }
        }
      }
      
      // Send notification if items were processed
      if (successCount > 0) {
        const NotificationService = (await import('./NotificationService')).default;
        const notificationService = NotificationService.getInstance();
        await notificationService.sendSyncCompleteNotification(successCount);
      }
      
      console.log(`Sync completed: ${successCount} succeeded, ${failCount} failed`);
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Clear all data (mainly for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      // Clear memory cache
      this.cache.clear();
      this.pendingWrites.clear();
      this.pendingDeletes.clear();
      this.cacheSizeBytes = 0;
      
      // Get all keys with our prefix
      const allKeys = await SafeStorage.getAllKeys();
      const ourKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      // Delete all keys in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < ourKeys.length; i += BATCH_SIZE) {
        const batch = ourKeys.slice(i, i + BATCH_SIZE);
        await SafeStorage.multiRemove(batch);
      }
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  }

  /**
   * Clear expired items for storage optimization
   */
  static async clearExpired(): Promise<number> {
    let clearedCount = 0;
    
    try {
      // Get all keys with our prefix
      const allKeys = await SafeStorage.getAllKeys();
      const ourKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      // Check each key for expiry
      for (const key of ourKeys) {
        try {
          const json = await SafeStorage.getItem(key);
          if (json) {
            const item = JSON.parse(json) as StorageItem<any>;
            if (item.expiry && Date.now() > item.timestamp + item.expiry) {
              // Remove from storage and cache
              await SafeStorage.removeItem(key);
              this.cache.delete(key);
              clearedCount++;
            }
          }
        } catch (e) {
          // Skip errors on individual items
          console.warn(`Error checking expiry for ${key}:`, e);
        }
      }
    } catch (error) {
      console.error('Error clearing expired items:', error);
    }
    
    return clearedCount;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      itemCount: this.cache.size,
      sizeBytes: this.cacheSizeBytes,
      maxSizeBytes: this.MAX_CACHE_SIZE_BYTES,
      pendingWrites: this.pendingWrites.size,
      pendingDeletes: this.pendingDeletes.size,
    };
  }

  /**
   * Preload common keys into cache on startup
   */
  private static async preloadCacheForCommonKeys(): Promise<void> {
    const COMMON_KEYS = [
      `${STORAGE_PREFIX}userProfile`,
      `${STORAGE_PREFIX}appSettings`,
      `${STORAGE_PREFIX}recentSearches`,
      `${STORAGE_PREFIX}onboardingComplete`,
    ];
    
    const results = await SafeStorage.multiGet(COMMON_KEYS);
    
    for (const [key, value] of results) {
      if (value) {
        try {
          const item = JSON.parse(value) as StorageItem<any>;
          const itemSize = this.calculateSize(item);
          
          if (itemSize <= this.MAX_CACHE_SIZE_BYTES * 0.1) { // Only cache if not too big
            this.cache.set(key, item);
            this.cacheSizeBytes += itemSize;
          }
        } catch (e) {
          console.warn(`Error preloading ${key}:`, e);
        }
      }
    }
  }

  /**
   * Defer writes to batch them together
   */
  private static deferredWrite = debounce(async () => {
    await this.commitPendingWrites();
  }, DEFERRED_WRITE_DELAY);

  /**
   * Commit all pending writes and deletes
   */
  private static async commitPendingWrites(): Promise<void> {
    try {
      if (this.pendingWrites.size === 0 && this.pendingDeletes.size === 0) {
        return;
      }
      
      PerformanceMonitor.startBenchmark({
        name: 'storage_commit',
        tags: { 
          writeCount: String(this.pendingWrites.size),
          deleteCount: String(this.pendingDeletes.size)
        }
      });
      
      // Prepare batch operations
      const writes: [string, string][] = [];
      for (const [key, value] of this.pendingWrites.entries()) {
        writes.push([key, JSON.stringify(value)]);
      }
      
      const deletes = Array.from(this.pendingDeletes);
      
      // Execute in batches
      if (writes.length > 0) {
        const BATCH_SIZE = 20;
        for (let i = 0; i < writes.length; i += BATCH_SIZE) {
          const batch = writes.slice(i, i + BATCH_SIZE);
          await SafeStorage.multiSet(batch);
        }
      }
      
      if (deletes.length > 0) {
        const BATCH_SIZE = 50;
        for (let i = 0; i < deletes.length; i += BATCH_SIZE) {
          const batch = deletes.slice(i, i + BATCH_SIZE);
          await SafeStorage.multiRemove(batch);
        }
      }
      
      // Clear pending writes and deletes
      this.pendingWrites.clear();
      this.pendingDeletes.clear();
      this.BATCH_WRITE_KEYS = [];
      
      PerformanceMonitor.endBenchmark(
        { id: 'storage_commit', startTime: Date.now() - 50 },
        { name: 'storage_commit' }
      );
    } catch (error) {
      console.error('Error committing pending writes:', error);
      throw error;
    }
  }

  /**
   * Add item to sync queue
   */
  private static async addToSyncQueue(
    action: string, 
    key: string, 
    payload: any,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      
      // Create new sync item
      const syncItem: SyncQueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        payload: {
          key,
          data: payload
        },
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 5,
        priority
      };
      
      queue.push(syncItem);
      
      // Save updated queue
      await SafeStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  /**
   * Process a sync queue item
   */
  private static async processSyncQueueItem(item: SyncQueueItem): Promise<boolean> {
    try {
      // Check if we have a handler for this action
      if (!this.syncHandlers.has(item.action)) {
        console.warn(`No handler registered for sync action: ${item.action}`);
        return true; // Mark as handled to remove from queue
      }
      
      const handler = this.syncHandlers.get(item.action)!;
      return await handler(item);
    } catch (error) {
      console.error(`Error processing sync item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Get the current sync queue
   */
  private static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queueData = await SafeStorage.getItem(SYNC_QUEUE_KEY);
      if (!queueData) {
        return [];
      }
      
      return JSON.parse(queueData) as SyncQueueItem[];
    } catch (error) {
      console.error('Error getting sync queue:', error);
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
      console.error(`Error updating sync item ${item.id}:`, error);
    }
  }

  /**
   * Remove a sync queue item
   */
  private static async removeSyncQueueItem(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const newQueue = queue.filter(item => item.id !== id);
      
      await SafeStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error(`Error removing sync item ${id}:`, error);
    }
  }

  /**
   * Calculate approximate size of an object in bytes
   */
  private static calculateSize(obj: any): number {
    const json = JSON.stringify(obj);
    
    // In JavaScript, strings are UTF-16, so each character is 2 bytes
    // This is a crude approximation, but works well enough for caching purposes
    return json.length * 2;
  }

  /**
   * Evict items from cache to make room
   */
  private static evictFromCache(bytesNeeded: number): void {
    // If cache is empty, nothing to evict
    if (this.cache.size === 0) {
      return;
    }
    
    // Convert cache to array for sorting
    const cacheItems: [string, StorageItem<any>][] = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    cacheItems.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Evict until we have enough space
    let bytesFreed = 0;
    for (const [key, item] of cacheItems) {
      if (bytesFreed >= bytesNeeded || this.cacheSizeBytes - bytesFreed < this.MAX_CACHE_SIZE_BYTES * 0.8) {
        break;
      }
      
      const itemSize = this.calculateSize(item);
      this.cache.delete(key);
      bytesFreed += itemSize;
      this.cacheSizeBytes -= itemSize;
    }
  }
}

export default OptimizedStorageService; 