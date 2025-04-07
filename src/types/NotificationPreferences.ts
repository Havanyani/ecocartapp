/**
 * NotificationPreferences.ts
 * 
 * Type definitions for notification preferences in the app.
 */

/**
 * Enum for notification categories
 */
export enum NotificationCategory {
  COLLECTION = 'collection',
  DELIVERY = 'delivery',
  REWARDS = 'rewards',
  COMMUNITY = 'community',
  SYSTEM = 'system'
}

/**
 * Enum for notification channels
 */
export enum NotificationChannel {
  PUSH = 'push',
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms'
}

/**
 * Interface for category-specific preferences
 */
export interface CategoryPreferences {
  enabled: boolean;
  channels: NotificationChannel[];
  importance: 'high' | 'medium' | 'low';
}

/**
 * Interface for quiet hours schedule
 */
export interface QuietHoursSchedule {
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format: "HH:MM"
  quietHoursEnd: string; // Format: "HH:MM"
  activeDays: number[]; // 0-6, where 0 is Sunday
}

/**
 * Interface for notification preferences
 */
export interface NotificationPreferences {
  // Global settings
  allNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  
  // Quiet hours schedule
  schedule: QuietHoursSchedule;
  
  // Category settings
  [NotificationCategory.COLLECTION]: CategoryPreferences;
  [NotificationCategory.DELIVERY]: CategoryPreferences;
  [NotificationCategory.REWARDS]: CategoryPreferences;
  [NotificationCategory.COMMUNITY]: CategoryPreferences;
  [NotificationCategory.SYSTEM]: CategoryPreferences;
  
  // Feature-specific notification settings
  collectionStatusChanges: boolean;
  achievementNotifications: boolean;
  questNotifications: boolean;
  creditUpdates: boolean;
  communityEvents: boolean;
  
  // Additional settings
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  lastUpdated: number; // Unix timestamp
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  allNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  
  schedule: {
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6] // All days
  },
  
  [NotificationCategory.COLLECTION]: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    importance: 'high'
  },
  
  [NotificationCategory.DELIVERY]: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    importance: 'high'
  },
  
  [NotificationCategory.REWARDS]: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    importance: 'medium'
  },
  
  [NotificationCategory.COMMUNITY]: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    importance: 'medium'
  },
  
  [NotificationCategory.SYSTEM]: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    importance: 'high'
  },
  
  collectionStatusChanges: true,
  achievementNotifications: true,
  questNotifications: true,
  creditUpdates: true,
  communityEvents: true,
  
  vibrationEnabled: true,
  soundEnabled: true,
  lastUpdated: Date.now()
}; 