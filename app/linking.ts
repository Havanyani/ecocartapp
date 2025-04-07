import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';

// Define the route parameters interface
interface RouteParams {
  token?: string;
  id?: string;
  type?: string;
  category?: string;
  search?: string;
  filter?: string;
  sort?: string;
  page?: string;
  limit?: string;
  redirect?: string;
  referralCode?: string;
}

// Define error types
enum DeepLinkError {
  INVALID_ROUTE = 'INVALID_ROUTE',
  INVALID_PARAMS = 'INVALID_PARAMS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
}

// Define the route configuration type
type RouteConfig = {
  screens: {
    [key: string]: {
      path: string;
      parse?: (params: RouteParams) => any;
      validate?: (params: RouteParams) => boolean;
      errorHandler?: (error: DeepLinkError, params: RouteParams) => string;
    };
  };
};

// Validation functions
const validateParams = {
  token: (token: string) => /^[A-Za-z0-9-_]+$/.test(token),
  id: (id: string) => /^[A-Za-z0-9-_]+$/.test(id),
  type: (type: string, validTypes: string[]) => validTypes.includes(type),
  category: (category: string) => /^[A-Za-z0-9-_]+$/.test(category),
  page: (page: string) => !isNaN(Number(page)) && Number(page) > 0,
  limit: (limit: string) => !isNaN(Number(limit)) && Number(limit) > 0 && Number(limit) <= 100,
};

// Error handling functions
const handleError = {
  [DeepLinkError.INVALID_ROUTE]: (params: RouteParams) => 
    `Invalid route: ${params.type || 'unknown'}. Please check the URL and try again.`,
  [DeepLinkError.INVALID_PARAMS]: (params: RouteParams) => 
    `Invalid parameters for route: ${params.type || 'unknown'}. Please check the parameters and try again.`,
  [DeepLinkError.UNAUTHORIZED]: (params: RouteParams) => 
    'You need to be logged in to access this feature.',
  [DeepLinkError.NOT_FOUND]: (params: RouteParams) => 
    `Resource not found: ${params.id || 'unknown'}.`,
};

// Helper function to handle errors
function handleDeepLinkError(error: unknown, params: RouteParams): { error: string } {
  if (error instanceof Error) {
    console.error('Deep link error:', error);
    return { error: error.message };
  }
  console.error('Unknown deep link error:', error);
  return { error: handleError[DeepLinkError.INVALID_PARAMS](params) };
}

export const linking: LinkingOptions<any> = {
  prefixes: [
    'ecocart://',
    'https://ecocart.app',
  ],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          home: {
            path: 'home',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['all', 'recent', 'favorites'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  initialTab: params.type || 'all',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          materials: {
            path: 'materials',
            parse: (params: RouteParams) => {
              try {
                if (params.category && !validateParams.category(params.category)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                if (params.page && !validateParams.page(params.page)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                if (params.limit && !validateParams.limit(params.limit)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  category: params.category,
                  search: params.search,
                  filter: params.filter,
                  sort: params.sort,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          collections: {
            path: 'collections',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['active', 'completed', 'scheduled'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  type: params.type,
                  status: params.filter,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          community: {
            path: 'community',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['feed', 'challenges', 'rewards'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  tab: params.type || 'feed',
                  filter: params.filter,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          profile: {
            path: 'profile',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['overview', 'achievements', 'settings'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  tab: params.type || 'overview',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
        },
      },
      '(auth)': {
        screens: {
          login: {
            path: 'login',
            parse: (params: RouteParams) => {
              try {
                if (params.redirect && !validateParams.type(params.redirect, ['profile', 'settings', 'home'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  redirect: params.type,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          signup: {
            path: 'signup',
            parse: (params: RouteParams) => {
              try {
                if (params.referralCode && !validateParams.token(params.referralCode)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  referralCode: params.type,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'forgot-password': 'forgot-password',
          'reset-password': {
            path: 'reset-password',
            parse: (params: RouteParams) => {
              try {
                if (!params.token || !validateParams.token(params.token)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  token: params.token,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'two-factor-setup': 'two-factor-setup',
        },
      },
      '(modals)': {
        screens: {
          'ar-container-scan': {
            path: 'scan',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['container', 'material', 'barcode'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                if (params.category && !validateParams.category(params.category)) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  mode: params.type || 'container',
                  materialType: params.category,
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
        },
      },
      '(analytics)': {
        screens: {
          'bundle-optimization': {
            path: 'analytics/bundle',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['day', 'week', 'month', 'year'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  timeframe: params.type || 'week',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'tree-shaking': {
            path: 'analytics/tree-shaking',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['overview', 'detailed', 'comparison'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  view: params.type || 'overview',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'ai-performance': {
            path: 'analytics/ai-performance',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['accuracy', 'speed', 'efficiency'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  metric: params.type || 'accuracy',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'ai-benchmark': {
            path: 'analytics/ai-benchmark',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['all', 'latest', 'best'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  model: params.type || 'all',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'ai-config': {
            path: 'analytics/ai-config',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['general', 'advanced', 'experimental'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  section: params.type || 'general',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
          'environmental-impact': {
            path: 'analytics/environmental-impact',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['day', 'week', 'month', 'year'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  period: params.type || 'month',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
        },
      },
      '(smart-home)': {
        screens: {
          index: {
            path: 'smart-home',
            parse: (params: RouteParams) => {
              try {
                if (params.type && !validateParams.type(params.type, ['dashboard', 'devices', 'scenes', 'automation'])) {
                  throw new Error(handleError[DeepLinkError.INVALID_PARAMS](params));
                }
                return {
                  ...params,
                  view: params.type || 'dashboard',
                };
              } catch (error) {
                return handleDeepLinkError(error, params);
              }
            },
          },
        },
      },
    },
  },
  // Custom getInitialURL function to handle deep links
  getInitialURL: async () => {
    try {
      // Handle initial deep link
      const url = await Linking.getInitialURL();
      if (url != null) {
        return url;
      }
      return null;
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  },
  // Custom subscribe function to handle deep links while app is running
  subscribe: (listener) => {
    const onReceiveURL = ({ url }: { url: string }) => {
      try {
        listener(url);
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Listen to incoming links from deep linking
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      // Clean up the event listeners
      subscription.remove();
    };
  },
}; 