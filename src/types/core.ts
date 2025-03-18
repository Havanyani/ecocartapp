/**
 * Core type definitions
 * @module types/core
 */

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

/**
 * Hook result interface
 */
export interface HookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook error interface
 */
export interface HookError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Hook state interface
 */
export interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: HookError | null;
}

/**
 * Store action interface
 */
export interface StoreAction<T = unknown> {
  type: string;
  payload?: T;
  meta?: Record<string, unknown>;
  error?: boolean;
} 