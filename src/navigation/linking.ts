/**
 * linking.ts
 * 
 * Configuration for deep linking in the EcoCart app.
 * This enables both universal links (iOS) and deep links (Android).
 */
import { getStateFromPath, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

/**
 * The prefix for deep links
 * - For development: 'ecocart://'
 * - For production: 'https://ecocart.app'
 */
const prefix = Linking.createURL('/');

/**
 * LinkingOptions configuration that maps URL paths to screen navigation states
 */
const linking: LinkingOptions<any> = {
  prefixes: [prefix, 'ecocart://', 'https://ecocart.app'],
  
  config: {
    // Initial screen if no deep link is provided
    initialRouteName: 'MainTabs',
    
    // Deep link configuration by screen path
    screens: {
      // Authentication
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Signup: 'signup',
          ForgotPassword: 'forgot-password',
        },
      },
      
      // Main tabs
      MainTabs: {
        path: 'tabs',
        screens: {
          Home: 'home',
          Recycle: 'recycle',
          SmartHome: 'smart-home',
          Profile: 'profile',
        },
      },
      
      // Smart home screens
      SmartHome: {
        path: 'smart-home',
        screens: {
          SmartHomeOverview: '',
          DeviceDiscovery: 'discover',
          DeviceDetails: {
            path: 'device/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          SmartDeviceControl: {
            path: 'control/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          DeviceSettings: {
            path: 'settings/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          ApplianceSchedule: {
            path: 'schedule/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          EnergyUsage: {
            path: 'energy/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          RecyclingHistory: {
            path: 'recycling-history/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          EnergyHistory: {
            path: 'energy-history/:deviceId',
            parse: {
              deviceId: (deviceId: string) => deviceId,
            },
          },
          AutomationRules: 'automation',
          CreateAutomation: {
            path: 'automation/create/:existingRuleId?',
            parse: {
              existingRuleId: (existingRuleId: string) => existingRuleId,
            },
          },
        },
      },
      
      // Main stack screens
      ProductDetail: {
        path: 'product/:productId',
        parse: {
          productId: (productId: string) => productId,
        },
      },
      Cart: 'cart',
      Checkout: 'checkout',
      Orders: 'orders',
      Payments: 'payments',
      WasteCollection: 'waste-collection',
      
      // AR container scanning
      ARContainerScan: 'scan',
      
      // Materials screens
      MaterialDetail: {
        path: 'material/:materialId',
        parse: {
          materialId: (materialId: string) => materialId,
        },
      },
      
      // Collection screens
      CollectionDetail: {
        path: 'collection/:collectionId',
        parse: {
          collectionId: (collectionId: string) => collectionId,
        },
      },
      
      // OAuth callbacks for platform integrations
      'oauth/google/callback': 'oauth/google/callback',
      'oauth/alexa/callback': 'oauth/alexa/callback',
    },
  },
  
  // Custom function to get the state object from the URL
  getStateFromPath: (path, options) => {
    // Log for debugging
    console.log('Deep link path:', path);
    
    // Use the React Navigation's getStateFromPath function
    return getStateFromPath(path, options);
  },
  
  // Enable prefetching URLs for faster deep link resolution
  enablePrefetch: true,
};

export default linking; 