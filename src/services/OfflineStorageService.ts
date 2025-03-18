import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

interface SyncQueue {
  actions: OfflineAction[];
  lastSyncTimestamp: number;
}

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
}

class OfflineStorageService {
  private static instance: OfflineStorageService;
  private syncQueue: SyncQueue = { actions: [], lastSyncTimestamp: Date.now() };
  private readonly SYNC_QUEUE_KEY = '@ecocart:sync_queue';
  private readonly CACHE_PREFIX = '@ecocart:cache:';
  private readonly MAX_QUEUE_SIZE = 100;

  private constructor() {
    this.initializeSyncQueue();
  }

  public static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  private async initializeSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error initializing sync queue:', error);
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  public async addToSyncQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: uuidv4(),
      timestamp: Date.now(),
      status: 'pending',
    };

    this.syncQueue.actions.push(offlineAction);

    // Maintain queue size limit
    if (this.syncQueue.actions.length > this.MAX_QUEUE_SIZE) {
      this.syncQueue.actions = this.syncQueue.actions.slice(-this.MAX_QUEUE_SIZE);
    }

    await this.saveSyncQueue();
  }

  public async cacheData<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  public async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const cacheData = await AsyncStorage.getItem(cacheKey);
      
      if (!cacheData) return null;

      const { data, timestamp, ttl } = JSON.parse(cacheData);
      
      // Check if cache is expired
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  public async syncQueueWithServer(syncFunction: (action: OfflineAction) => Promise<void>): Promise<void> {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) return;

    const pendingActions = this.syncQueue.actions.filter(action => action.status === 'pending');
    
    for (const action of pendingActions) {
      try {
        await syncFunction(action);
        action.status = 'synced';
        await this.saveSyncQueue();
      } catch (error) {
        console.error('Error syncing action:', error);
        action.status = 'failed';
        await this.saveSyncQueue();
      }
    }

    // Clean up synced actions
    this.syncQueue.actions = this.syncQueue.actions.filter(action => action.status !== 'synced');
    await this.saveSyncQueue();
  }

  public async getPendingActions(): Promise<OfflineAction[]> {
    return this.syncQueue.actions.filter(action => action.status === 'pending');
  }

  public async getFailedActions(): Promise<OfflineAction[]> {
    return this.syncQueue.actions.filter(action => action.status === 'failed');
  }

  public async retryFailedActions(syncFunction: (action: OfflineAction) => Promise<void>): Promise<void> {
    const failedActions = await this.getFailedActions();
    
    for (const action of failedActions) {
      try {
        await syncFunction(action);
        action.status = 'synced';
        await this.saveSyncQueue();
      } catch (error) {
        console.error('Error retrying failed action:', error);
      }
    }
  }
}

export const offlineStorageService = OfflineStorageService.getInstance(); 