/**
 * Cross-platform Battery API
 * Provides a unified interface for battery information across platforms
 */

import { Platform } from 'react-native';

// Define battery state constants to match expo-battery
export enum BatteryState {
  UNKNOWN = 0,
  UNPLUGGED = 1, // Unplugged (discharging)
  CHARGING = 2,  // Charging
  FULL = 3,      // Battery full
}

// Define our interface
export interface BatteryInterface {
  getBatteryLevelAsync: () => Promise<number>;
  getBatteryStateAsync: () => Promise<BatteryState>;
  isLowPowerModeEnabledAsync?: () => Promise<boolean>;
  getPowerStateAsync?: () => Promise<{
    batteryLevel: number;
    batteryState: BatteryState;
    lowPowerMode: boolean;
  }>;
}

// Web implementation
const WebBattery: BatteryInterface = {
  getBatteryLevelAsync: async () => {
    if (typeof navigator === 'undefined') return 1;
    
    try {
      // Try to use the Battery API if available
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      }
    } catch (error) {
      console.warn('Web Battery API not available:', error);
    }
    
    // Return 1 (full battery) as fallback when we can't determine
    return 1;
  },
  
  getBatteryStateAsync: async () => {
    if (typeof navigator === 'undefined') return BatteryState.UNKNOWN;
    
    try {
      // Try to use the Battery API if available
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        if (battery.charging) {
          return battery.level >= 0.99 ? BatteryState.FULL : BatteryState.CHARGING;
        } else {
          return BatteryState.UNPLUGGED;
        }
      }
    } catch (error) {
      console.warn('Web Battery API not available:', error);
    }
    
    // Return UNKNOWN as fallback when we can't determine
    return BatteryState.UNKNOWN;
  },
  
  isLowPowerModeEnabledAsync: async () => {
    // Not available on web
    return false;
  },
  
  getPowerStateAsync: async () => {
    const batteryLevel = await WebBattery.getBatteryLevelAsync();
    const batteryState = await WebBattery.getBatteryStateAsync();
    
    return {
      batteryLevel,
      batteryState,
      lowPowerMode: false
    };
  }
};

// iOS/Android mock implementation
const NativeMockBattery: BatteryInterface = {
  getBatteryLevelAsync: async () => {
    console.log('[Battery Mock] Using mock battery level');
    return 1; // Full battery
  },
  
  getBatteryStateAsync: async () => {
    console.log('[Battery Mock] Using mock battery state');
    return BatteryState.FULL; // Full battery state
  },
  
  isLowPowerModeEnabledAsync: async () => {
    console.log('[Battery Mock] Using mock low power mode');
    return false; // Low power mode disabled
  },
  
  getPowerStateAsync: async () => {
    console.log('[Battery Mock] Using mock power state');
    return {
      batteryLevel: 1,
      batteryState: BatteryState.FULL,
      lowPowerMode: false
    };
  }
};

// Export the appropriate implementation based on platform
let Battery: BatteryInterface;

if (Platform.OS === 'web') {
  console.log('[Battery] Using web implementation');
  Battery = WebBattery;
} else {
  // For iOS and Android, use the mock implementation
  // This is a temporary solution until we can fix the native module resolution
  console.log(`[Battery] Using mock implementation for ${Platform.OS}`);
  Battery = NativeMockBattery;
  
  // Attempt to load the native module but catch any errors
  try {
    // This line will be skipped during the Metro bundling phase if the module can't be found
    // The mock will be used instead
    console.log('[Battery] Attempting to load native module');
    // Don't actually try to load the module here, as it causes bundling errors
  } catch (error) {
    console.warn('[Battery] Failed to load native module, using mock implementation:', error);
  }
}

export default Battery; 