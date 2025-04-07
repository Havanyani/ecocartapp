// This file serves as the entry point for web builds
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Mock problematic modules before they get imported
if (Platform.OS === 'web') {
  console.log('Setting up web-specific mocks...');
  
  // Disable native modules that cause issues on web
  const disableNativeModule = (moduleName) => {
    try {
      // Prevent bundler from trying to include these modules on web
      window[moduleName] = { __esModule: true };
    } catch (e) {
      console.warn(`Failed to disable native module ${moduleName}:`, e);
    }
  };
  
  // List of native modules to disable on web
  [
    'react-native-maps',
    'victory-native',
    '@shopify/react-native-skia',
    'react-native-reanimated',
  ].forEach(disableNativeModule);
}

// Import the app component
import App from './App';

// Register the root component
registerRootComponent(App); 