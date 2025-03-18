import { Platform } from 'react-native';

interface FeatureFlags {
  enableSales: boolean;
  enablePayments: boolean;
  enableProductCatalog: boolean;
  enableARContainerScanner: boolean;
}

// Default feature flags based on environment
const defaultFlags: FeatureFlags = {
  enableSales: false, // Disabled by default as per business model
  enablePayments: false, // Disabled by default as per business model
  enableProductCatalog: false, // Disabled by default as per business model
  enableARContainerScanner: false, // Disabled by default, experimental feature
};

// Development overrides
const devFlags: FeatureFlags = {
  ...defaultFlags,
  // Enable features in development for testing
  enableSales: __DEV__,
  enablePayments: __DEV__,
  enableProductCatalog: __DEV__,
  enableARContainerScanner: __DEV__, // Enable in development for testing
};

// Production overrides
const prodFlags: FeatureFlags = {
  ...defaultFlags,
  // Keep features disabled in production
  enableSales: false,
  enablePayments: false,
  enableProductCatalog: false,
  enableARContainerScanner: false, // Disable in production until fully tested
};

// Platform-specific overrides
const platformFlags: FeatureFlags = {
  ...defaultFlags,
  // Add platform-specific feature flags here
  enableSales: Platform.select({
    ios: false,
    android: false,
    default: false,
  }),
  enablePayments: Platform.select({
    ios: false,
    android: false,
    default: false,
  }),
  enableProductCatalog: Platform.select({
    ios: false,
    android: false,
    default: false,
  }),
  enableARContainerScanner: Platform.select({
    ios: false,
    android: false,
    default: false,
  }),
};

// Combine all flags with proper precedence
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...(Platform.select({
    ios: platformFlags,
    android: platformFlags,
    default: {},
  })),
  ...(process.env.NODE_ENV === 'development' ? devFlags : prodFlags),
};

// Helper functions to check feature status
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

export const requireFeature = (feature: keyof FeatureFlags): void => {
  if (!isFeatureEnabled(feature)) {
    throw new Error(`Feature ${feature} is not enabled`);
  }
};

// Feature-specific components
export const withFeatureGuard = <P extends object>(
  feature: keyof FeatureFlags,
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    if (!isFeatureEnabled(feature)) {
      return null;
    }
    return <Component {...props} />;
  };
}; 