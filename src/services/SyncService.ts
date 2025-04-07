/**
 * SyncService.ts
 * 
 * Responsible for managing synchronization of offline data.
 * Works with OfflineManager to process pending operations when network connection is available.
 */

import apiClient from '@/api/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { ConflictResolution, ResolutionStrategy } from './ConflictResolution';

// Type definitions
export type SyncTrigger = 
  | 'app_foreground' 
  | 'network_reconnection' 
  | 'manual' 
  | 'background' 
  | 'periodic';

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'query';
  entityType: string;
  entityId?: string;
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  error?: string;
}

export interface SyncStats {
  lastSyncTimestamp: number | null;
  syncCount: number;
  failedSyncs: number;
  successfulSyncs: number;
  totalOperationsProcessed: number;
  failedOperations: number;
}

// Storage keys
const PENDING_ACTIONS_KEY = '@ecocart:pending_actions';
const SYNC_STATS_KEY = '@ecocart:sync_stats';

/**
 * SyncService class
 * 
 * Manages the synchronization process between local and remote data
 */
export class SyncService {
  private static instance: SyncService;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private appStateSubscription: any = null;
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private pendingActions: PendingAction[] = [];
  private syncStats: SyncStats = {
    lastSyncTimestamp: null,
    syncCount: 0,
    failedSyncs: 0,
    successfulSyncs: 0,
    totalOperationsProcessed: 0,
    failedOperations: 0,
  };
  private syncInterval: any = null;
  private syncIntervalTime: number = 300000; // 5 minutes
  private maxRetries: number = 3;
  private initialized: boolean = false;
  private syncListeners: ((isActive: boolean) => void)[] = [];

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance of SyncService
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize the sync service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load pending actions
      await this.loadPendingActions();
      
      // Load sync stats
      await this.loadSyncStats();
      
      // Setup network listeners
      this.setupNetworkListeners();
      
      // Setup app state listeners
      this.setupAppStateListeners();
      
      // Start periodic sync if online
      this.startPeriodicSync();
      
      this.initialized = true;
      console.log('SyncService initialized successfully');
      
      // Check network state
      const networkState = await NetInfo.fetch();
      this.handleNetworkChange(networkState);
      
    } catch (error) {
      console.error('Error initializing SyncService:', error);
      throw error;
    }
  }

  /**
   * Set up network listeners
   */
  private setupNetworkListeners(): void {
    this.netInfoSubscription = NetInfo.addEventListener(this.handleNetworkChange);
  }

  /**
   * Set up app state listeners
   */
  private setupAppStateListeners(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const isConnected = state.isConnected === true && state.isInternetReachable !== false;
    
    // Only trigger sync if coming back online
    if (!this.isOnline && isConnected) {
      this.isOnline = true;
      this.triggerSync('network_reconnection');
    } else {
      this.isOnline = isConnected;
    }
  };

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active' && this.isOnline) {
      // App came to foreground and we're online, try to sync
      this.triggerSync('app_foreground');
    }
  };

  /**
   * Start the periodic sync interval
   */
  private startPeriodicSync(): void {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Set up new interval
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingActions.length > 0) {
        this.triggerSync('periodic');
      }
    }, this.syncIntervalTime);
  }

  /**
   * Add a new pending action to the sync queue
   */
  public async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Generate a unique ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the full action object
    const pendingAction: PendingAction = {
      id,
      ...action,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    // Add to pending actions
    this.pendingActions.push(pendingAction);
    
    // Sort the actions by priority and timestamp
    this.sortPendingActions();
    
    // Save to storage
    await this.savePendingActions();
    
    // If online, trigger a sync
    if (this.isOnline) {
      this.triggerSync('manual');
    }
    
    return id;
  }

  /**
   * Trigger a sync operation
   */
  public async triggerSync(trigger: SyncTrigger): Promise<boolean> {
    // Skip if offline or already syncing
    if (!this.isOnline || this.isSyncing) {
      return false;
    }
    
    // Skip if no pending actions
    if (this.pendingActions.length === 0) {
      return true;
    }
    
    this.isSyncing = true;
    this.notifySyncListeners(true);
    
    try {
      console.log(`Triggering sync (${trigger})`);
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process high priority actions first
      const actionsToProcess = [...this.pendingActions];
      
      for (const action of actionsToProcess) {
        try {
          const success = await this.processAction(action);
          
          if (success) {
            // Remove from pending actions
            this.removeAction(action.id);
            successCount++;
          } else {
            // Update retry count
            this.updateActionRetry(action.id);
            failureCount++;
          }
        } catch (error) {
          console.error(`Error processing action ${action.id}:`, error);
          this.updateActionRetry(action.id, error instanceof Error ? error.message : String(error));
          failureCount++;
        }
      }
      
      // Update stats
      this.syncStats.lastSyncTimestamp = Date.now();
      this.syncStats.syncCount++;
      this.syncStats.totalOperationsProcessed += successCount;
      this.syncStats.failedOperations += failureCount;
      
      if (failureCount > 0) {
        this.syncStats.failedSyncs++;
      } else {
        this.syncStats.successfulSyncs++;
      }
      
      // Save updated stats and pending actions
      await this.saveSyncStats();
      await this.savePendingActions();
      
      console.log(`Sync completed: ${successCount} succeeded, ${failureCount} failed`);
      
      return failureCount === 0;
    } catch (error) {
      console.error('Error during sync process:', error);
      this.syncStats.failedSyncs++;
      await this.saveSyncStats();
      return false;
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners(false);
    }
  }

  /**
   * Process a single action
   */
  private async processAction(action: PendingAction): Promise<boolean> {
    if (action.retryCount >= this.maxRetries) {
      console.log(`Action ${action.id} exceeded max retries, deprioritizing`);
      // Deprioritize but keep in queue for manual resolution
      this.updateActionPriority(action.id, 'low');
      return false;
    }
    
    try {
      console.log(`Processing action: ${action.type} for ${action.entityType}${action.entityId ? `:${action.entityId}` : ''}`);
      
      switch (action.type) {
        case 'create':
          return await this.handleCreateAction(action);
        
        case 'update':
          return await this.handleUpdateAction(action);
        
        case 'delete':
          return await this.handleDeleteAction(action);
        
        default:
          console.warn(`Unsupported action type: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Error processing action ${action.id}:`, error);
      return false;
    }
  }

  /**
   * Handle create action
   */
  private async handleCreateAction(action: PendingAction): Promise<boolean> {
    try {
      const response = await apiClient.post(`/${action.entityType}`, action.data);
      
      if (response.status >= 200 && response.status < 300) {
        // Success
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error creating ${action.entityType}:`, error);
      throw error;
    }
  }

  /**
   * Handle update action
   */
  private async handleUpdateAction(action: PendingAction): Promise<boolean> {
    if (!action.entityId) {
      console.error('Entity ID is required for update action');
      return false;
    }
    
    try {
      // First, check if there is a conflict by getting current server data
      let remoteData;
      try {
        const getResponse = await apiClient.get(`/${action.entityType}/${action.entityId}`);
        remoteData = getResponse.data;
      } catch (error) {
        // If 404, the entity doesn't exist on server anymore
        if (error.response?.status === 404) {
          // Entity doesn't exist, cannot update
          console.warn(`Entity ${action.entityType}:${action.entityId} doesn't exist on server, cannot update`);
          return true; // Mark as processed since we can't update what doesn't exist
        }
        throw error;
      }
      
      // Check if there is a conflict and resolve it
      if (remoteData) {
        const resolvedData = await ConflictResolution.resolveConflict(
          action.entityType,
          action.data,
          remoteData,
          ResolutionStrategy.SMART_MERGE
        );
        
        // Update with resolved data
        const response = await apiClient.put(`/${action.entityType}/${action.entityId}`, resolvedData);
        
        if (response.status >= 200 && response.status < 300) {
          // Success
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating ${action.entityType}:${action.entityId}:`, error);
      throw error;
    }
  }

  /**
   * Handle delete action
   */
  private async handleDeleteAction(action: PendingAction): Promise<boolean> {
    if (!action.entityId) {
      console.error('Entity ID is required for delete action');
      return false;
    }
    
    try {
      try {
        const response = await apiClient.delete(`/${action.entityType}/${action.entityId}`);
        
        if (response.status >= 200 && response.status < 300) {
          // Success
          return true;
        }
      } catch (error) {
        // If 404, the entity doesn't exist anyway, consider it deleted
        if (error.response?.status === 404) {
          return true;
        }
        throw error;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting ${action.entityType}:${action.entityId}:`, error);
      throw error;
    }
  }

  /**
   * Remove an action from the pending actions
   */
  private removeAction(id: string): void {
    this.pendingActions = this.pendingActions.filter(action => action.id !== id);
  }

  /**
   * Update an action's retry count and error message
   */
  private updateActionRetry(id: string, errorMessage?: string): void {
    const actionIndex = this.pendingActions.findIndex(action => action.id === id);
    
    if (actionIndex >= 0) {
      this.pendingActions[actionIndex] = {
        ...this.pendingActions[actionIndex],
        retryCount: this.pendingActions[actionIndex].retryCount + 1,
        error: errorMessage || this.pendingActions[actionIndex].error,
      };
    }
  }

  /**
   * Update an action's priority
   */
  private updateActionPriority(id: string, priority: 'high' | 'medium' | 'low'): void {
    const actionIndex = this.pendingActions.findIndex(action => action.id === id);
    
    if (actionIndex >= 0) {
      this.pendingActions[actionIndex] = {
        ...this.pendingActions[actionIndex],
        priority,
      };
    }
  }

  /**
   * Sort pending actions by priority and timestamp
   */
  private sortPendingActions(): void {
    // Define priority order
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    this.pendingActions.sort((a, b) => {
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
   * Load pending actions from storage
   */
  private async loadPendingActions(): Promise<void> {
    try {
      const actionsData = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
      
      if (actionsData) {
        this.pendingActions = JSON.parse(actionsData);
        this.sortPendingActions();
      } else {
        this.pendingActions = [];
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
      this.pendingActions = [];
    }
  }

  /**
   * Save pending actions to storage
   */
  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  /**
   * Load sync stats from storage
   */
  private async loadSyncStats(): Promise<void> {
    try {
      const statsData = await AsyncStorage.getItem(SYNC_STATS_KEY);
      
      if (statsData) {
        this.syncStats = JSON.parse(statsData);
      }
    } catch (error) {
      console.error('Error loading sync stats:', error);
    }
  }

  /**
   * Save sync stats to storage
   */
  private async saveSyncStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_STATS_KEY, JSON.stringify(this.syncStats));
    } catch (error) {
      console.error('Error saving sync stats:', error);
    }
  }

  /**
   * Get pending actions
   */
  public getPendingActions(): PendingAction[] {
    return [...this.pendingActions];
  }

  /**
   * Get pending actions for a specific entity type
   */
  public getPendingActionsForEntityType(entityType: string): PendingAction[] {
    return this.pendingActions.filter(action => action.entityType === entityType);
  }

  /**
   * Get sync stats
   */
  public getSyncStats(): SyncStats {
    return { ...this.syncStats };
  }

  /**
   * Clear all pending actions
   */
  public async clearPendingActions(): Promise<void> {
    this.pendingActions = [];
    await this.savePendingActions();
  }

  /**
   * Subscribe to sync status changes
   */
  public subscribeSyncStatus(callback: (isActive: boolean) => void): () => void {
    this.syncListeners.push(callback);
    
    // Immediately call with current status
    callback(this.isSyncing);
    
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify sync listeners of status change
   */
  private notifySyncListeners(isActive: boolean): void {
    this.syncListeners.forEach(listener => listener(isActive));
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clear network listener
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    
    // Clear app state listener
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
export const syncService = SyncService.getInstance();
export default syncService;
