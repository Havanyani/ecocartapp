/**
 * OfflineManager.ts
 * 
 * Comprehensive service for managing offline data operations in the EcoCart app.
 * Coordinates between OfflineStorageService, SyncService, and ConflictResolution.
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { ConflictResolution, ResolutionStrategy } from './ConflictResolution';
import { OfflineStorageService } from './OfflineStorageService';
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

/**
 * Main class for managing offline operations
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private offlineStorage: OfflineStorageService;
  private syncService: SyncService;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private appStateSubscription: any = null;
  private networkStatus: boolean = true;
  private _status: OfflineStatus = 'online';
  private statusListeners: ((status: OfflineStatus) => void)[] = [];

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
    this.syncService = SyncService.getInstance();
    this.initNetworkListeners();
    this.initAppStateListeners();
    
    // Register merge functions for different entity types
    this.registerMergeFunctions();
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
   * Initialize network state listeners
   */
  private initNetworkListeners(): void {
    this.netInfoSubscription = NetInfo.addEventListener(this.handleNetworkChange);
    
    // Get initial network state
    NetInfo.fetch().then(this.handleNetworkChange);
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
  private handleNetworkChange = (state: NetInfoState): void => {
    const isConnected = state.isConnected === true && state.isInternetReachable !== false;
    
    // Only trigger actions if network status has changed
    if (this.networkStatus !== isConnected) {
      this.networkStatus = isConnected;
      
      if (isConnected) {
        this.updateStatus('syncing');
        this.syncService.triggerSync('network_reconnection')
          .then(() => {
            this.updateStatus('online');
          })
          .catch(() => {
            this.updateStatus('online'); // Still update to online even if sync fails
          });
      } else {
        this.updateStatus('offline');
      }
    }
  };

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active' && this.networkStatus) {
      this.updateStatus('syncing');
      this.syncService.triggerSync('app_foreground')
        .then(() => {
          this.updateStatus(this.networkStatus ? 'online' : 'offline');
        })
        .catch(() => {
          this.updateStatus(this.networkStatus ? 'online' : 'offline');
        });
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
   * Register merge functions for conflict resolution
   */
  private registerMergeFunctions(): void {
    // Register collection merge function
    ConflictResolution.registerMergeFunction('collection', (local, remote) => {
      // Simple merge strategy - keep all fields from both
      return { ...remote, ...local };
    });
    
    // Register impact merge function - sum the values
    ConflictResolution.registerMergeFunction('impact', (local, remote) => {
      return {
        ...remote,
        plasticSaved: (local.plasticSaved || 0) + (remote.plasticSaved || 0),
        co2Reduced: (local.co2Reduced || 0) + (remote.co2Reduced || 0),
        treesEquivalent: (local.treesEquivalent || 0) + (remote.treesEquivalent || 0),
      };
    });
  }

  /**
   * Subscribe to offline status changes
   */
  public subscribeToStatusChanges(callback: (status: OfflineStatus) => void): () => void {
    this.statusListeners.push(callback);
    
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
   * @param entityType The type of entity being operated on
   * @param operation The type of operation
   * @param data The data for the operation
   * @param id Optional entity ID for updates/deletes
   * @param config Optional configuration overrides
   */
  public async executeOperation<T>(
    entityType: EntityType,
    operation: OperationType,
    data: T,
    id?: string,
    config?: Partial<OfflineOperationConfig>
  ): Promise<T> {
    // Merge config with defaults
    const operationConfig = {
      ...DEFAULT_CONFIGS[entityType],
      ...config
    };
    
    // If online, try to perform the operation directly
    if (this.networkStatus && operation !== 'query') {
      try {
        // Would normally call API here
        console.log(`Executing ${operation} operation on ${entityType} online`);
        
        // If successful, also update local cache (except for delete)
        if (operation !== 'delete') {
          const cacheKey = `${entityType}:${id || 'new'}`;
          await this.offlineStorage.cacheData(cacheKey, data, operationConfig.ttl || 0);
        }
        
        return data;
      } catch (error) {
        console.error(`Online operation failed, falling back to offline mode: ${error}`);
        // Fall through to offline handling
      }
    }
    
    // Handle based on operation type
    switch (operation) {
      case 'create':
        return this.handleCreateOffline(entityType, data, operationConfig);
      case 'update':
        return this.handleUpdateOffline(entityType, id!, data, operationConfig);
      case 'delete':
        return this.handleDeleteOffline(entityType, id!, operationConfig) as T;
      case 'query':
        return this.handleQueryOffline(entityType, id, operationConfig);
    }
  }

  /**
   * Handle create operation in offline mode
   */
  private async handleCreateOffline<T>(
    entityType: EntityType,
    data: T,
    config: OfflineOperationConfig
  ): Promise<T> {
    // Generate temporary ID for new entity
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Add to sync queue
    await this.syncService.addPendingAction({
      type: 'create',
      entityType,
      data,
      priority: config.priority,
    });
    
    // Cache the data for local retrieval
    const cacheKey = `${entityType}:${tempId}`;
    await this.offlineStorage.cacheData(cacheKey, { ...data, id: tempId }, config.ttl || 0);
    
    return { ...data, id: tempId } as T;
  }

  /**
   * Handle update operation in offline mode
   */
  private async handleUpdateOffline<T>(
    entityType: EntityType,
    id: string,
    data: T,
    config: OfflineOperationConfig
  ): Promise<T> {
    // Add to sync queue
    await this.syncService.addPendingAction({
      type: 'update',
      entityType,
      entityId: id,
      data,
      priority: config.priority,
    });
    
    // Update local cache
    const cacheKey = `${entityType}:${id}`;
    await this.offlineStorage.cacheData(cacheKey, data, config.ttl || 0);
    
    return data;
  }

  /**
   * Handle delete operation in offline mode
   */
  private async handleDeleteOffline(
    entityType: EntityType,
    id: string,
    config: OfflineOperationConfig
  ): Promise<boolean> {
    // Add to sync queue
    await this.syncService.addPendingAction({
      type: 'delete',
      entityType,
      entityId: id,
      data: null,
      priority: config.priority,
    });
    
    // Remove from local cache
    const cacheKey = `${entityType}:${id}`;
    await this.offlineStorage.getCachedData(cacheKey).then(async (cachedData) => {
      if (cachedData) {
        // Clear the cache entry
        await this.offlineStorage.cacheData(cacheKey, null, 0);
      }
    });
    
    return true;
  }

  /**
   * Handle query operation in offline mode
   */
  private async handleQueryOffline<T>(
    entityType: EntityType,
    id?: string,
    config?: OfflineOperationConfig
  ): Promise<T> {
    // If ID is provided, fetch specific entity
    if (id) {
      const cacheKey = `${entityType}:${id}`;
      const cachedData = await this.offlineStorage.getCachedData<T>(cacheKey);
      
      if (!cachedData) {
        throw new Error(`No cached data found for ${entityType} with ID ${id}`);
      }
      
      return cachedData;
    }
    
    // Otherwise, would typically query all entities of this type
    // This would require a more sophisticated caching strategy
    throw new Error('Querying all entities offline is not supported in the basic implementation');
  }

  /**
   * Force a sync with the server
   */
  public async forceSyncData(): Promise<boolean> {
    if (!this.networkStatus) {
      return false;
    }
    
    this.updateStatus('syncing');
    const result = await this.syncService.triggerSync('manual');
    this.updateStatus(this.networkStatus ? 'online' : 'offline');
    
    return result;
  }

  /**
   * Get sync statistics
   */
  public async getSyncStats(): Promise<SyncStats> {
    const pendingActions = await this.syncService.getPendingActions();
    
    // Count by entity type
    const byEntityType = pendingActions.reduce((acc, action) => {
      const entityType = action.entityType as EntityType;
      acc[entityType] = (acc[entityType] || 0) + 1;
      return acc;
    }, {} as Record<EntityType, number>);
    
    // Ensure all entity types are represented
    Object.keys(DEFAULT_CONFIGS).forEach(key => {
      const entityKey = key as EntityType;
      if (!byEntityType[entityKey]) {
        byEntityType[entityKey] = 0;
      }
    });
    
    const syncStats = await this.syncService.getSyncStats();
    
    return {
      pendingActions: pendingActions.length,
      lastSync: syncStats.lastSyncTimestamp,
      syncSuccess: syncStats.failedSyncs === 0,
      failedActions: syncStats.failedSyncs,
      byEntityType,
    };
  }

  /**
   * Clear all cached data and pending operations
   */
  public async clearOfflineData(): Promise<void> {
    await this.offlineStorage.clearCache();
    await this.syncService.clearPendingActions();
  }

  /**
   * Clean up resources when no longer needed
   */
  public cleanup(): void {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.syncService.cleanup();
  }
} 