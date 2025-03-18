import { TextStyle, ViewStyle } from 'react-native';

// Common Types
export interface BaseProps {
  testID?: string;
  style?: ViewStyle;
}

export interface TextProps extends BaseProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  textStyle?: TextStyle;
}

// Component Types
export interface ThemedViewProps extends BaseProps {
  children: React.ReactNode;
}

export interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

export interface HapticTabProps extends BaseProps {
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  tabs?: Array<{
    key: string;
    label: string;
  }>;
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

// Hook Types
export interface UseAuthResult {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export interface UseUserSettingsResult<T> {
  settings: T | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (settings: T) => Promise<void>;
}

export interface UseAdminDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAnalyticsDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseReportsResult<T> {
  reports: T[] | null;
  isLoading: boolean;
  error: string | null;
  generateReport: (filters: ReportFilters) => Promise<void>;
}

// Model Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
}

// Chart Types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface ChartProps {
  data: ChartDataPoint[];
  timeRange: 'day' | 'week' | 'month' | 'year';
  metricType?: 'users' | 'collections' | 'deliveries';
}

// Service Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PlasticCollection {
  id: string;
  userId: string;
  weight: number;
  timestamp: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  creditAmount: number;
}

export interface DeliveryRoute {
  id: string;
  deliveryPersonId: string;
  stops: RouteStop[];
  optimizedPath: GeoPoint[];
  estimatedDuration: number;
}

export interface RouteStop {
  id: string;
  location: GeoPoint;
  type: 'delivery' | 'collection' | 'both';
  scheduledTime: Date;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface SustainabilityMetrics {
  totalPlasticCollected: number;
  totalCreditsIssued: number;
  carbonFootprintReduced: number;
}

// Core domain types
export * from './Collection';
export * from './Material';
export * from './User';

// Feature-specific types
export {
    type AggregatedAnalytics, type AnalyticsFilter, type AnalyticsSummary, type ChartData, type CollectionData, type CommunityComparison, type Dataset, type ExportConfig, type ExportFormat, type MaterialData, type MetricType, type RecyclingGoal, type TimeFrame
} from './analytics';

export {
    type Achievement, type AchievementProgress, type AchievementType, type Reward, type RewardStatus, type RewardType
} from './gamification';

export {
    type AppRouteParams, type NavigationAction, type NavigationState
} from './navigation';

export {
    type PerformanceData, type PerformanceMetrics, type TimeSeriesMetrics
} from './Performance';

export {
    type DeliveryRoute, type DeliveryStatus, type DeliveryStop
} from './delivery';

export {
    type FeedbackRating, type FeedbackResponse, type FeedbackType
} from './feedback.d';

export {
    type Theme,
    type ThemeColors,
    type Typography
} from './theme';

export {
    type ComponentProps, type LayoutProps, type StyleProps
} from './components.d';

export {
    type HookError, type HookResult, type HookState
} from './hooks.d';

export {
    type StoreAction,
    type StoreDispatch, type StoreState
} from './store.d';

export {
    type Metric,
    type MetricType as MetricCategory,
    type MetricValue
} from './metrics';

export {
    type Product,
    type ProductCategory,
    type ProductVariant
} from './product';

export {
    type Credit, type CreditTransaction, type CreditType
} from './credits';

export {
    type Notification, type NotificationPreference, type NotificationType
} from './notifications';

// Type utilities
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type WithId = {
  id: string;
};

export type WithOptionalId = {
  id?: string;
};

// Common response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Common query types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export type LoadingState<T> = {
  data: T | null;
  status: Status;
  error: Error | null;
};

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

/**
 * Material item interface
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  recyclable: boolean;
  points: number;
  description: string;
  imageUrl?: string;
}

/**
 * Material category type
 */
export type MaterialCategory = 
  | 'PLASTIC'
  | 'PAPER'
  | 'GLASS'
  | 'METAL'
  | 'ELECTRONICS'
  | 'ORGANIC'
  | 'OTHER';

/**
 * Collection schedule interface
 */
export interface CollectionSchedule {
  id: string;
  userId: string;
  materials: Material[];
  scheduledDate: string;
  status: CollectionStatus;
  address: Address;
}

/**
 * Collection status type
 */
export type CollectionStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Address interface
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Analytics data interface
 */
export interface AnalyticsData {
  totalPoints: number;
  materialsRecycled: number;
  collectionsCompleted: number;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
}

/**
 * Navigation params type for type-safe navigation
 */
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  MaterialList: undefined;
  MaterialDetail: { materialId: string };
  CollectionList: undefined;
  CollectionDetail: { collectionId: string };
  ScheduleCollection: undefined;
  Settings: undefined;
  Analytics: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

/**
 * Central type definitions for the EcoCart application
 * @module types
 */

// Re-export all domain-specific types
export * from './components';
export * from './delivery';
export * from './feedback';
export * from './gamification';
export * from './navigation';
export * from './performance';
export * from './theme';

// Export core types
export * from './core';

/**
 * Base response interface for all API responses
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

/**
 * Error response interface for API errors
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

/**
 * Material item interface
 */
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  recyclable: boolean;
  points: number;
  description: string;
  imageUrl?: string;
}

/**
 * Material category type
 */
export type MaterialCategory = 
  | 'PLASTIC'
  | 'PAPER'
  | 'GLASS'
  | 'METAL'
  | 'ELECTRONICS'
  | 'ORGANIC'
  | 'OTHER';

/**
 * Collection schedule interface
 */
export interface CollectionSchedule {
  id: string;
  userId: string;
  materials: Material[];
  scheduledDate: string;
  status: CollectionStatus;
  address: Address;
}

/**
 * Collection status type
 */
export type CollectionStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Address interface
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Analytics data interface
 */
export interface AnalyticsData {
  totalPoints: number;
  materialsRecycled: number;
  collectionsCompleted: number;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
} 