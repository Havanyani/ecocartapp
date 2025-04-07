/**
 * Cross-platform API index
 * Exports unified interfaces for APIs that might not be available on all platforms
 * Particularly useful for providing web fallbacks for native modules
 */

// Export all cross-platform modules
export { default as Battery } from './battery';
export { default as Device } from './device';
export { default as FileSystem } from './fileSystem';
export { default as Sharing } from './sharing';

/**
 * Define types for global declarations
 */
declare global {
  interface Window {
    Expo?: any;
  }
  var Expo: any;
}

/**
 * Detect which platform modules are compatible with the current environment
 * and patch any required global references.
 */
export function initCrossPlatformModules() {
  const { Platform } = require('react-native');
  console.log(`[Cross-Platform] Initializing for platform: ${Platform.OS}`);
  
  if (Platform.OS === 'web') {
    console.log('[Cross-Platform] Setting up web compatibility');
    
    // Patch for theme system issues on web
    try {
      const { patchThemeSystem } = require('../webFallbacks');
      patchThemeSystem();
      console.log('[Cross-Platform] Patched theme system for web');
    } catch (error) {
      console.warn('[Cross-Platform] Could not patch theme system:', error);
    }
  } else if (Platform.OS === 'ios') {
    console.log('[Cross-Platform] Setting up iOS compatibility');
    
    // Setup iOS-specific mocks and compatibility layers
    try {
      // Preload mocks to ensure they're available before modules try to access them
      console.log('[Cross-Platform] Setting up iOS mocks');
      
      // This ensures the mock is registered in the module system
      // It won't throw an error if it can't find the actual module
      global.Expo = global.Expo || {};
      global.Expo.Battery = {
        getBatteryLevelAsync: async () => 1,
        getBatteryStateAsync: async () => 3, // FULL
        isLowPowerModeEnabledAsync: async () => false
      };
      
      console.log('[Cross-Platform] iOS mocks setup complete');
    } catch (error) {
      console.warn('[Cross-Platform] Error setting up iOS mocks:', error);
    }
  }
} 