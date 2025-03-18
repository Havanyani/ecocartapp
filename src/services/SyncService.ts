import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus, NativeEventSubscription, Platform } from 'react-native';
import { Storage } from './StorageService';

interface CollectionHistory {
  id: string;
  date: string;
  weight: number;
  credits: number;
  status: 'completed' | 'pending' | 'cancelled';
  impact: {
    plasticSaved: number;
    co2Reduced: number;
    treesEquivalent: number;
  };
}

interface SyncResult<T> {
  data: T;
  timestamp: number;
  duration: number;
}

// Storage keys
const PENDING_ACTIONS_KEY = 'ecocart:pendingActions';
const LAST_SYNC_TIMESTAMP_KEY = 'ecocart:lastSyncTimestamp';
const SYNC_STATS_KEY = 'ecocart:syncStats';

// Types
export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'collection' | 'material' | 'user' | 'feedback';
  entityId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncTimestamp: number | null;
  pendingActions: number;
  lastError: string | null;
}

export class SyncService {
  private static instance: SyncService;
  private apiService: any; // Use any to avoid type errors
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private appState: AppStateStatus = 'active';
  private syncInProgress: boolean = false;
  private syncQueue: PendingAction[] = [];
  private maxRetries: number = 5;
  private syncIntervalTime: number = 60000; // 1 minute
  private networkListener: any = null;
  private appStateSubscription: NativeEventSubscription | null = null;

  private constructor() {
    // This will be initialized in initializeSyncService
    this.apiService = null;
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private async initializeSyncService(): Promise<void> {
    try {
      // Initialize the ApiService (assuming this is defined elsewhere)
      // this.apiService = ApiService.getInstance();

      // Load pending actions from storage
      await this.loadPendingActions();

      // Setup network and app state listeners
      this.setupNetworkListeners();
      this.setupAppStateListeners();

      // Initialize SQLite
      await Storage.initSQLite();

      console.log('Sync service initialized successfully');
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  private setupNetworkListeners(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        // Only trigger if we have network and no sync in progress
        this.triggerSync('network_change').catch(err => {
          console.error('Error syncing on network change:', err);
        });
      }
    });
  }

  private setupAppStateListeners(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (this.appState === 'background' && nextAppState === 'active') {
      // App has come to the foreground
      this.triggerSync('app_foreground').catch(err => {
        console.error('Error syncing on app foreground:', err);
      });
    }
    this.appState = nextAppState;
  };

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      console.log('Starting sync (trigger: periodic)');
      this.triggerSync('periodic').catch(err => {
        console.error('Error in periodic sync:', err);
      });
    }, this.syncIntervalTime);
  }

  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingAction: PendingAction = {
      ...action,
      id: actionId,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(pendingAction);
    
    // Sort by priority first, then by timestamp
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same priority, sort by timestamp (older first)
      return a.timestamp - b.timestamp;
    });

    await this.savePendingActions();
    
    // Trigger a sync if we have network
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected && !this.syncInProgress) {
      this.triggerSync('new_action').catch(err => {
        console.error('Error syncing after new action:', err);
      });
    }

    return actionId;
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const actions = await Storage.getObject<PendingAction[]>(PENDING_ACTIONS_KEY);
      this.syncQueue = actions || [];
    } catch (error) {
      console.error('Error loading pending actions:', error);
      this.syncQueue = [];
    }
  }

  private async savePendingActions(): Promise<void> {
    try {
      await Storage.setObject(PENDING_ACTIONS_KEY, this.syncQueue);
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  public async triggerSync(trigger: string): Promise<boolean> {
    // Check if sync is already in progress
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }

    // Set sync flag
    this.syncInProgress = true;

    try {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        console.log('No network connection, skipping sync');
        this.syncInProgress = false;
        return false;
      }

      // Get current stats
      const stats = await this.getSyncStats();
      
      // Start time for performance tracking
      const startTime = Date.now();
      let syncedCount = 0;

      // Process all pending actions
      const actionsToProcess = [...this.syncQueue];
      for (const action of actionsToProcess) {
        try {
          // Process the action based on its type
          switch (action.type) {
            case 'create':
              await this.handleCreateAction(action);
              break;
            case 'update':
              await this.handleUpdateAction(action);
              break;
            case 'delete':
              await this.handleDeleteAction(action);
              break;
          }

          // Remove the action from the queue if successful
          this.syncQueue = this.syncQueue.filter(a => a.id !== action.id);
          syncedCount++;
        } catch (error) {
          console.error(`Error processing action ${action.id}:`, error);
          
          // Increment retry count
          const actionIndex = this.syncQueue.findIndex(a => a.id === action.id);
          if (actionIndex !== -1) {
            this.syncQueue[actionIndex].retryCount++;
            
            // If max retries reached, remove the action
            if (this.syncQueue[actionIndex].retryCount >= this.maxRetries) {
              console.log(`Action ${action.id} reached max retries, removing`);
              this.syncQueue.splice(actionIndex, 1);
            }
          }
        }
      }

      // Save the updated queue
      await this.savePendingActions();

      // Calculate sync duration
      const duration = Date.now() - startTime;
      
      // Update sync stats
      await this.updateSyncStats({
        totalSyncs: stats.totalSyncs + 1,
        successfulSyncs: stats.successfulSyncs + (syncedCount > 0 ? 1 : 0),
        failedSyncs: stats.failedSyncs + (syncedCount === 0 ? 1 : 0),
        lastSyncTimestamp: Date.now(),
        pendingActions: this.syncQueue.length,
        lastError: null
      });

      // Show notification if actions were synced
      if (syncedCount > 0) {
        await this.showSyncNotification(syncedCount);
      }

      console.log(`Sync completed in ${duration}ms, synced ${syncedCount} actions`);
      
      // Reset sync flag
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error('Error during sync:', error);
      
      // Update sync stats with error
      const stats = await this.getSyncStats();
      await this.updateSyncStats({
        totalSyncs: stats.totalSyncs + 1,
        failedSyncs: stats.failedSyncs + 1,
        lastError: error?.toString() || 'Unknown error'
      });
      
      // Reset sync flag
      this.syncInProgress = false;
      return false;
    }
  }

  private async processAction(action: PendingAction): Promise<void> {
    // Simulate processing by adding a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would call your API service
    console.log(`Processed action: ${action.type} ${action.entityType} ${action.entityId || ''}`);
    
    // After successful processing, update the database if needed
    if (action.entityType === 'collection') {
      // Example: update recycling_entries table
      if (action.type === 'create' || action.type === 'update') {
        // If we have actual data, we would update the appropriate tables here
      }
    }
  }

  private async handleCreateAction(action: PendingAction): Promise<void> {
    await this.processAction(action);
    
    // If this is a creation of a collection record, we would 
    // update local SQLite database to mark it as synced
    if (action.entityType === 'collection' && action.data) {
      try {
        // Update the local database with the server response if needed
        // This would be handled by the StorageService in a real app
        
        console.log(`Updated local database for create action: ${action.id}`);
      } catch (dbError) {
        console.error('Error updating local database after create:', dbError);
      }
    }
  }

  private async handleUpdateAction(action: PendingAction): Promise<void> {
    await this.processAction(action);
    
    // Similar logic to create, but for updates
    if (action.entityType === 'collection' && action.entityId) {
      try {
        // Update the local database with the server response if needed
        // This would be handled by the StorageService in a real app
        
        console.log(`Updated local database for update action: ${action.id}`);
      } catch (dbError) {
        console.error('Error updating local database after update:', dbError);
      }
    }
  }

  private async handleDeleteAction(action: PendingAction): Promise<void> {
    await this.processAction(action);
    
    // For delete operations, we might want to remove from local DB after 
    // successful API deletion
    if (action.entityType === 'collection' && action.entityId) {
      try {
        // Delete from local database if needed
        // This would be handled by the StorageService in a real app
        
        console.log(`Removed from local database for delete action: ${action.id}`);
      } catch (dbError) {
        console.error('Error updating local database after delete:', dbError);
      }
    }
  }

  private async showSyncNotification(syncedCount: number): Promise<void> {
    // Only show notifications if we're on a mobile device and the app is in background
    if (this.appState !== 'active' && Platform.OS !== 'web') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'EcoCart Sync Complete',
            body: `${syncedCount} items have been synchronized`,
            data: { syncedCount }
          },
          trigger: null // Immediate notification
        });
      } catch (error) {
        console.error('Error showing sync notification:', error);
      }
    }
  }

  public async getSyncStats(): Promise<SyncStats> {
    try {
      const stats = await Storage.getObject<SyncStats>(SYNC_STATS_KEY);
      return stats || this.getDefaultSyncStats();
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return this.getDefaultSyncStats();
    }
  }

  private getDefaultSyncStats(): SyncStats {
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSyncTimestamp: null,
      pendingActions: this.syncQueue.length,
      lastError: null
    };
  }

  private async updateSyncStats(partialStats: Partial<SyncStats>): Promise<void> {
    try {
      const currentStats = await this.getSyncStats();
      const newStats: SyncStats = {
        ...currentStats,
        ...partialStats
      };
      
      await Storage.setObject(SYNC_STATS_KEY, newStats);
    } catch (error) {
      console.error('Error updating sync stats:', error);
    }
  }

  public cleanup(): void {
    // Clean up event listeners
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Stop periodic sync
    this.stopPeriodicSync();
  }
}

export default SyncService.getInstance();
