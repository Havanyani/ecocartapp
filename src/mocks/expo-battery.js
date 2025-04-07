/**
 * Mock implementation for expo-battery
 * This provides simulated battery functionality for web environment
 */

console.log('[MOCK BATTERY] Loading expo-battery mock module');

// Define battery states to match expo-battery
const BatteryState = {
  UNKNOWN: 0,
  UNPLUGGED: 1,
  CHARGING: 2,
  FULL: 3
};

console.log('[MOCK BATTERY] BatteryState initialized:', BatteryState);

// Default battery level (100%)
let currentBatteryLevel = 1.0;
let currentBatteryState = BatteryState.FULL;

console.log('[MOCK BATTERY] Default battery values set:', {
  level: currentBatteryLevel,
  state: currentBatteryState
});

// Get the current battery level (0.0 - 1.0)
async function getBatteryLevelAsync() {
  console.log('[MOCK BATTERY] getBatteryLevelAsync called');
  
  // Use the Web Battery API if available
  if (typeof navigator !== 'undefined' && navigator.getBattery) {
    try {
      console.log('[MOCK BATTERY] Web Battery API available, attempting to use');
      const battery = await navigator.getBattery();
      console.log('[MOCK BATTERY] Web Battery level:', battery.level);
      return battery.level;
    } catch (e) {
      console.log('[MOCK BATTERY] Web Battery API error:', e);
      console.log('[MOCK BATTERY] Using mock battery level:', currentBatteryLevel);
      return currentBatteryLevel;
    }
  }
  
  console.log('[MOCK BATTERY] Web Battery API not available, using mock level:', currentBatteryLevel);
  return currentBatteryLevel;
}

// Get the current battery state
async function getBatteryStateAsync() {
  console.log('[MOCK BATTERY] getBatteryStateAsync called');
  
  // Use the Web Battery API if available
  if (typeof navigator !== 'undefined' && navigator.getBattery) {
    try {
      console.log('[MOCK BATTERY] Web Battery API available, attempting to use');
      const battery = await navigator.getBattery();
      
      let state;
      if (battery.charging) {
        state = battery.level >= 0.99 ? BatteryState.FULL : BatteryState.CHARGING;
      } else {
        state = BatteryState.UNPLUGGED;
      }
      
      console.log('[MOCK BATTERY] Web Battery state:', state);
      return state;
    } catch (e) {
      console.log('[MOCK BATTERY] Web Battery API error:', e);
      console.log('[MOCK BATTERY] Using mock battery state:', currentBatteryState);
      return currentBatteryState;
    }
  }
  
  console.log('[MOCK BATTERY] Web Battery API not available, using mock state:', currentBatteryState);
  return currentBatteryState;
}

// For testing - allow manual setting of battery values
function _setMockBatteryLevel(level) {
  console.log('[MOCK BATTERY] Setting mock battery level to:', level);
  currentBatteryLevel = Math.max(0, Math.min(1, level));
}

function _setMockBatteryState(state) {
  console.log('[MOCK BATTERY] Setting mock battery state to:', state);
  currentBatteryState = state;
}

console.log('[MOCK BATTERY] Exporting mock functions');

// Export the mock functions
export {
    BatteryState, _setMockBatteryLevel,
    _setMockBatteryState, getBatteryLevelAsync,
    getBatteryStateAsync
};

// Also export as default for compatibility with require() syntax
const defaultExport = {
  BatteryState,
  getBatteryLevelAsync,
  getBatteryStateAsync,
  _setMockBatteryLevel,
  _setMockBatteryState
};

console.log('[MOCK BATTERY] Default export:', defaultExport);
export default defaultExport;
