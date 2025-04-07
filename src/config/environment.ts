import { getPlatformInfo, isDevelopment } from '../utils/platformUtils';

// Base API URLs for different environments
const API_URLS = {
  development: {
    web: 'http://localhost:3000/api',
    native: 'http://localhost:3000/api',
  },
  staging: {
    web: 'https://staging-api.ecocart.example/api',
    native: 'https://staging-api.ecocart.example/api',
  },
  production: {
    web: 'https://api.ecocart.example/api',
    native: 'https://api.ecocart.example/api',
  },
};

// Determine which environment we're in
const ENV = process.env.EXPO_PUBLIC_ENV || (isDevelopment() ? 'development' : 'production');

// Platform-specific config
const platformInfo = getPlatformInfo();
const isNative = platformInfo.isNative;

// Create the config
const config = {
  ENV,
  API_URL: API_URLS[ENV as keyof typeof API_URLS][isNative ? 'native' : 'web'],
  isProduction: ENV === 'production',
  isStaging: ENV === 'staging',
  isDevelopment: ENV === 'development',
  platform: platformInfo,
  webSpecificFeatures: platformInfo.isWeb,
  nativeOnlyFeatures: platformInfo.isNative,
};

export default config; 