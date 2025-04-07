/**
 * BackgroundSyncService.ts
 * 
 * Service to handle background synchronization of data with configurable settings.
 * Features:
 * - Periodic background sync when app is in foreground
 * - Opportunistic sync on network reconnection
 * - Sync on app foreground
 * - Configurable sync frequency and conditions
 * - Power-aware sync scheduling
 */

import { useSyncQueue } from '@/hooks/useSyncQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Configuration storage key
const SYNC_CONFIG_STORAGE_KEY = 'background_sync_config';

// Default sync configuration
export const DEFAULT_SYNC_CONFIG: SyncConfiguration = {
  isEnabled: true,
  syncInterval: 15, // minutes
  syncOnForeground: true,
  syncOnNetworkChange: true,
  requireWifi: false,
  requireCharging: false,
  syncPriority: 'all', // 'all', 'high-only', or 'normal'
  syncWhenBatteryAbove: 20, // percentage
  dataSaverMode: false,
  maxConcurrentSync: 3,
  retryAttempts: 3,
  retryDelay: 60 // seconds
};

// Sync configuration interface
export interface SyncConfiguration {
  isEnabled: boolean;
  syncInterval: number; // Minutes
  syncOnForeground: boolean;
  syncOnNetworkChange: boolean;
  requireWifi: boolean;
  requireCharging: boolean;
  syncPriority: 'all' | 'high-only' | 'normal';
  syncWhenBatteryAbove: number;
  dataSaverMode: boolean;
  maxConcurrentSync: number;
  retryAttempts: number;
  retryDelay: number; // Seconds
}

// Sync event type
export enum SyncTrigger {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  NETWORK_CHANGE = 'network_change',
  APP_FOREGROUND = 'app_foreground',
  LOGIN = 'login'
}

/**
 * Background Sync Service for managing data synchronization
 */
export class BackgroundSyncService {
  // Singleton instance
  private static instance: BackgroundSyncService;
  
  // Sync configuration
  private syncConfig: SyncConfiguration = DEFAULT_SYNC_CONFIG;
  
  // Timer reference for scheduled syncs
  private syncTimerId: NodeJS.Timeout | null = null;
  
  // Track if a sync is currently in progress
  private isSyncInProgress = false;
  
  // Event listeners
  private appStateSubscription: { remove: () => void } | null = null;
  private netInfoSubscription: { remove: () => void } | null = null;
  
  // Last sync information
  private lastSyncTime: number = 0;
  private syncInProgress: boolean = false;
  private syncQueue = [];
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Private constructor for singleton pattern
  private constructor() {
    this.initialize();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): BackgroundSyncService {
    if (!this.instance) {
      this.instance = new BackgroundSyncService();
    }
    return this.instance;
  }
  
  /**
   * Initialize the service
   */
  private async initialize(): Promise<void> {
    try {
      // Load saved configuration
      await this.loadConfiguration();
      
      // Set up event listeners if sync is enabled
      if (this.syncConfig.isEnabled) {
        this.setupEventListeners();
        this.scheduleSyncIfNeeded();
      }
    } catch (error) {
      console.error('Failed to initialize BackgroundSyncService:', error);
    }
  }
  
  /**
   * Load saved configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem(SYNC_CONFIG_STORAGE_KEY);
      if (savedConfig) {
        this.syncConfig = { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load sync configuration:', error);
    }
  }
  
  /**
   * Save configuration to storage
   */
  private async saveConfiguration(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_CONFIG_STORAGE_KEY, JSON.stringify(this.syncConfig));
    } catch (error) {
      console.error('Failed to save sync configuration:', error);
    }
  }
  
  /**
   * Set up event listeners for sync triggers
   */
  private setupEventListeners(): void {
    // Clean up existing listeners first
    this.removeEventListeners();
    
    // Listen for app state changes
    if (this.syncConfig.syncOnForeground) {
      this.appStateSubscription = AppState.addEventListener('change', 
        this.handleAppStateChange.bind(this));
    }
    
    // Listen for network changes
    if (this.syncConfig.syncOnNetworkChange) {
      this.netInfoSubscription = NetInfo.addEventListener(
        this.handleNetworkChange.bind(this));
    }
  }
  
  /**
   * Remove all event listeners
   */
  private removeEventListeners(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    if (this.netInfoSubscription) {
      this.netInfoSubscription.remove();
      this.netInfoSubscription = null;
    }
    
    // Clear scheduled sync
    if (this.syncTimerId) {
      clearTimeout(this.syncTimerId);
      this.syncTimerId = null;
    }
  }
  
  /**
   * Handle app state changes
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    // Trigger sync when app comes to foreground
    if (nextAppState === 'active' && this.syncConfig.syncOnForeground) {
      await this.triggerSync(SyncTrigger.APP_FOREGROUND);
      this.scheduleSyncIfNeeded();
    } else if (nextAppState === 'background') {
      // Clear scheduled syncs when app goes to background
      if (this.syncTimerId) {
        clearTimeout(this.syncTimerId);
        this.syncTimerId = null;
      }
    }
  }
  
  /**
   * Handle network state changes
   */
  private async handleNetworkChange(state: NetInfoState): Promise<void> {
    // Only trigger sync if we're coming online and sync on network change is enabled
    if (state.isConnected && this.syncConfig.syncOnNetworkChange) {
      // Check if we meet network type requirements
      if (this.syncConfig.requireWifi && state.type !== 'wifi') {
        return;
      }
      
      // Wait a second to allow the connection to stabilize
      setTimeout(async () => {
        await this.triggerSync(SyncTrigger.NETWORK_CHANGE);
      }, 1000);
    }
  }
  
  /**
   * Schedule the next background sync
   */
  private scheduleSyncIfNeeded(): void {
    // Clear any existing scheduled sync
    if (this.syncTimerId) {
      clearTimeout(this.syncTimerId);
      this.syncTimerId = null;
    }
    
    // Skip if sync is disabled
    if (!this.syncConfig.isEnabled) {
      return;
    }
    
    // Calculate time until next sync
    const nextSyncTime = this.lastSyncTime + (this.syncConfig.syncInterval * 60 * 1000);
    const now = Date.now();
    const timeUntilNextSync = Math.max(nextSyncTime - now, 0);
    
    // Schedule next sync
    this.syncTimerId = setTimeout(async () => {
      await this.triggerSync(SyncTrigger.SCHEDULED);
      
      // Reschedule next sync
      this.scheduleSyncIfNeeded();
    }, timeUntilNextSync);
  }
  
  /**
   * Trigger data synchronization with the server
   */
  public async triggerSync(trigger: SyncTrigger): Promise<boolean> {
    // Skip if sync is already in progress or disabled
    if (this.isSyncInProgress || !this.syncConfig.isEnabled) {
      return false;
    }
    
    try {
      this.isSyncInProgress = true;
      this.emitEvent('syncStarted', { trigger });
      
      // Check if we meet the conditions for syncing
      const canSync = await this.checkSyncConditions();
      if (!canSync) {
        this.emitEvent('syncSkipped', { 
          trigger, 
          reason: 'conditions not met'
        });
        return false;
      }
      
      // Get the sync queue from useSyncQueue hook
      const syncQueue = useSyncQueue.getState().queue;
      
      // Filter the queue based on the priority setting
      let itemsToSync = syncQueue;
      if (this.syncConfig.syncPriority === 'high-only') {
        itemsToSync = syncQueue.filter(item => item.priority === 'high');
      }
      
      // Skip if there's nothing to sync
      if (itemsToSync.length === 0) {
        this.emitEvent('syncCompleted', { 
          trigger, 
          itemsCount: 0,
          success: true 
        });
        return true;
      }
      
      // Perform sync
      const result = await useSyncQueue.getState().sync();
      
      // Update last sync time if successful
      if (result.success) {
        this.lastSyncTime = Date.now();
      }
      
      this.emitEvent('syncCompleted', {
        trigger,
        itemsCount: result.processed,
        success: result.success,
        errors: result.errors
      });
      
      return result.success;
    } catch (error) {
      // Handle error
      this.emitEvent('syncError', {
        trigger,
        error
      });
      return false;
    } finally {
      this.isSyncInProgress = false;
    }
  }
  
  /**
   * Check if sync conditions are met
   */
  private async checkSyncConditions(): Promise<boolean> {
    try {
      // Check network conditions
      const netInfo = await NetInfo.fetch();
      
      // Check if we're connected
      if (!netInfo.isConnected) {
        return false;
      }
      
      // Check if we need WiFi
      if (this.syncConfig.requireWifi && netInfo.type !== 'wifi') {
        return false;
      }
      
      // Check data saver mode
      if (this.syncConfig.dataSaverMode && netInfo.isConnectionExpensive) {
        return false;
      }
      
      // Check battery conditions
      if (Platform.OS !== 'web') {
        // Check charging status if required
        if (this.syncConfig.requireCharging) {
          const batteryState = await Battery.getBatteryStateAsync();
          if (batteryState !== Battery.BatteryState.CHARGING &&
              batteryState !== Battery.BatteryState.FULL) {
            return false;
          }
        }
        
        // Check battery level
        if (this.syncConfig.syncWhenBatteryAbove > 0) {
          const batteryLevel = await Battery.getBatteryLevelAsync();
          if (batteryLevel * 100 < this.syncConfig.syncWhenBatteryAbove) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking sync conditions:', error);
      return false;
    }
  }
  
  /**
   * Update sync configuration
   */
  public async updateConfiguration(config: Partial<SyncConfiguration>): Promise<void> {
    // Update configuration
    const wasEnabled = this.syncConfig.isEnabled;
    this.syncConfig = { ...this.syncConfig, ...config };
    
    // Save changes
    await this.saveConfiguration();
    
    // Update listeners if enabled state changed
    if (wasEnabled !== this.syncConfig.isEnabled) {
      if (this.syncConfig.isEnabled) {
        this.setupEventListeners();
        this.scheduleSyncIfNeeded();
      } else {
        this.removeEventListeners();
      }
    }
  }
  
  /**
   * Get current sync configuration
   */
  public getConfiguration(): SyncConfiguration {
    return { ...this.syncConfig };
  }
  
  /**
   * Add event listener
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)?.push(callback);
  }
  
  /**
   * Remove event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit event to all listeners
   */
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      }
    }
  }
  
  /**
   * Reset the service to default configuration
   */
  public async reset(): Promise<void> {
    // Clean up
    this.removeEventListeners();
    
    // Reset configuration
    this.syncConfig = { ...DEFAULT_SYNC_CONFIG };
    await this.saveConfiguration();
    
    // Reset sync state
    this.lastSyncTime = 0;
    this.isSyncInProgress = false;
    
    // Set up again if enabled
    if (this.syncConfig.isEnabled) {
      this.setupEventListeners();
      this.scheduleSyncIfNeeded();
    }
  }
  
  /**
   * Clean up resources when service is no longer needed
   */
  public destroy(): void {
    this.removeEventListeners();
    this.eventListeners.clear();
    this.isSyncInProgress = false;
  }
} 