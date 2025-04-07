import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export interface RouteParams {
  [key: string]: string | undefined;
}

export type RouteNames = keyof typeof ROUTES.TABS | keyof typeof ROUTES.AUTH | keyof typeof ROUTES.MODALS | keyof typeof ROUTES.ANALYTICS;

// Type-safe navigation hook
export function useTypeSafeNavigation() {
  const router = useRouter();
  const navigation = useNavigation();

  return {
    // Navigate to a route with params
    navigate: (route: string, params?: RouteParams) => {
      router.push(buildRoute(route, params));
    },

    // Replace current route with new route
    replace: (route: string, params?: RouteParams) => {
      router.replace(buildRoute(route, params));
    },

    // Go back
    back: () => {
      router.back();
    },

    // Get current route params
    getParams: () => {
      return useLocalSearchParams() as RouteParams;
    },

    // Check if we're on a specific route
    isRoute: (route: string) => {
      const state = navigation.getState();
      if (!state) return false;
      const currentRoute = state.routes[state.index];
      return currentRoute?.name?.startsWith(route) ?? false;
    },
  };
}

// Type-safe params hook
export function useTypeSafeParams<T extends RouteNames>() {
  return useLocalSearchParams() as RouteParams<T>;
}

// Navigation constants
export const ROUTES = {
  TABS: {
    HOME: '/(tabs)/home',
    MATERIALS: '/(tabs)/materials',
    COLLECTIONS: '/(tabs)/collections',
    COMMUNITY: '/(tabs)/community',
    PROFILE: '/(tabs)/profile',
  },
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
  },
  MODALS: {
    SETTINGS: '/settings',
    NOTIFICATIONS: '/notifications',
  },
  ANALYTICS: {
    BUNDLE_OPTIMIZATION: '/(analytics)/bundle-optimization',
    TREE_SHAKING: '/(analytics)/tree-shaking',
  },
} as const;

// Type-safe route builder
export function buildRoute(route: string, params?: RouteParams): string {
  if (!params) return route;
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `${route}?${queryString}` : route;
} 