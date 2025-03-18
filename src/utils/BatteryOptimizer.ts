import * as NetInfo from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { SafeStorage } from './storage';

// Constants
const BATTERY_OPTIMIZATION_STORAGE_KEY = 'ecocart_battery_optimization_settings';
const BACKGROUND_FETCH_TASK = 'background-location-update';
const LOW_BATTERY_THRESHOLD = 0.2; // 20%
const CRITICAL_BATTERY_THRESHOLD = 0.1; // 10%

// Battery state categories
export enum BatteryState {
  UNPLUGGED = 'UNPLUGGED',
  CHARGING = 'CHARGING',
  FULL = 'FULL',
}

// Battery level categories
export enum BatteryLevel {
  NORMAL = 'normal',
  LOW = 'low',
  CRITICAL = 'critical',
}

// Update frequency configuration based on battery state and level (in milliseconds)
const BATTERY_STATE_INTERVALS = {
  [BatteryState.UNPLUGGED]: {
    [BatteryLevel.NORMAL]: 30000, // 30 seconds
    [BatteryLevel.LOW]: 60000, // 1 minute
    [BatteryLevel.CRITICAL]: 180000, // 3 minutes
  },
  [BatteryState.CHARGING]: {
    [BatteryLevel.NORMAL]: 10000, // 10 seconds
    [BatteryLevel.LOW]: 15000, // 15 seconds
    [BatteryLevel.CRITICAL]: 30000, // 30 seconds
  },
  [BatteryState.FULL]: {
    [BatteryLevel.NORMAL]: 5000, // 5 seconds
    [BatteryLevel.LOW]: 10000, // 10 seconds
    [BatteryLevel.CRITICAL]: 15000, // 15 seconds
  },
};

// Location accuracy settings based on battery state
const LOCATION_ACCURACY_SETTINGS = {
  [BatteryState.UNPLUGGED]: {
    [BatteryLevel.NORMAL]: {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 20, // meters
      timeInterval: 30000, // 30 seconds
    },
    [BatteryLevel.LOW]: {
      accuracy: Location.Accuracy.Low,
      distanceInterval: 50,
      timeInterval: 60000, // 1 minute
    },
    [BatteryLevel.CRITICAL]: {
      accuracy: Location.Accuracy.Lowest,
      distanceInterval: 100,
      timeInterval: 120000, // 2 minutes
    },
  },
  [BatteryState.CHARGING]: {
    [BatteryLevel.NORMAL]: {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 15000, // 15 seconds
    },
    [BatteryLevel.LOW]: {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 15,
      timeInterval: 20000, // 20 seconds
    },
    [BatteryLevel.CRITICAL]: {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 20,
      timeInterval: 25000, // 25 seconds
    },
  },
  [BatteryState.FULL]: {
    [BatteryLevel.NORMAL]: {
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 5,
      timeInterval: 10000, // 10 seconds
    },
    [BatteryLevel.LOW]: {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 15000, // 15 seconds
    },
    [BatteryLevel.CRITICAL]: {
      accuracy: Location.Accuracy.High,
      distanceInterval: 15,
      timeInterval: 20000, // 20 seconds
    },
  },
};

// Network type optimization settings
const NETWORK_OPTIMIZATION = {
  cellular: {
    batchUpdates: true,
    compressData: true,
    minUpdateInterval: 30000, // 30 seconds on cellular
  },
  wifi: {
    batchUpdates: false,
    compressData: false,
    minUpdateInterval: 5000, // 5 seconds on WiFi
  },
  unknown: {
    batchUpdates: true,
    compressData: true,
    minUpdateInterval: 60000, // 1 minute on unknown connection
  },
};

// Battery level thresholds (in percentages)
const BATTERY_THRESHOLDS = {
  LOW: 30, // Below 30% is considered low
  CRITICAL: 15, // Below 15% is considered critical
};

// Optimization settings interface
export interface BatteryOptimizationSettings {
  enabled: boolean;
  lowBatteryMode: boolean;
  backgroundUpdatesEnabled: boolean;
  updateIntervals: {
    normal: number;
    low: number;
    critical: number;
  };
  networkOptimization: {
    wifiOnly: boolean;
    metered: boolean;
  };
  dataReduction: boolean;
  locationAccuracy: 'high' | 'balanced' | 'low';
}

// Default optimization settings
const DEFAULT_SETTINGS: BatteryOptimizationSettings = {
  enabled: true,
  lowBatteryMode: true,
  backgroundUpdatesEnabled: false,
  updateIntervals: {
    normal: 30000, // 30 seconds
    low: 60000, // 1 minute
    critical: 180000, // 3 minutes
  },
  networkOptimization: {
    wifiOnly: false,
    metered: true,
  },
  dataReduction: true,
  locationAccuracy: 'balanced',
};

// Battery state type
export type BatteryStatus = {
  level: number;
  batteryState: BatteryState;
  levelCategory: BatteryLevel;
  isLowPowerMode: boolean;
};

// Storage key for battery optimizer settings
const BATTERY_OPTIMIZER_SETTINGS_KEY = 'ecocart_battery_optimizer_settings';

/**
 * Enum for battery levels
 */
export enum LocationAccuracySettings {
  HIGH = 'HIGH',       // Full accuracy
  MEDIUM = 'MEDIUM',   // Balanced accuracy
  LOW = 'LOW'          // Low accuracy
}

/**
 * Interface for optimizer settings
 */
interface BatteryOptimizerSettings {
  enabled: boolean;
  locationAccuracy: LocationAccuracySettings;
  backgroundUpdatesEnabled: boolean;
}

/**
 * Type for cleanup function returned by interval schedulers
 */
type CleanupFunction = () => void;

/**
 * BatteryOptimizer is a singleton utility that manages battery-optimized behavior
 * for the application, including update intervals and location accuracy.
 */
export class BatteryOptimizer {
  private static instance: BatteryOptimizer;
  private config: BatteryOptimizerConfig;
  private batteryStatus: BatteryStatus;
  private networkStatus: NetworkStatus;
  private batterySubscription: Battery.BatteryStateSubscription | null = null;
  private appStateSubscription: any = null;
  private networkSubscription: any = null;
  private listeners: BatteryStateChangeListener[] = [];
  private timers: NodeJS.Timeout[] = [];
  private batteryLevel: number = 1.0;
  private batteryState: Battery.BatteryState = Battery.BatteryState.UNPLUGGED;
  private appState: AppStateStatus = 'active';
  private networkType: string = 'unknown';
  private settings: BatteryOptimizerSettings = {
    enabled: true,
    locationAccuracy: LocationAccuracySettings.MEDIUM,
    backgroundUpdatesEnabled: true,
  };
  private batteryStateSubscription: Battery.BatteryStateListener | null = null;
  private netInfoSubscription: (() => void) | null = null;

  private constructor() {
    this.config = {
      enableBatteryOptimization: true,
      enableBackgroundUpdates: false,
      enableNetworkOptimization: true,
    };

    this.batteryStatus = {
      level: 100,
      batteryState: BatteryState.UNPLUGGED,
      levelCategory: BatteryLevel.NORMAL,
      isLowPowerMode: false,
    };

    this.networkStatus = {
      isConnected: true,
      type: 'wifi',
      isMetered: false,
      details: null,
    };

    // Initialize state
    this.initialize();
  }

  /**
   * Gets the singleton instance of BatteryOptimizer
   */
  public static getInstance(): BatteryOptimizer {
    if (!BatteryOptimizer.instance) {
      BatteryOptimizer.instance = new BatteryOptimizer();
    }
    return BatteryOptimizer.instance;
  }

  /**
   * Initializes the battery optimizer
   * Sets up listeners for battery status, app state, and network connectivity
   */
  private async initialize(): Promise<void> {
    try {
      // Load saved settings
      await this.loadSettings();

      // Get initial battery state
      await this.updateBatteryStatus();

      // Set up battery state listener
      this.batterySubscription = Battery.addBatteryStateListener(async () => {
        await this.updateBatteryStatus();
      });

      // Set up app state listener
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

      // Set up network state listener
      this.networkSubscription = NetInfo.addEventListener(this.handleNetworkChange);

      // Monitor network state
      const netInfo = await NetInfo.fetch();
      this.networkType = netInfo.type;

      this.netInfoSubscription = NetInfo.addEventListener((state) => {
        this.networkType = state.type;
        this.notifyListeners();
      });
    } catch (error) {
      console.error('Failed to initialize BatteryOptimizer:', error);
    }
  }

  /**
   * Load saved settings
   */
  private async loadSettings(): Promise<void> {
    try {
      const savedSettings = await SafeStorage.getItem(BATTERY_OPTIMIZER_SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load battery optimizer settings:', error);
    }
  }

  /**
   * Save current settings
   */
  private async saveSettings(): Promise<void> {
    try {
      await SafeStorage.setItem(BATTERY_OPTIMIZER_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save battery optimizer settings:', error);
    }
  }

  /**
   * Updates the current battery status
   */
  private async updateBatteryStatus(): Promise<void> {
    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      
      let batteryState: BatteryState;
      switch (state) {
        case Battery.BatteryState.CHARGING:
          batteryState = BatteryState.CHARGING;
          break;
        case Battery.BatteryState.FULL:
          batteryState = BatteryState.FULL;
          break;
        default:
          batteryState = BatteryState.UNPLUGGED;
      }

      let levelCategory: BatteryLevel;
      if (level * 100 <= BATTERY_THRESHOLDS.CRITICAL) {
        levelCategory = BatteryLevel.CRITICAL;
      } else if (level * 100 <= BATTERY_THRESHOLDS.LOW) {
        levelCategory = BatteryLevel.LOW;
      } else {
        levelCategory = BatteryLevel.NORMAL;
      }

      // Get low power mode status (iOS only)
      let isLowPowerMode = false;
      if (Platform.OS === 'ios') {
        isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();
      }

      const newStatus: BatteryStatus = {
        level: level * 100, // Convert to percentage
        batteryState,
        levelCategory,
        isLowPowerMode,
      };

      const statusChanged = 
        this.batteryStatus.level !== newStatus.level ||
        this.batteryStatus.batteryState !== newStatus.batteryState ||
        this.batteryStatus.levelCategory !== newStatus.levelCategory ||
        this.batteryStatus.isLowPowerMode !== newStatus.isLowPowerMode;
      
      this.batteryStatus = newStatus;
      
      // Notify listeners if status changed
      if (statusChanged) {
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to update battery status:', error);
    }
  }

  /**
   * Handles app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    // If app goes to background and background updates are disabled, pause updates
    if (nextAppState === 'background' && !this.config.enableBackgroundUpdates) {
      this.clearAllTimers();
    } else if (nextAppState === 'active') {
      // When app comes to foreground, update status
      this.updateBatteryStatus();
    }
  };

  /**
   * Handles network connectivity changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    this.networkStatus = {
      isConnected: state.isConnected ?? false,
      type: this.getNetworkType(state),
      isMetered: state.isConnectionExpensive ?? false,
      details: state.details,
    };
  };

  /**
   * Determines network type from NetInfo state
   */
  private getNetworkType(state: NetInfoState): 'wifi' | 'cellular' | 'unknown' {
    if (state.type === 'wifi') return 'wifi';
    if (state.type === 'cellular') return 'cellular';
    return 'unknown';
  }

  /**
   * Clears all active timers
   */
  private clearAllTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Adds a timer to the tracking list
   */
  private trackTimer(timer: NodeJS.Timeout): void {
    this.timers.push(timer);
  }

  /**
   * Notifies all registered listeners about battery status changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.batteryStatus);
      } catch (error) {
        console.error('Error in battery state change listener:', error);
      }
    });
  }

  /**
   * Updates the configuration for the battery optimizer
   */
  public updateConfig(config: Partial<BatteryOptimizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current battery status
   */
  public getBatteryStatus(): BatteryStatus {
    return { ...this.batteryStatus };
  }

  /**
   * Gets the current network status
   */
  public getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * Gets the optimal update interval based on current battery and network status
   */
  public getOptimalUpdateInterval(): number {
    if (!this.config.enableBatteryOptimization) {
      // If battery optimization is disabled, use normal intervals
      return BATTERY_STATE_INTERVALS[BatteryState.CHARGING][BatteryLevel.NORMAL];
    }

    const { batteryState, levelCategory, isLowPowerMode } = this.batteryStatus;
    let interval = 0;

    // Check for custom intervals in config
    if (
      this.config.customUpdateIntervals &&
      this.config.customUpdateIntervals[batteryState] &&
      this.config.customUpdateIntervals[batteryState]?.[levelCategory]
    ) {
      interval = this.config.customUpdateIntervals[batteryState]![levelCategory]!;
    } else {
      // Use default intervals
      interval = BATTERY_STATE_INTERVALS[batteryState][levelCategory];
    }

    // Apply low power mode adjustment (increase interval by 50% if in low power mode)
    if (isLowPowerMode) {
      interval = Math.round(interval * 1.5);
    }

    // Apply network-based adjustments if enabled
    if (this.config.enableNetworkOptimization) {
      const networkSettings = NETWORK_OPTIMIZATION[this.networkStatus.type];
      interval = Math.max(interval, networkSettings.minUpdateInterval);
    }

    return interval;
  }

  /**
   * Gets the optimal location accuracy settings based on battery status
   */
  public getLocationAccuracySettings(): LocationAccuracySettings {
    if (!this.config.enableBatteryOptimization) {
      // If battery optimization is disabled, use high accuracy settings
      return LOCATION_ACCURACY_SETTINGS[BatteryState.CHARGING][BatteryLevel.NORMAL];
    }

    const { batteryState, levelCategory, isLowPowerMode } = this.batteryStatus;
    const settings = { ...LOCATION_ACCURACY_SETTINGS[batteryState][levelCategory] };

    // If in low power mode, reduce accuracy further
    if (isLowPowerMode) {
      if (settings.accuracy > Location.Accuracy.Lowest) {
        settings.accuracy = settings.accuracy - 1;
      }
      settings.distanceInterval = settings.distanceInterval * 1.5;
      settings.timeInterval = settings.timeInterval * 1.5;
    }

    return settings;
  }

  /**
   * Gets the network optimization settings based on current connection
   */
  public getNetworkOptimizationSettings() {
    return NETWORK_OPTIMIZATION[this.networkStatus.type];
  }

  /**
   * Registers a listener for battery state changes
   */
  public addBatteryStateChangeListener(listener: BatteryStateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Schedules a function to run at the optimal interval
   * Returns a cleanup function to cancel the scheduled executions
   */
  public scheduleAtOptimalInterval(
    callback: () => void,
    immediateExecution = false
  ): () => void {
    if (immediateExecution) {
      callback();
    }

    const scheduleNext = () => {
      const interval = this.getOptimalUpdateInterval();
      const timer = setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.error('Error in scheduled callback:', error);
        }
        scheduleNext();
      }, interval);
      
      this.trackTimer(timer);
    };

    scheduleNext();

    // Return cleanup function
    return () => {
      this.clearAllTimers();
    };
  }

  /**
   * Cleans up resources when no longer needed
   */
  public cleanup(): void {
    if (this.batterySubscription) {
      this.batterySubscription.remove();
      this.batterySubscription = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.networkSubscription) {
      this.networkSubscription();
      this.networkSubscription = null;
    }

    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }

    this.clearAllTimers();
    this.listeners = [];
  }
}

export default BatteryOptimizer.getInstance(); 