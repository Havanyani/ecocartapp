/**
 * Mock implementation for expo-battery
 * This provides simulated battery functionality for iOS
 */

console.log('[MOCK BATTERY] Loading mock module');

// Define battery states to match expo-battery
const BatteryState = {
  UNKNOWN: 0,
  UNPLUGGED: 1,
  CHARGING: 2,
  FULL: 3
};

// Mock implementation of battery functions
module.exports = {
  BatteryState,
  
  // Return a value between 0 and 1
  getBatteryLevelAsync: async () => {
    console.log('[MOCK BATTERY] getBatteryLevelAsync called');
    return 1.0; // Mock full battery level
  },
  
  // Return a battery state
  getBatteryStateAsync: async () => {
    console.log('[MOCK BATTERY] getBatteryStateAsync called');
    return BatteryState.FULL; // Mock full battery state
  },
  
  // Check if low power mode is enabled
  isLowPowerModeEnabledAsync: async () => {
    console.log('[MOCK BATTERY] isLowPowerModeEnabledAsync called');
    return false; // Mock low power mode disabled
  },
  
  // Add event listener functions (return object with remove method)
  addBatteryLevelListener: () => {
    console.log('[MOCK BATTERY] addBatteryLevelListener called');
    return { remove: () => {} };
  },
  
  addBatteryStateListener: () => {
    console.log('[MOCK BATTERY] addBatteryStateListener called');
    return { remove: () => {} };
  },
  
  addLowPowerModeListener: () => {
    console.log('[MOCK BATTERY] addLowPowerModeListener called');
    return { remove: () => {} };
  }
};