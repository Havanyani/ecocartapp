import { Material } from '@/types/models';

// Root Stack
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  '(modals)': undefined;
  '(smart-home)': undefined;
  '(analytics)': undefined;
  '(messaging)': undefined;
  '(settings)': undefined;
  '(collections)': undefined;
  '(materials)': undefined;
  '(community)': undefined;
};

// Auth Stack
export type AuthStackParamList = {
  'login': undefined;
  'signup': undefined;
  'forgot-password': undefined;
  'reset-password': { token: string };
};

// Tabs Stack
export type TabsParamList = {
  'index': undefined;
  'materials': undefined;
  'collections': undefined;
  'community': undefined;
  'performance': undefined;
  'profile': undefined;
};

// Modals Stack
export type ModalsParamList = {
  'ar-container-scan': {
    materialId?: string;
    barcode?: string;
    onVolumeEstimated?: (volume: number) => void;
  };
  'barcode-scanner': {
    onMaterialSelect?: (materialId: string) => void;
  };
};

// Smart Home Stack
export type SmartHomeStackParamList = {
  'index': undefined;
  'device-discovery': undefined;
  'device-details': { deviceId: string };
  'device-control': { deviceId: string };
  'device-settings': { deviceId: string };
  'appliance-schedule': {
    deviceId: string;
    deviceName: string;
    currentSchedule: string | null;
  };
  'energy-usage': { deviceId: string };
  'energy-saving-tips': { applianceType: string | null };
  'recycling-history': { deviceId: string };
  'energy-history': { deviceId: string };
  'automation-rules': undefined;
  'create-automation': { existingRuleId?: string };
};

// Analytics Stack
export type AnalyticsStackParamList = {
  'index': undefined;
  'environmental-impact': undefined;
  'ai-config': undefined;
  'ai-performance': undefined;
  'ai-benchmark': undefined;
  'bundle-optimization': undefined;
  'tree-shaking': undefined;
};

// Messaging Stack
export type MessagingStackParamList = {
  'conversations': undefined;
  'chat': { conversationId: string; title: string };
  'new-message': undefined;
  'conversation-info': { conversationId: string };
};

// Settings Stack
export type SettingsStackParamList = {
  'index': undefined;
  'notification-preferences': undefined;
  'sync-settings': undefined;
  'achievements': undefined;
};

// Collections Stack
export type CollectionsStackParamList = {
  'index': undefined;
  'collection-detail': { collectionId: string };
  'collection-history': undefined;
  'schedule-collection': undefined;
};

// Materials Stack
export type MaterialsStackParamList = {
  'index': undefined;
  'material-detail': { materialId: string; material?: Material };
};

// Community Stack
export type CommunityStackParamList = {
  'index': undefined;
  'challenges': undefined;
  'challenge-details': { challengeId: string };
};

// Navigation Types
export type NavigationType = {
  navigate: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void;
  goBack: () => void;
  push: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  reset: (state: any) => void;
};

// Screen Props Type
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: NavigationType;
  route: {
    params: RootStackParamList[T];
  };
}

// Navigation Options Type
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