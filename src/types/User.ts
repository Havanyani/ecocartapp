/**
 * user.ts
 * 
 * Type definitions for user profiles in the EcoCart application.
 * Extends the base AuthUser with EcoCart-specific information.
 */

import { AuthUser } from './auth';
import { CollectionItem } from './collections';
import { CreditsSummary } from './credits';

/**
 * User profile that extends the base AuthUser with EcoCart-specific information
 */
export interface UserProfile extends AuthUser {
  // Contact information
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // EcoCart specific
  credits: CreditsSummary;
  collectionHistory: CollectionItem[];
  preferredCollectionDay?: string;
  preferredCollectionTime?: string;
  notificationPreferences: {
    collectionReminders: boolean;
    creditUpdates: boolean;
    promotions: boolean;
    environmentalTips: boolean;
  };
  
  // Account settings
  isDeliveryPersonnel: boolean;
  deliveryPersonnelId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile update data
 */
export interface UserProfileUpdateData {
  name?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  preferredCollectionDay?: string;
  preferredCollectionTime?: string;
  notificationPreferences?: {
    collectionReminders?: boolean;
    creditUpdates?: boolean;
    promotions?: boolean;
    environmentalTips?: boolean;
  };
}

/**
 * User profile creation data
 */
export interface UserProfileCreationData {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'delivery';
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    language: string;
  };
  addresses: Array<{
    id: string;
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    collectionReminders: boolean;
    promotions: boolean;
    news: boolean;
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    showStats: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData extends UserCredentials {
  name: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<User['preferences']>;
  addresses?: User['addresses'];
} 