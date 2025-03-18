/**
 * NotificationPreferences Types
 * 
 * Type definitions for notification preferences
 */

/**
 * The supported notification categories
 */
export enum NotificationCategory {
  COLLECTION = 'collection',
  DELIVERY = 'delivery',
  SYSTEM = 'system',
  REWARDS = 'rewards',
  COMMUNITY = 'community'
}

/**
 * The priority levels for notifications
 */
export enum NotificationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * The channels through which notifications can be delivered
 */
export enum NotificationChannel {
  PUSH = 'push',
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms'
}

/**
 * Category-specific notification preferences
 */
export interface CategoryPreferences {
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
}

/**
 * Notification schedule preferences
 */
export interface SchedulePreferences {
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format: "HH:MM" in 24-hour format
  quietHoursEnd: string; // Format: "HH:MM" in 24-hour format
  daysEnabled: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

/**
 * Complete notification preferences object
 */
export interface NotificationPreferences {
  // Global settings
  allNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  
  // Per-category settings
  collection: CategoryPreferences;
  delivery: CategoryPreferences;
  system: CategoryPreferences;
  rewards: CategoryPreferences;
  community: CategoryPreferences;
  
  // Schedule settings
  schedule: SchedulePreferences;
  
  // Feature-specific toggles
  collectionStatusChanges: boolean;
  personnelLocationUpdates: boolean;
  deliveryStatusUpdates: boolean;
  locationUpdates: boolean;
  routeChanges: boolean;
  collectionUpdates: boolean;
  achievementNotifications: boolean;
  questNotifications: boolean;
  creditUpdates: boolean;
  communityEvents: boolean;
} 