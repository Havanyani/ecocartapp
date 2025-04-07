import { NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator Types
export type TabParamList = {
  '(tabs)': undefined;
  '(tabs)/materials': undefined;
  '(tabs)/collections': undefined;
  '(tabs)/community': undefined;
  '(tabs)/profile': undefined;
};

// Auth Navigator Types
export type AuthParamList = {
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(auth)/forgot-password': undefined;
  '(auth)/reset-password': { token: string };
  '(auth)/two-factor-setup': undefined;
};

// Modal Navigator Types
export type ModalParamList = {
  '(modals)/ar-container-scan': undefined;
};

// Analytics Navigator Types
export type AnalyticsParamList = {
  '(analytics)': undefined;
  '(analytics)/bundle-optimization': undefined;
  '(analytics)/tree-shaking': undefined;
  '(analytics)/ai-performance': undefined;
  '(analytics)/ai-benchmark': undefined;
  '(analytics)/ai-config': undefined;
  '(analytics)/environmental-impact': undefined;
};

// Root Navigator Types
export type RootParamList = {
  '(tabs)': NavigatorScreenParams<TabParamList>;
  '(auth)': NavigatorScreenParams<AuthParamList>;
  '(modals)': NavigatorScreenParams<ModalParamList>;
  '(analytics)': NavigatorScreenParams<AnalyticsParamList>;
};

// Route Names Type
export type RouteNames = keyof RootParamList | keyof TabParamList | keyof AuthParamList | keyof ModalParamList | keyof AnalyticsParamList;

// Route Parameters Type
export type RouteParams<T extends RouteNames> = T extends keyof RootParamList
  ? RootParamList[T] extends NavigatorScreenParams<infer P>
    ? P[keyof P]
    : undefined
  : T extends keyof TabParamList
  ? TabParamList[T]
  : T extends keyof AuthParamList
  ? AuthParamList[T]
  : T extends keyof ModalParamList
  ? ModalParamList[T]
  : T extends keyof AnalyticsParamList
  ? AnalyticsParamList[T]
  : undefined;

// Valid routes constant
export const validRoutes = [
  '(tabs)',
  '(tabs)/materials',
  '(tabs)/collections',
  '(tabs)/community',
  '(tabs)/profile',
  '(auth)',
  '(auth)/login',
  '(auth)/signup',
  '(auth)/forgot-password',
  '(auth)/reset-password',
  '(auth)/two-factor-setup',
  '(modals)',
  '(modals)/ar-container-scan',
  '(analytics)',
  '(analytics)/bundle-optimization',
  '(analytics)/tree-shaking',
  '(analytics)/ai-performance',
  '(analytics)/ai-benchmark',
  '(analytics)/ai-config',
  '(analytics)/environmental-impact',
] as const;

// Type guard for valid routes
export function isValidRoute(route: string): route is RouteNames {
  return validRoutes.includes(route as typeof validRoutes[number]);
}

// Navigation state type
export type NavigationState = {
  index: number;
  routes: Array<{
    name: RouteNames;
    params?: Record<string, unknown>;
  }>;
};

// Navigation Hook Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootParamList {}
  }
} 