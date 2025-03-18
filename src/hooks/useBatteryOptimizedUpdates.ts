import BatteryOptimizer, { BatteryLevel, LocationAccuracySettings } from '@/utils/BatteryOptimizer';
import { SafeStorage } from '@/utils/storage';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

// Storage key for battery optimization settings
const BATTERY_OPTIMIZATION_SETTINGS_KEY = 'ecocart_battery_optimization_settings';

/**
 * Interface for the return value of useBatteryOptimizedUpdates hook
 */
export interface UseBatteryOptimizedUpdatesReturn {
  isEnabled: boolean;
  batteryState: Battery.BatteryState;
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
  const [batteryState, setBatteryState] = useState<Battery.BatteryState>(Battery.BatteryState.UNKNOWN);
  const [batteryLevel, setBatteryLevel] = useState<number>(1.0);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [locationAccuracy, setLocationAccuracySetting] = useState<LocationAccuracySettings>(LocationAccuracySettings.MEDIUM);
  const [backgroundUpdatesEnabled, setBackgroundUpdatesEnabled] = useState<boolean>(true);
  const [updateInterval, setUpdateInterval] = useState<number>(30000); // Default 30 seconds
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  
  // Initialize settings and listeners
  useEffect(() => {
    const batteryOptimizer = BatteryOptimizer;
    
    // Load initial state from BatteryOptimizer
    setBatteryState(batteryOptimizer.getBatteryState());
    setBatteryLevel(batteryOptimizer.getBatteryLevel());
    setIsEnabled(batteryOptimizer.isEnabled());
    setLocationAccuracySetting(batteryOptimizer.getLocationAccuracy());
    setBackgroundUpdatesEnabled(batteryOptimizer.isBackgroundUpdatesEnabled());
    setUpdateInterval(batteryOptimizer.getOptimalUpdateInterval());
    
    // Add listener for changes
    const cleanup = batteryOptimizer.addListener(() => {
      setBatteryState(batteryOptimizer.getBatteryState());
      setBatteryLevel(batteryOptimizer.getBatteryLevel());
      setUpdateInterval(batteryOptimizer.getOptimalUpdateInterval());
    });
    
    // Check for location permissions
    const checkPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
    };
    
    checkPermissions();
    
    return cleanup;
  }, []);
  
  // Toggle battery optimization
  const toggleOptimization = useCallback(async (): Promise<void> => {
    const batteryOptimizer = BatteryOptimizer;
    const newEnabledState = !batteryOptimizer.isEnabled();
    
    await batteryOptimizer.setEnabled(newEnabledState);
    setIsEnabled(newEnabledState);
    setUpdateInterval(batteryOptimizer.getOptimalUpdateInterval());
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({ enabled: newEnabledState })
    );
  }, []);
  
  // Set location accuracy
  const setLocationAccuracy = useCallback(async (accuracy: LocationAccuracySettings): Promise<void> => {
    const batteryOptimizer = BatteryOptimizer;
    
    await batteryOptimizer.setLocationAccuracy(accuracy);
    setLocationAccuracySetting(accuracy);
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({ locationAccuracy: accuracy })
    );
  }, []);
  
  // Toggle background updates
  const toggleBackgroundUpdates = useCallback(async (): Promise<void> => {
    const batteryOptimizer = BatteryOptimizer;
    const newState = !batteryOptimizer.isBackgroundUpdatesEnabled();
    
    await batteryOptimizer.setBackgroundUpdatesEnabled(newState);
    setBackgroundUpdatesEnabled(newState);
    
    // Save setting
    await SafeStorage.setItem(
      BATTERY_OPTIMIZATION_SETTINGS_KEY, 
      JSON.stringify({ backgroundUpdatesEnabled: newState })
    );
  }, []);
  
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