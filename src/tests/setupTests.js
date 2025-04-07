// Set up Jest mocks
import 'react-native-gesture-handler/jestSetup';

// Mock the expo-camera module
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestMicrophonePermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
      FlashMode: {
        on: 'on',
        off: 'off',
        auto: 'auto',
        torch: 'torch',
      },
      AutoFocus: {
        on: 'on',
        off: 'off',
      },
    },
  },
}));

// Mock the expo-image-picker module
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    cancelled: false,
    assets: [{ uri: 'file:///mock/image.jpg' }],
  }),
}));

// Mock the AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

// Mock the MaterialCommunityIcons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: function MockMaterialCommunityIcons(props) {
      return <View testID={`icon-${props.name}`} {...props} />;
    },
  };
});

// Mock the react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the Dimensions API
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
  }),
}));

// Suppress React Navigation warning
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock timers
jest.useFakeTimers();

// Global error handling
global.console.error = jest.fn().mockImplementation((message) => {
  throw new Error(message);
});

global.console.warn = jest.fn();

// Clean up all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 