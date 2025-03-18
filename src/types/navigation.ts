/**
 * Navigation type definitions
 * @module types/navigation
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './index';

/**
 * Navigation state interface
 */
export interface NavigationState {
  index: number;
  routes: Array<{
    key: string;
    name: string;
    params?: Record<string, unknown>;
  }>;
}

/**
 * Navigation action interface
 */
export interface NavigationAction {
  type: string;
  payload?: Record<string, unknown>;
  source?: string;
  target?: string;
}

/**
 * Screen navigation prop type
 */
export type ScreenNavigationProp<T extends keyof RootStackParamList> = 
  NavigationProp<RootStackParamList, T>;

/**
 * Screen route prop type
 */
export type ScreenRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

/**
 * Screen props interface
 */
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: ScreenNavigationProp<T>;
  route: ScreenRouteProp<T>;
}

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'onboarding': undefined;
  'settings': undefined;
};

export type AuthStackParamList = {
  'index': undefined;
  'signin': undefined;
  'signup': undefined;
  'forgot-password': undefined;
};

export type TabParamList = {
  'index': undefined;
  'collections': undefined;
  'materials': undefined;
  'community': undefined;
  'rewards': undefined;
  'profile': undefined;
};

export type MaterialsStackParamList = {
  'index': undefined;
  '[id]': { id: string };
  'categories': undefined;
  'search': undefined;
};

export type CollectionStackParamList = {
  'index': undefined;
  'schedule': undefined;
  'history': undefined;
  '[id]': { id: string };
  'new': undefined;
};

export type CommunityStackParamList = {
  'index': undefined;
  'events': undefined;
  'challenges': undefined;
  'leaderboard': undefined;
  'groups': undefined;
  'group/[id]': { id: string };
  'challenge/[id]': { id: string };
  'event/[id]': { id: string };
};

export type RewardsStackParamList = {
  'index': undefined;
  'shop': undefined;
  'history': undefined;
  'redeem': undefined;
  'points': undefined;
  'reward/[id]': { id: string };
};

export type ProfileStackParamList = {
  'index': undefined;
  'edit': undefined;
  'settings': undefined;
  'notifications': undefined;
  'appearance': undefined;
  'language': undefined;
  'performance': {
    tab?: 'monitor' | 'settings';
  };
};

export type SettingsStackParamList = {
  'index': undefined;
  'translations': undefined;
  'notifications': undefined;
  'schedule': undefined;
  'reminders': undefined;
  'profile': undefined;
  'environmental': undefined;
  'credits': undefined;
};

export type AppRoutes = {
  // Root routes
  '/': undefined;
  '/_layout': undefined;
  '/onboarding': undefined;

  // Auth routes
  '/(auth)': undefined;
  '/(auth)/_layout': undefined;
  '/(auth)/signin': undefined;
  '/(auth)/signup': undefined;
  '/(auth)/forgot-password': undefined;

  // Tab routes
  '/(tabs)': undefined;
  '/(tabs)/_layout': undefined;
  '/(tabs)/index': undefined;
  '/(tabs)/collections': undefined;
  '/(tabs)/materials': undefined;
  '/(tabs)/community': undefined;
  '/(tabs)/rewards': undefined;
  '/(tabs)/profile': undefined;

  // Collection routes
  '/collections/[id]': { id: string };
  '/collections/schedule': undefined;
  '/collections/history': undefined;
  '/collections/new': undefined;

  // Material routes
  '/materials/[id]': { id: string };
  '/materials/categories': undefined;
  '/materials/search': undefined;

  // Community routes
  '/community/events': undefined;
  '/community/challenges': undefined;
  '/community/leaderboard': undefined;
  '/community/groups': undefined;
  '/community/group/[id]': { id: string };
  '/community/challenge/[id]': { id: string };
  '/community/event/[id]': { id: string };

  // Rewards routes
  '/rewards/shop': undefined;
  '/rewards/history': undefined;
  '/rewards/redeem': undefined;
  '/rewards/points': undefined;
  '/rewards/reward/[id]': { id: string };

  // Profile routes
  '/profile/notifications': undefined;
  '/profile/appearance': undefined;
  '/profile/language': undefined;
  '/profile/performance': {
    tab?: 'monitor' | 'settings';
  };

  // Settings routes
  '/settings': undefined;
  '/settings/_layout': undefined;
  '/settings/translations': undefined;
  '/settings/notifications': undefined;
  '/settings/schedule': undefined;
  '/settings/reminders': undefined;
  '/settings/profile': undefined;
  '/settings/environmental': undefined;
  '/settings/credits': undefined;
};

export type AppRoutePath = keyof AppRoutes;

export type AppRouteParams<T extends AppRoutePath> = AppRoutes[T];

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 