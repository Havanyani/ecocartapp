import '@testing-library/jest-native/extend-expect';
import React from 'react';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  
  return {
    ...Reanimated,
    default: {
      ...Reanimated.default,
      createAnimatedComponent: (component: React.ComponentType<any>) => {
        const AnimatedComponent = (props: any) => {
          return React.createElement(component, props);
        };
        AnimatedComponent.displayName = `Animated.${component.displayName || component.name || 'Component'}`;
        return AnimatedComponent;
      },
    },
  };
});

// Mock react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock NativeEventEmitter
  class MockNativeEventEmitter {
    addListener = jest.fn();
    removeListener = jest.fn();
    removeAllListeners = jest.fn();
    removeSubscription = jest.fn();
    listeners = jest.fn(() => []);
  }

  // Create basic component mock factory
  const createComponentMock = (name: string) => {
    type ComponentProps = {
      children?: React.ReactNode;
      testID?: string;
      [key: string]: any;
    };

    const Component = ({ children, testID, ...props }: ComponentProps) => 
      React.createElement(name, { testID, ...props }, children);
    Component.displayName = name;
    return Component;
  };

  // Mock SettingsManager
  RN.NativeModules.SettingsManager = {
    getConstants: () => ({
      settings: {
        AppleLocale: 'en_US',
        AppleLanguages: ['en'],
      }
    }),
  };

  // Mock other native modules
  RN.NativeModules.StatusBarManager = {
    getHeight: jest.fn(),
    setColor: jest.fn(),
    setStyle: jest.fn(),
    setHidden: jest.fn(),
  };

  // Mock DevSettings
  RN.NativeModules.DevSettings = {
    addMenuItem: jest.fn(),
    reload: jest.fn(),
  };

  // Mock Clipboard
  RN.NativeModules.Clipboard = {
    getString: jest.fn(),
    setString: jest.fn(),
  };

  // Mock ProgressBar
  RN.NativeModules.ProgressBar = {
    startAnimation: jest.fn(),
    stopAnimation: jest.fn(),
  };

  // Mock PushNotificationIOS
  RN.NativeModules.PushNotificationManager = {
    presentLocalNotification: jest.fn(),
    scheduleLocalNotification: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    removeAllDeliveredNotifications: jest.fn(),
    getDeliveredNotifications: jest.fn(),
    removeDeliveredNotifications: jest.fn(),
    getScheduledLocalNotifications: jest.fn(),
    requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  };

  return {
    ...RN,
    NativeModules: RN.NativeModules,
    NativeEventEmitter: MockNativeEventEmitter,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      Version: 123,
      isTesting: true,
      select: (obj: { ios?: unknown; default?: unknown }) => obj.ios || obj.default,
    },
    // Mock basic components
    View: createComponentMock('View'),
    Text: createComponentMock('Text'),
    TouchableOpacity: createComponentMock('TouchableOpacity'),
    TouchableHighlight: createComponentMock('TouchableHighlight'),
    TouchableWithoutFeedback: createComponentMock('TouchableWithoutFeedback'),
    ScrollView: createComponentMock('ScrollView'),
    FlatList: createComponentMock('FlatList'),
    SectionList: createComponentMock('SectionList'),
  };
});

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  check: jest.fn(() => Promise.resolve(true)),
  request: jest.fn(() => Promise.resolve(true)),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {
    ACTIVE: 'ACTIVE',
    END: 'END',
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock @react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

afterAll(() => {
  // Add any global cleanup here
  jest.clearAllMocks();
});

// Add global mocks for fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    headers: new Headers({
      'Content-type': 'application/json',
    }),
  }))
) as jest.Mock;

// Setup global test environment
beforeAll(() => {
  global.fetch = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
  startTransaction: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  } as const,
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn()
}));

jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  Constants: { manifest: { extra: { apiUrl: 'https://api.example.com' } } }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  createIconSet: () => 'Icon'
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock Crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn().mockResolvedValue('mocked-hash'),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256'
  } as const
}));

// Mock Secure Store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

// Mock Chart Kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart'
}));

// Mock React Redux
jest.mock('react-redux', () => ({
  Provider: 'Provider',
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));

// Mock React Native Components
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => 'TouchableOpacity');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');

// Mock WebSocket Performance
jest.mock('@/utils/WebSocketPerformance', () => ({
  WebSocketPerformance: {
    getMetricsSummary: jest.fn().mockReturnValue({
      averageLatency: 100,
      averageCompressionRatio: 0.6,
      averageProcessingTime: 50,
      averageBatchSize: 50,
      totalMetrics: {
        messages: 100,
        batches: 10,
        compressions: 50
      }
    }),
    startMessageLatency: jest.fn(),
    endMessageLatency: jest.fn(),
    trackProcessingTime: jest.fn(),
    trackCompressionRatio: jest.fn(),
    trackBatchSize: jest.fn(),
    getAverageLatency: jest.fn(),
    getAverageProcessingTime: jest.fn(),
    getAverageCompressionRatio: jest.fn(),
    trimMetrics: jest.fn()
  }
}));

// Mock Alert Services
jest.mock('@/services/AlertPrioritization', () => ({
  AlertPrioritization: {
    calculatePriority: jest.fn().mockReturnValue('HIGH'),
    AlertPriority: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL'
    } as const
  }
}));

jest.mock('@/services/AlertGroupingService', () => ({
  AlertGroupingService: {
    shouldGroup: jest.fn().mockReturnValue(false),
    generateGroupId: jest.fn().mockReturnValue('group-1'),
    summarizeGroup: jest.fn().mockReturnValue('Group Summary'),
    canNotify: jest.fn().mockReturnValue(true)
  }
}));

// Mock Performance Monitor
jest.mock('@/utils/Performance', () => ({
  PerformanceMonitor: {
    captureError: jest.fn(),
    addBreadcrumb: jest.fn()
  }
}));

// Mock Network Info
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => {}),
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock Device Info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getDeviceId: jest.fn(() => 'test-device'),
  getSystemVersion: jest.fn(() => '14.0'),
}));
