import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { CollectionStatus } from './Collection';
import { MaterialCategory } from './Material';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Main Tab
export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Collection: undefined;
  Profile: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductList: { category?: string };
  ProductDetail: { productId: string };
  Search: undefined;
};

// Orders Stack
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
};

// Collection Stack
export type CollectionStackParamList = {
  CollectionSchedule: undefined;
  CollectionHistory: undefined;
  CollectionDetail: { collectionId: string };
  CollectionStats: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  PaymentMethods: undefined;
  Addresses: undefined;
  Notifications: undefined;
  Help: undefined;
  About: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  OrderManagement: undefined;
  CollectionManagement: undefined;
  Analytics: undefined;
  Reports: undefined;
  Settings: undefined;
};

// Root Stack
export type RootStackParamList = {
  '(tabs)': undefined;
  'onboarding': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  'auth/forgot-password': undefined;
};

// Navigation Props
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: NativeStackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: BottomTabNavigationProp<MainTabParamList, T>;
  route: RouteProp<MainTabParamList, T>;
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = {
  navigation: NativeStackNavigationProp<HomeStackParamList, T>;
  route: RouteProp<HomeStackParamList, T>;
};

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, T>;
  route: RouteProp<OrdersStackParamList, T>;
};

export type CollectionStackScreenProps<T extends keyof CollectionStackParamList> = {
  navigation: NativeStackNavigationProp<CollectionStackParamList, T>;
  route: RouteProp<CollectionStackParamList, T>;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, T>;
  route: RouteProp<ProfileStackParamList, T>;
};

export type AdminStackScreenProps<T extends keyof AdminStackParamList> = {
  navigation: NativeStackNavigationProp<AdminStackParamList, T>;
  route: RouteProp<AdminStackParamList, T>;
};

// Modal Stack Param List
export type ModalStackParamList = {
  ProductDetails: { productId: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  Settings: undefined;
};

// Navigation Types
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type ModalStackNavigationProp = StackNavigationProp<ModalStackParamList>;

// Route Types
export type RootStackRouteProp = RouteProp<RootStackParamList>;
export type MainTabRouteProp = RouteProp<MainTabParamList>;
export type AuthStackRouteProp = RouteProp<AuthStackParamList>;
export type ModalStackRouteProp = RouteProp<ModalStackParamList>;

// Navigation Hook Types
export type UseNavigationType = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (state: any) => void;
  setOptions: (options: any) => void;
  addListener: (type: string, callback: () => void) => () => void;
};

// Route parameter types for each screen
export interface RouteParams {
  home: undefined;
  profile: { userId: string };
  collection: { collectionId: string };
  materials: { category?: MaterialCategory };
  schedule: { date?: string };
  history: { status?: CollectionStatus };
  settings: undefined;
  notifications: undefined;
}

export type UseRouteType<T extends keyof RouteParams = keyof RouteParams> = {
  params: RouteParams[T];
  key: string;
  name: T;
  path?: string;
};

// Navigation state type
export interface NavigationState {
  index: number;
  routes: Array<{
    key: string;
    name: keyof RouteParams;
    params?: RouteParams[keyof RouteParams];
  }>;
}

// Navigation action types
export type NavigationAction = 
  | { type: 'PUSH'; payload: { name: keyof RouteParams; params?: RouteParams[keyof RouteParams] } }
  | { type: 'POP' }
  | { type: 'POP_TO_TOP' }
  | { type: 'RESET'; payload: NavigationState };

// Screen props type
export interface ScreenProps<T extends keyof RouteParams = keyof RouteParams> {
  route: UseRouteType<T>;
  navigation: {
    navigate: <S extends keyof RouteParams>(name: S, params?: RouteParams[S]) => void;
    goBack: () => void;
    push: <S extends keyof RouteParams>(name: S, params?: RouteParams[S]) => void;
    pop: (count?: number) => void;
    popToTop: () => void;
    reset: (state: NavigationState) => void;
  };
}

// Navigation State Types
export interface NavigationState {
  index: number;
  routes: Array<{
    name: string;
    params?: any;
    state?: NavigationState;
  }>;
}

// Navigation Options Types
export interface NavigationOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerTitleAlign?: 'left' | 'center';
  headerLeft?: (props: any) => React.ReactNode;
  headerRight?: (props: any) => React.ReactNode;
  headerBackTitle?: string;
  headerBackVisible?: boolean;
  headerBackTitleVisible?: boolean;
  headerBackImageSource?: any;
  headerStyle?: any;
  headerTitleStyle?: any;
  headerTintColor?: string;
  headerShadowVisible?: boolean;
  headerTransparent?: boolean;
  headerBackground?: () => React.ReactNode;
  headerBackgroundContainerStyle?: any;
  cardStyle?: any;
  cardStyleInterpolator?: any;
  cardOverlayEnabled?: boolean;
  cardOverlay?: (props: any) => React.ReactNode;
  animationEnabled?: boolean;
  animationTypeForReplace?: 'push' | 'pop';
  gestureEnabled?: boolean;
  gestureDirection?: 'horizontal' | 'vertical';
  gestureResponseDistance?: {
    horizontal?: number;
    vertical?: number;
  };
  gestureVelocityImpact?: number;
  fullScreenGestureEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
  animationDurationForReplace?: number;
  detachInactiveScreens?: boolean;
  freezeOnBlur?: boolean;
  unmountOnBlur?: boolean;
}

// Navigation Event Types
export interface NavigationEvent {
  data: {
    state: NavigationState;
  };
  type: string;
}

// Navigation Listener Types
export interface NavigationListener {
  (event: NavigationEvent): void;
}

// Navigation Focus Types
export interface NavigationFocus {
  isFocused: boolean;
  isStateRestored: boolean;
  canGoBack: boolean;
  dangerouslyGetParent: () => any;
  dangerouslyGetState: () => NavigationState;
}

// Navigation Container Types
export interface NavigationContainerProps {
  children: React.ReactNode;
  onStateChange?: (state: NavigationState | undefined) => void;
  initialState?: NavigationState;
  linking?: any;
  fallback?: React.ReactNode;
  documentTitle?: any;
  independent?: boolean;
}

// Navigation Group Types
export interface NavigationGroupProps {
  children: React.ReactNode;
  screenOptions?: NavigationOptions;
}

// Navigation Screen Types
export interface NavigationScreenProps {
  name: string;
  component: React.ComponentType<any>;
  options?: NavigationOptions;
  initialParams?: any;
  listeners?: {
    [key: string]: NavigationListener;
  };
}

// Navigation Screen Component Types
export interface NavigationScreenComponentProps {
  navigation: UseNavigationType;
  route: UseRouteType;
  options?: NavigationOptions;
}

// Navigation Screen HOC Types
export interface WithNavigationProps {
  navigation: UseNavigationType;
  route: UseRouteType;
}

// Navigation Screen HOC
export function withNavigation<P extends WithNavigationProps>(
  WrappedComponent: React.ComponentType<P>
): React.FC<Omit<P, keyof WithNavigationProps>>;

export type TabStackParamList = {
  'home': undefined;
  'materials': undefined;
  'collection': undefined;
  'profile': undefined;
};

export type MaterialsStackParamList = {
  'index': undefined;
  '[id]': { id: string };
};

export type CollectionStackParamList = {
  'index': undefined;
  'schedule': undefined;
  'history': undefined;
};

export type ProfileStackParamList = {
  'index': undefined;
  'settings': undefined;
  'notifications': undefined;
  'help': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 