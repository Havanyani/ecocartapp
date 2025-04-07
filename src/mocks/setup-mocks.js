/**
 * This file sets up global mocks for modules that don't work well in web environment
 * It should be imported at the top of App.js
 */

import { Platform } from 'react-native';

console.log('[MOCKS DEBUG] setup-mocks.js loaded, platform:', Platform.OS);

// Only run setup if we're on web platform
if (Platform.OS === 'web') {
  console.log('[MOCKS DEBUG] Web platform detected, setting up mocks');
  
  // Battery mock
  if (!global.ExpoNativeBattery) {
    console.log('[MOCKS DEBUG] Creating global ExpoNativeBattery mock');
    global.ExpoNativeBattery = {
      getBatteryLevelAsync: async () => {
        console.log('[MOCKS DEBUG] Mock getBatteryLevelAsync called');
        return 1.0;
      },
      getBatteryStateAsync: async () => {
        console.log('[MOCKS DEBUG] Mock getBatteryStateAsync called');
        return 0;
      },
      BatteryState: {
        UNKNOWN: 0,
        UNPLUGGED: 1,
        CHARGING: 2,
        FULL: 3
      }
    };
    console.log('[MOCKS DEBUG] ExpoNativeBattery mock created successfully');
  }
  
  // FileSystem mock
  if (!global.ExpoFileSystem) {
    console.log('[MOCKS DEBUG] Creating global ExpoFileSystem mock');
    global.ExpoFileSystem = {
      documentDirectory: 'file://document-directory/',
      cacheDirectory: 'file://cache-directory/',
      writeAsStringAsync: async (path, data) => {
        console.log('[MOCKS DEBUG] Mock writeAsStringAsync called', { path });
        localStorage.setItem(`expo-fs:${path}`, data);
      },
      readAsStringAsync: async (path) => {
        console.log('[MOCKS DEBUG] Mock readAsStringAsync called', { path });
        const data = localStorage.getItem(`expo-fs:${path}`);
        if (data === null) {
          throw new Error(`File not found: ${path}`);
        }
        return data;
      }
    };
    console.log('[MOCKS DEBUG] ExpoFileSystem mock created successfully');
  }
  
  // TensorFlow React Native mock setup
  if (!global.TensorFlowReactNative) {
    console.log('[MOCKS DEBUG] Creating global TensorFlowReactNative mock');
    global.TensorFlowReactNative = {
      ready: true,
      cameraWithTensors: () => ({
        tensor: null,
        elementWidth: 0,
        elementHeight: 0
      }),
      decodeJpeg: () => ({
        shape: [1, 1, 3],
        dtype: 'float32'
      })
    };
    console.log('[MOCKS DEBUG] TensorFlowReactNative mock created successfully');
  }
  
  // Set up module aliases to fix incorrect import paths
  // This ensures that regardless of how modules are imported, they get the right mock
  if (module && module.constructor && module.constructor.register) {
    try {
      console.log('[MOCKS DEBUG] Attempting to register module aliases');
      
      // Battery mock
      try {
        const batteryMockPath = './expo-battery.js';
        console.log('[MOCKS DEBUG] Loading battery mock from:', batteryMockPath);
        
        const batteryMock = require(batteryMockPath).default;
        console.log('[MOCKS DEBUG] Battery mock loaded successfully');
        
        console.log('[MOCKS DEBUG] Registering "expo-battery" alias');
        module.constructor.register('expo-battery', () => batteryMock);
        
        console.log('[MOCKS DEBUG] Registering "../../../src/mocks/expo-battery" alias');
        module.constructor.register('../../../src/mocks/expo-battery', () => batteryMock);
      } catch (err) {
        console.error('[MOCKS DEBUG] Failed to load battery mock:', err);
      }
      
      // FileSystem mock
      try {
        const fileSystemMockPath = './expo-file-system.js';
        console.log('[MOCKS DEBUG] Loading file-system mock from:', fileSystemMockPath);
        
        const fileSystemMock = require(fileSystemMockPath).default;
        console.log('[MOCKS DEBUG] FileSystem mock loaded successfully');
        
        console.log('[MOCKS DEBUG] Registering "expo-file-system" alias');
        module.constructor.register('expo-file-system', () => fileSystemMock);
      } catch (err) {
        console.error('[MOCKS DEBUG] Failed to load file-system mock:', err);
      }
      
      // TensorFlow mock
      try {
        const tensorflowMockPath = './tensorflow-react-native.js';
        console.log('[MOCKS DEBUG] Loading tensorflow mock from:', tensorflowMockPath);
        
        const tensorflowMock = require(tensorflowMockPath).default;
        console.log('[MOCKS DEBUG] TensorFlow mock loaded successfully');
        
        console.log('[MOCKS DEBUG] Registering "@tensorflow/tfjs-react-native" alias');
        module.constructor.register('@tensorflow/tfjs-react-native', () => tensorflowMock);
      } catch (err) {
        console.error('[MOCKS DEBUG] Failed to load tensorflow mock:', err);
      }
      
      console.log('[MOCKS DEBUG] Module aliases registered successfully');
    } catch (e) {
      console.warn('[MOCKS DEBUG] Failed to register module alias:', e);
    }
  } else {
    console.warn('[MOCKS DEBUG] Module registration not available');
  }
  
  console.log('[MOCKS DEBUG] Global mocks setup complete');
} else {
  // On native platforms, ensure that the modules are properly linked
  console.log('[MOCKS DEBUG] Native platform detected, no mocks needed');
  
  try {
    // Pre-import the modules to ensure they're ready to use
    const fakeBatteryImport = require('expo-battery');
    console.log('[MOCKS DEBUG] expo-battery module available on native platform:', !!fakeBatteryImport);
  } catch (e) {
    console.warn('[MOCKS DEBUG] Failed to import expo-battery on native platform:', e.message);
  }

  // Mock expo-battery for iOS and Android
  console.log('[MOCKS] Setting up expo-battery mock');
  jest.mock('expo-battery', () => require('./expo-battery.js'));
} 