import React from 'react';

// Mock React Native components and modules
const mockComponent = (name: string) => {
  return function MockComponent(props: React.PropsWithChildren<any>) {
    return React.createElement(name, props, props.children);
  };
};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  return {
    ...RN,
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    FlatList: mockComponent('FlatList'),
    Animated: {
      ...RN.Animated,
      View: mockComponent('Animated.View'),
      Text: mockComponent('Animated.Text'),
      createAnimatedComponent: (comp: React.ComponentType<any>) => 
        mockComponent(`Animated.${comp.displayName || comp.name}`),
      timing: jest.fn(),
      spring: jest.fn(),
      sequence: jest.fn(),
      parallel: jest.fn(),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    },
  };
});

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      apiUrl: 'https://test.api.com',
    },
  },
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => {
  const mockComponent = (name: string) => {
    return function MockComponent(props: React.PropsWithChildren<any>) {
      return React.createElement('View', { ...props, testID: name });
    };
  };

  return {
    LineChart: mockComponent('LineChart'),
    BarChart: mockComponent('BarChart'),
    PieChart: mockComponent('PieChart'),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
})); 