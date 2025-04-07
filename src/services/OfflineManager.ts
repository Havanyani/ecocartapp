/**
 * OfflineManager.ts
 * 
 * Comprehensive service for managing offline data operations in the EcoCart app.
 * Coordinates between StorageService, SyncService, and ConflictResolution.
 */

import apiClient from '@/api/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { ConflictResolution, ResolutionStrategy } from './ConflictResolution';
import { SyncService } from './SyncService';

// Entity types that can be stored offline
export type EntityType = 
  | 'collection'
  | 'user'
  | 'impact'
  | 'material'
  | 'achievement'
  | 'challenge'
  | 'order'
  | 'feedback';

// Operation types for offline actions
export type OperationType = 'create' | 'update' | 'delete' | 'query';

// Status of offline operations
export type OfflineStatus = 'online' | 'offline' | 'syncing';

// Offline operation configuration
export interface OfflineOperationConfig {
  priority: 'high' | 'medium' | 'low';
  ttl?: number; // Time-to-live for cached data in milliseconds
  conflictStrategy?: ResolutionStrategy;
}

// Queue item for offline operations
export interface OfflineQueueItem<T = any> {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  data: T;
  entityId?: string;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  error?: string;
}

// Default configurations by entity type
const DEFAULT_CONFIGS: Record<EntityType, OfflineOperationConfig> = {
  collection: { priority: 'high', ttl: 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.LATEST_WINS },
  user: { priority: 'high', ttl: 7 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.REMOTE_WINS },
  impact: { priority: 'medium', ttl: 3 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.MERGE },
  material: { priority: 'medium', ttl: 7 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.REMOTE_WINS },
  achievement: { priority: 'low', ttl: 7 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.REMOTE_WINS },
  challenge: { priority: 'medium', ttl: 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.REMOTE_WINS },
  order: { priority: 'high', ttl: 3 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.LATEST_WINS },
  feedback: { priority: 'low', ttl: 7 * 24 * 60 * 60 * 1000, conflictStrategy: ResolutionStrategy.LOCAL_WINS },
};

// Cache statistics
export interface CacheStats {
  totalItems: number;
  byEntityType: Record<EntityType, number>;
  lastUpdated: number;
  cacheSize: number; // Approximate size in bytes
}

// Sync statistics
export interface SyncStats {
  pendingActions: number;
  lastSync: number | null;
  syncSuccess: boolean;
  failedActions: number;
  byEntityType: Record<EntityType, number>;
}

// Storage keys
const OFFLINE_QUEUE_KEY = '@ecocart:offline_queue';
const OFFLINE_CACHE_PREFIX = '@ecocart:offline_cache:';
const LAST_SYNC_KEY = '@ecocart:last_sync';
const OFFLINE_STATS_KEY = '@ecocart:offline_stats';

/**
 * Main class for managing offline operations
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private syncService: SyncService;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private appStateSubscription: any = null;
  private isOnline: boolean = true;
  private _status: OfflineStatus = 'online';
  private statusListeners: ((status: OfflineStatus) => void)[] = [];
  private offlineQueue: OfflineQueueItem[] = [];
  private processingQueue: boolean = false;
  private maxRetries: number = 5;
  private syncInterval: any = null;
  private syncIntervalTime: number = 60000; // 1 minute
  private initialized: boolean = false;
  
  // Maps to store entity type specific merge functions
  private mergeFunctions: Map<string, (local: any, remote: any) => any> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.syncService = SyncService.getInstance();
  }

  /**
   * Get the singleton instance of OfflineManager
   */
  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Initialize the offline manager
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load offline queue
      await this.loadOfflineQueue();
      
      // Initialize network listeners
      this.initNetworkListeners();
      
      // Initialize app state listeners
      this.initAppStateListeners();
      
      // Start sync interval
      this.startSyncInterval();
      
      this.initialized = true;
      console.log('OfflineManager initialized successfully');
      
      // Check network status
      const networkState = await NetInfo.fetch();
      await this.handleNetworkChange(networkState);
      
    } catch (error) {
      console.error('Error initializing OfflineManager:', error);
      throw error;
    }
  }

  /**
   * Initialize network listeners
   */
  private initNetworkListeners(): void {
    this.netInfoSubscription = NetInfo.addEventListener(this.handleNetworkChange);
  }

  /**
   * Initialize app state listeners
   */
  private initAppStateListeners(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = async (state: NetInfoState): Promise<void> => {
    const isConnected = state.isConnected === true && state.isInternetReachable !== false;
    
    // Only trigger actions if network status has changed
    if (this.isOnline !== isConnected) {
      this.isOnline = isConnected;
      
      if (isConnected) {
        // If coming back online, process queue
        this.updateStatus('syncing');
        await this.processOfflineQueue();
        this.updateStatus('online');
      } else {
        this.updateStatus('offline');
      }
    }
  };

  /**
   * Handle app state changes
   */
  private handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    if (nextAppState === 'active' && this.isOnline) {
      // When app comes to foreground, try to sync
      this.updateStatus('syncing');
      await this.processOfflineQueue();
      this.updateStatus(this.isOnline ? 'online' : 'offline');
    }
  };

  /**
   * Update offline status and notify listeners
   */
  private updateStatus(status: OfflineStatus): void {
    this._status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Start automatic sync interval
   */
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        try {
          this.updateStatus('syncing');
          await this.processOfflineQueue();
          this.updateStatus('online');
        } catch (error) {
          console.error('Error processing queue on interval:', error);
          this.updateStatus('online');
        }
      }
    }, this.syncIntervalTime);
  }

  /**
   * Subscribe to offline status changes
   */
  public subscribeToStatusChanges(callback: (status: OfflineStatus) => void): () => void {
    this.statusListeners.push(callback);
    
    // Immediately call with current status
    callback(this._status);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Get current offline status
   */
  public getStatus(): OfflineStatus {
    return this._status;
  }

  /**
   * Execute an operation with automatic offline handling
   */
  public async executeWithOfflineHandling<T>(params: {
    entityType: EntityType;
    operation: OperationType;
    data: T;
    entityId?: string;
    apiCall?: () => Promise<T>;
    config?: Partial<OfflineOperationConfig>;
  }): Promise<T> {
    // Ensure we're initialized
    if (!this.initialized) {
      await this.initialize();
    }
    
    const { entityType, operation, data, entityId, apiCall, config } = params;
    
    // Merge config with defaults
    const operationConfig = {
      ...DEFAULT_CONFIGS[entityType],
      ...config
    };
    
    // For read operations, try to get from cache first
    if (operation === 'query') {
      try {
        // If we have a cached version and it's not expired, return it
        const cacheKey = `${entityType}:${entityId || 'list'}`;
        const cachedData = await this.getCachedData<T>(cacheKey);
        
        if (cachedData) {
          return cachedData;
        }
      } catch (error) {
        console.error('Error accessing cache:', error);
      }
    }
    
    // If online and we have an API call function, execute it directly
    if (this.isOnline && apiCall) {
      try {
        const result = await apiCall();
        
        // Cache the result if it's a read operation
        if (operation === 'query') {
          const cacheKey = `${entityType}:${entityId || 'list'}`;
          await this.cacheData(cacheKey, result, operationConfig.ttl || 0);
        }
        
        return result;
      } catch (error) {
        console.error(`Error executing operation online:`, error);
        
        // If it's a read operation, try to get from cache as fallback
        if (operation === 'query') {
          const cacheKey = `${entityType}:${entityId || 'list'}`;
          const cachedData = await this.getCachedData<T>(cacheKey);
          
          if (cachedData) {
            return cachedData;
          }
        }
        
        // For write operations, fall back to offline queue
        if (operation !== 'query') {
          return this.addToQueue<T>({
            entityType,
            operation,
            data,
            entityId,
            priority: operationConfig.priority
          });
        }
        
        throw error;
      }
    } else {
      // We're offline or no API call function was provided
      
      // For write operations, add to offline queue
      if (operation !== 'query') {
        return this.addToQueue<T>({
          entityType,
          operation,
          data,
          entityId,
          priority: operationConfig.priority
        });
      }
      
      // For read operations, try to get from cache
      const cacheKey = `${entityType}:${entityId || 'list'}`;
      const cachedData = await this.getCachedData<T>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // No cached data available
      throw new Error(`No cached data available for ${entityType}${entityId ? `:${entityId}` : ''}`);
    }
  }

  /**
   * Add an operation to the offline queue
   */
  private async addToQueue<T>(params: {
    entityType: EntityType;
    operation: OperationType;
    data: T;
    entityId?: string;
    priority: 'high' | 'medium' | 'low';
  }): Promise<T> {
    const { entityType, operation, data, entityId, priority } = params;
    
    // Generate a unique ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create queue item
    const queueItem: OfflineQueueItem<T> = {
      id,
      entityType,
      operation,
      data,
      entityId,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };
    
    // Add to queue
    this.offlineQueue.push(queueItem);
    
    // Sort by priority then timestamp
    this.sortQueue();
    
    // Save queue
    await this.saveOfflineQueue();
    
    // For create operations, cache the data immediately
    if (operation === 'create') {
      const cacheKey = `${entityType}:${id}`;
      await this.cacheData(cacheKey, data, DEFAULT_CONFIGS[entityType].ttl || 0);
    }
    
    // For update operations, update cache
    if (operation === 'update' && entityId) {
      const cacheKey = `${entityType}:${entityId}`;
      await this.cacheData(cacheKey, data, DEFAULT_CONFIGS[entityType].ttl || 0);
    }
    
    // Return the data that would have been returned by the API
    return data;
  }

  /**
   * Process the offline queue
   */
  public async processOfflineQueue(): Promise<void> {
    // Skip if we're already processing or if we're offline
    if (this.processingQueue || !this.isOnline) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      // Process queue items in order
      const queueToProcess = [...this.offlineQueue];
      
      for (const item of queueToProcess) {
        try {
          // Execute the operation
          await this.executeOperation(item);
          
          // Remove from queue if successful
          this.removeFromQueue(item.id);
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          
          // Update retry count
          this.updateQueueItem(item.id, {
            retryCount: item.retryCount + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          // If max retries reached, move to the end of the queue
          if (item.retryCount >= this.maxRetries) {
            const updatedItem = this.offlineQueue.find(i => i.id === item.id);
            if (updatedItem) {
              // Move to end of queue with lower priority
              this.removeFromQueue(item.id);
              updatedItem.priority = 'low';
              updatedItem.timestamp = Date.now(); // Update timestamp
              this.offlineQueue.push(updatedItem);
            }
          }
        }
      }
      
      // Save the updated queue
      await this.saveOfflineQueue();
      
      // Update last sync timestamp
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Execute a single operation from the queue
   */
  private async executeOperation(item: OfflineQueueItem): Promise<void> {
    const { entityType, operation, data, entityId } = item;
    
    switch (operation) {
      case 'create':
        await this.executeApiCall(`/${entityType}`, 'POST', data);
        break;
        
      case 'update':
        if (!entityId) {
          throw new Error(`Entity ID is required for update operations`);
        }
        await this.executeApiCall(`/${entityType}/${entityId}`, 'PUT', data);
        break;
        
      case 'delete':
        if (!entityId) {
          throw new Error(`Entity ID is required for delete operations`);
        }
        await this.executeApiCall(`/${entityType}/${entityId}`, 'DELETE');
        
        // Remove from cache
        const cacheKey = `${entityType}:${entityId}`;
        await this.removeCachedData(cacheKey);
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  /**
   * Execute an API call
   */
  private async executeApiCall(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      let response;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`API call failed (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Remove an item from the queue
   */
  private removeFromQueue(id: string): void {
    this.offlineQueue = this.offlineQueue.filter(item => item.id !== id);
  }

  /**
   * Update a queue item
   */
  private updateQueueItem(id: string, updates: Partial<OfflineQueueItem>): void {
    const index = this.offlineQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.offlineQueue[index] = {
        ...this.offlineQueue[index],
        ...updates
      };
    }
  }

  /**
   * Sort the queue by priority and timestamp
   */
  private sortQueue(): void {
    // Define priority order
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    this.offlineQueue.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // Then sort by timestamp (oldest first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Load the offline queue from storage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      } else {
        this.offlineQueue = [];
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Save the offline queue to storage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Cache data for offline use
   */
  private async cacheData<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };
      
      await AsyncStorage.setItem(
        `${OFFLINE_CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error(`Error caching data for ${key}:`, error);
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cacheData = await AsyncStorage.getItem(`${OFFLINE_CACHE_PREFIX}${key}`);
      
      if (!cacheData) {
        return null;
      }
      
      const { data, expiry } = JSON.parse(cacheData);
      
      // Check if expired
      if (Date.now() > expiry) {
        // Remove expired data
        await AsyncStorage.removeItem(`${OFFLINE_CACHE_PREFIX}${key}`);
        return null;
      }
      
      return data as T;
    } catch (error) {
      console.error(`Error getting cached data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  private async removeCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${OFFLINE_CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Error removing cached data for ${key}:`, error);
    }
  }

  /**
   * Clear all cached data
   */
  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(OFFLINE_CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): {
    totalItems: number;
    pending: number;
    byEntityType: Record<string, number>;
    byOperation: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const stats = {
      totalItems: this.offlineQueue.length,
      pending: this.offlineQueue.length,
      byEntityType: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };
    
    // Calculate stats
    for (const item of this.offlineQueue) {
      // Count by entity type
      stats.byEntityType[item.entityType] = (stats.byEntityType[item.entityType] || 0) + 1;
      
      // Count by operation
      stats.byOperation[item.operation] = (stats.byOperation[item.operation] || 0) + 1;
      
      // Count by priority
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Get pending queue items
   */
  public getPendingItems(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  /**
   * Force sync data
   */
  public async forceSyncData(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }
    
    this.updateStatus('syncing');
    try {
      await this.processOfflineQueue();
      this.updateStatus('online');
      return true;
    } catch (error) {
      console.error('Error forcing sync:', error);
      this.updateStatus('online');
      return false;
    }
  }

  /**
   * Register a merge function for a specific entity type
   */
  public registerMergeFunction<T>(
    entityType: EntityType | string,
    mergeFn: (local: T, remote: T) => T
  ): void {
    this.mergeFunctions.set(entityType, mergeFn);
    
    // Also register with ConflictResolution service
    ConflictResolution.registerMergeFunction(entityType, mergeFn);
  }

  /**
   * Resolve a conflict between local and remote data
   */
  public async resolveConflict<T>(
    entityType: EntityType | string,
    localData: T,
    remoteData: T,
    conflictStrategy?: ResolutionStrategy
  ): Promise<T> {
    // Get strategy
    const strategy = conflictStrategy || 
      (DEFAULT_CONFIGS[entityType as EntityType]?.conflictStrategy || ResolutionStrategy.REMOTE_WINS);
    
    return ConflictResolution.resolveConflict(
      entityType,
      localData,
      remoteData,
      strategy
    );
  }

  /**
   * Cleanup and release resources
   */
  public cleanup(): void {
    // Clean up network listener
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    
    // Clean up app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Clear sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();
export default offlineManager; 