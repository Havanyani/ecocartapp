import Constants from 'expo-constants';
import { Dimensions, Platform } from 'react-native';

// Platform detection utilities
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = isIOS || isAndroid;

// Device type detection
export const isPhone = () => {
  const { width, height } = Dimensions.get('window');
  return (
    (isIOS || isAndroid) && 
    (width < 600 || (isAndroid && height / width > 1.6))
  );
};

export const isTablet = () => {
  return (isIOS || isAndroid) && !isPhone();
};

// Environment detection
export const isDevelopment = () => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

export const isProduction = () => {
  return !__DEV__ && process.env.NODE_ENV === 'production';
};

// Get platform-specific value
export function getPlatformValue<T>(config: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T {
  if (isIOS && config.ios !== undefined) return config.ios;
  if (isAndroid && config.android !== undefined) return config.android;
  if (isWeb && config.web !== undefined) return config.web;
  return config.default;
}

// Get runtime platform info
export function getPlatformInfo() {
  return {
    os: Platform.OS,
    version: Platform.Version,
    isExpo: Constants.expoVersion !== null,
    expoVersion: Constants.expoVersion,
    appName: Constants.expoConfig?.name || 'EcoCart',
    appVersion: Constants.expoConfig?.version || '1.0.0',
    isWeb,
    isIOS,
    isAndroid,
    isNative,
    isDev: isDevelopment(),
    isProd: isProduction(),
    isPhone: isPhone(),
    isTablet: isTablet(),
  };
} 