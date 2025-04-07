/**
 * Mock implementation of expo-battery for iOS
 */

// Define battery state constants
const BatteryState = {
  UNKNOWN: 0,
  UNPLUGGED: 1, // Unplugged (discharging)
  CHARGING: 2,  // Charging
  FULL: 3,      // Battery full
};

// Mock implementation
module.exports = {
  BatteryState,

  // Return a value between 0 and 1
  getBatteryLevelAsync: async () => {
    console.log('[expo-battery mock] getBatteryLevelAsync called');
    return 1.0; // Mock full battery level
  },

  // Return a battery state
  getBatteryStateAsync: async () => {
    console.log('[expo-battery mock] getBatteryStateAsync called');
    return BatteryState.FULL; // Mock full battery state
  },

  // Check if low power mode is enabled
  isLowPowerModeEnabledAsync: async () => {
    console.log('[expo-battery mock] isLowPowerModeEnabledAsync called');
    return false; // Mock low power mode disabled
  },

  // Add event listener functions
  addBatteryLevelListener: () => {
    console.log('[expo-battery mock] addBatteryLevelListener called');
    return { remove: () => {} };
  },

  addBatteryStateListener: () => {
    console.log('[expo-battery mock] addBatteryStateListener called');
    return { remove: () => {} };
  },

  addLowPowerModeListener: () => {
    console.log('[expo-battery mock] addLowPowerModeListener called');
    return { remove: () => {} };
  },

  // Power state info
  getPowerStateAsync: async () => {
    console.log('[expo-battery mock] getPowerStateAsync called');
    return {
      batteryLevel: 1.0,
      batteryState: BatteryState.FULL,
      lowPowerMode: false
    };
  }
}; 