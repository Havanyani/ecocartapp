import { BatteryLevel, LocationAccuracySettings } from '@/utils/BatteryOptimizer';
import { SafeStorage } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Import cross-platform Battery module
import Battery, { BatteryState } from '@/utils/cross-platform/battery';

// Conditionally import expo-location
let Location: any = {
  requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied'
  }
};

// Try to load Location on native platforms
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch (err) {
    console.warn('Failed to load expo-location module:', err);
  }
}

// Storage key for battery optimization settings
const BATTERY_OPTIMIZATION_SETTINGS_KEY = 'ecocart_battery_optimization_settings';

/**
 * Interface for the return value of useBatteryOptimizedUpdates hook
 */
export interface UseBatteryOptimizedUpdatesReturn {
  isEnabled: boolean;
  batteryState: number;
  batteryLevel: number;
  batteryLevelCategory: BatteryLevel;
  updateInterval: number;
  locationAccuracy: LocationAccuracySettings;
  toggleOptimization: () => Promise<void>;
  setLocationAccuracy: (accuracy: LocationAccuracySettings) => Promise<void>;
  toggleBackgroundUpdates: () => Promise<void>;
  isBackgroundUpdatesEnabled: boolean;
}

/**
 * A hook for using battery-optimized updates in components.
 * It provides battery state information and methods to control
 * battery optimization settings.
 */
export function useBatteryOptimizedUpdates(): UseBatteryOptimizedUpdatesReturn {
  const [batteryState, setBatteryState] = useState<number>(BatteryState.UNKNOWN);
  const [batteryLevel, setBatteryLevel] = useState<number>(1.0);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [locationAccuracy, setLocationAccuracySetting] = useState<LocationAccuracySettings>(LocationAccuracySettings.MEDIUM);
  const [backgroundUpdatesEnabled, setBackgroundUpdatesEnabled] = useState<boolean>(true);
  const [updateInterval, setUpdateInterval] = useState<number>(30000); // Default 30 seconds
  const [permissionStatus, setPermissionStatus] = useState<string>(Location.PermissionStatus.UNDETERMINED);
  
  // Initialize settings and listeners
  useEffect(() => {
    const loadBatteryStatus = async () => {
      try {
        // Get initial battery state
        const state = await Battery.getBatteryStateAsync();
        const level = await Battery.getBatteryLevelAsync();
        
        setBatteryState(state);
        setBatteryLevel(level);
        
        // Load optimizer settings if available
        const storedSettings = await SafeStorage.getItem(BATTERY_OPTIMIZATION_SETTINGS_KEY);
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          setIsEnabled(settings.enabled ?? true);
          setLocationAccuracySetting(settings.locationAccuracy ?? LocationAccuracySettings.MEDIUM);
          setBackgroundUpdatesEnabled(settings.backgroundUpdatesEnabled ?? true);
        }
        
        // Calculate optimal update interval based on battery level
        updateOptimalInterval(state, level);
      } catch (error) {
        console.warn('Error loading battery status:', error);
      }
    };
    
    const updateOptimalInterval = (state: number, level: number) => {
      let interval = 30000; // Default 30 seconds
      
      if (state === BatteryState.UNPLUGGED) {
        if (level <= 0.15) {
          interval = 180000; // 3 minutes for critical battery
        } else if (level <= 0.3) {
          interval = 60000; // 1 minute for low battery
        }
      } else if (state === BatteryState.CHARGING) {
        interval = 15000; // 15 seconds when charging
      } else if (state === BatteryState.FULL) {
        interval = 10000; // 10 seconds when full
      }
      
      setUpdateInterval(interval);
    };
    
    // Check for location permissions
    const checkPermissions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
      } catch (error) {
        console.warn('Error checking location permissions:', error);
        setPermissionStatus('denied');
      }
    };
    
    loadBatteryStatus();
    checkPermissions();
    
    // Set up interval to periodically check battery
    const intervalId = setInterval(loadBatteryStatus, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Toggle battery optimization
  const toggleOptimization = useCallback(async (): Promise<void> => {
    const newEnabledState = !isEnabled;
    setIsEnabled(newEnabledState);
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({ 
        enabled: newEnabledState,
        locationAccuracy,
        backgroundUpdatesEnabled
      })
    );
  }, [isEnabled, locationAccuracy, backgroundUpdatesEnabled]);
  
  // Set location accuracy
  const setLocationAccuracy = useCallback(async (accuracy: LocationAccuracySettings): Promise<void> => {
    setLocationAccuracySetting(accuracy);
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({
        enabled: isEnabled,
        locationAccuracy: accuracy,
        backgroundUpdatesEnabled
      })
    );
  }, [isEnabled, backgroundUpdatesEnabled]);
  
  // Toggle background updates
  const toggleBackgroundUpdates = useCallback(async (): Promise<void> => {
    const newState = !backgroundUpdatesEnabled;
    setBackgroundUpdatesEnabled(newState);
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({
        enabled: isEnabled,
        locationAccuracy,
        backgroundUpdatesEnabled: newState
      })
    );
  }, [isEnabled, locationAccuracy, backgroundUpdatesEnabled]);
  
  // Calculate the battery level category
  const batteryLevelCategory = (() => {
    if (batteryLevel <= 0.15) {
      return BatteryLevel.CRITICAL;
    } else if (batteryLevel <= 0.3) {
      return BatteryLevel.LOW;
    } else {
      return BatteryLevel.NORMAL;
    }
  })();
  
  return {
    isEnabled,
    batteryState,
    batteryLevel,
    batteryLevelCategory,
    updateInterval,
    locationAccuracy,
    toggleOptimization,
    setLocationAccuracy,
    toggleBackgroundUpdates,
    isBackgroundUpdatesEnabled: backgroundUpdatesEnabled,
  };
} 