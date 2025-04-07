/**
 * Notification.ts
 * 
 * Type definitions for notifications in the EcoCart app.
 */

import { NotificationCategory } from './NotificationPreferences';

/**
 * Base notification data type
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string | number; // ISO string or timestamp
  data?: {
    actionType?: 'openCollection' | 'openMaterial' | 'openAchievement' | string;
    actionId?: string;
    [key: string]: any;
  };
}

/**
 * Collection notification data
 */
export interface CollectionNotification extends Notification {
  category: NotificationCategory.COLLECTION;
  data: {
    collectionId: string;
    status?: string;
    scheduledDate?: string;
    actionType: 'openCollection';
    actionId: string;
    [key: string]: any;
  };
}

/**
 * Delivery notification data
 */
export interface DeliveryNotification extends Notification {
  category: NotificationCategory.DELIVERY;
  data: {
    deliveryId?: string;
    personnelId?: string;
    status?: string;
    estimatedTime?: string;
    actionType?: 'openDelivery';
    actionId?: string;
    [key: string]: any;
  };
}

/**
 * Rewards notification data
 */
export interface RewardsNotification extends Notification {
  category: NotificationCategory.REWARDS;
  data: {
    achievementId?: string;
    points?: number;
    level?: number;
    actionType?: 'openAchievement';
    actionId?: string;
    [key: string]: any;
  };
}

/**
 * System notification data
 */
export interface SystemNotification extends Notification {
  category: NotificationCategory.SYSTEM;
  data?: {
    updateRequired?: boolean;
    maintenanceScheduled?: string;
    version?: string;
    [key: string]: any;
  };
}

/**
 * Community notification data
 */
export interface CommunityNotification extends Notification {
  category: NotificationCategory.COMMUNITY;
  data: {
    challengeId?: string;
    eventId?: string;
    startDate?: string;
    endDate?: string;
    actionType?: 'openChallenge' | 'openEvent';
    actionId?: string;
    [key: string]: any;
  };
}

/**
 * Notification types union
 */
export type NotificationType = 
  | CollectionNotification
  | DeliveryNotification
  | RewardsNotification
  | SystemNotification
  | CommunityNotification; 