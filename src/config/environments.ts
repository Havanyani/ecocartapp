/**
 * Environment configuration for the EcoCart app
 */
import Constants from 'expo-constants';

/**
 * Configuration for each environment
 */
type Environment = {
  /**
   * Base URL for the API
   */
  apiUrl: string;
  
  /**
   * Sentry DSN for error reporting
   */
  sentryDsn: string;
  
  /**
   * Whether to enable debug features
   */
  enableDebug: boolean;
  
  /**
   * Environment name (development, staging, production)
   */
  name: string;
  
  /**
   * Feature flags for this environment
   */
  features: {
    /**
     * Enable analytics tracking
     */
    analytics: boolean;
    
    /**
     * Enable push notifications
     */
    pushNotifications: boolean;
    
    /**
     * Enable in-app purchases
     */
    inAppPurchases: boolean;
  };
};

/**
 * Configuration for the development environment
 */
const development: Environment = {
  apiUrl: 'https://dev-api.ecocart.example.com',
  sentryDsn: 'https://dev-sentry-key@sentry.io/123456',
  enableDebug: true,
  name: 'development',
  features: {
    analytics: false,
    pushNotifications: true,
    inAppPurchases: false,
  },
};

/**
 * Configuration for the staging environment
 */
const staging: Environment = {
  apiUrl: 'https://staging-api.ecocart.example.com',
  sentryDsn: 'https://staging-sentry-key@sentry.io/123456',
  enableDebug: true,
  name: 'staging',
  features: {
    analytics: true,
    pushNotifications: true,
    inAppPurchases: true,
  },
};

/**
 * Configuration for the production environment
 */
const production: Environment = {
  apiUrl: 'https://api.ecocart.example.com',
  sentryDsn: 'https://prod-sentry-key@sentry.io/123456',
  enableDebug: false,
  name: 'production',
  features: {
    analytics: true,
    pushNotifications: true,
    inAppPurchases: true,
  },
};

/**
 * Get the current environment configuration
 */
export function getEnvironment(): Environment {
  // Get the environment from the manifest
  let appEnv = 'development';
  
  try {
    // Try to get the environment from the expo config
    if (Constants.expoConfig?.extra?.APP_ENV) {
      appEnv = Constants.expoConfig.extra.APP_ENV;
    }
  } catch (error) {
    console.warn('Failed to get environment from expo config', error);
  }

  // Use API URL from environment if available
  let apiUrl = 'https://dev-api.ecocart.example.com';
  try {
    if (Constants.expoConfig?.extra?.API_URL) {
      apiUrl = Constants.expoConfig.extra.API_URL;
    }
  } catch (error) {
    console.warn('Failed to get API URL from expo config', error);
  }

  // Return the corresponding environment configuration
  switch (appEnv) {
    case 'production':
      return {
        ...production,
        apiUrl: apiUrl || production.apiUrl
      };
    case 'staging':
      return {
        ...staging,
        apiUrl: apiUrl || staging.apiUrl
      };
    case 'development':
    default:
      return {
        ...development,
        apiUrl: apiUrl || development.apiUrl
      };
  }
}

/**
 * Current environment configuration
 */
export const environment = getEnvironment();

/**
 * Is this a production environment?
 */
export const isProduction = environment.name === 'production';

/**
 * Is this a development environment?
 */
export const isDevelopment = environment.name === 'development';

/**
 * Is this a staging environment?
 */
export const isStaging = environment.name === 'staging'; 