import { useNavigation } from '@react-navigation/native';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import NotificationService from '@/services/NotificationService';
import { CollectionStatus } from '@/types/Collection';

// Context types
interface NotificationContextType {
  scheduleCollectionReminder: (
    collectionId: string,
    materialType: string, 
    scheduledDateTime: Date, 
    address: string
  ) => Promise<string>;
  sendCollectionStatusUpdate: (
    collectionId: string,
    materialType: string,
    status: CollectionStatus
  ) => Promise<string>;
  sendAchievementNotification: (
    achievementId: string,
    title: string,
    description: string
  ) => Promise<string>;
  sendSyncCompleteNotification: (
    itemCount: number
  ) => Promise<string>;
  sendCommunityUpdateNotification: (
    challengeId: string,
    title: string,
    message: string,
    progress: number,
    target: number
  ) => Promise<string>;
  sendChallengeCompleteNotification: (
    challengeId: string,
    title: string,
    reward: string
  ) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes the notification service and provides 
 * notification-related functions to its children
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationService] = useState(() => NotificationService.getInstance());
  const navigation = useNavigation();

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('Notification service initialized');

        // Set up navigation for notification responses
        // This will be expanded in a real implementation
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    initializeNotifications();

    // Cleanup notification listeners when unmounting
    return () => {
      notificationService.cleanup();
    };
  }, [notificationService]);

  // Context value with notification functions
  const contextValue: NotificationContextType = {
    scheduleCollectionReminder: async (collectionId, materialType, scheduledDateTime, address) => {
      return notificationService.scheduleCollectionReminder(
        collectionId,
        materialType,
        scheduledDateTime,
        address
      );
    },
    sendCollectionStatusUpdate: async (collectionId, materialType, status) => {
      return notificationService.sendCollectionStatusUpdate(
        collectionId,
        materialType,
        status
      );
    },
    sendAchievementNotification: async (achievementId, title, description) => {
      return notificationService.sendAchievementNotification(
        achievementId,
        title,
        description
      );
    },
    sendSyncCompleteNotification: async (itemCount) => {
      return notificationService.sendSyncCompleteNotification(itemCount);
    },
    sendCommunityUpdateNotification: async (challengeId, title, message, progress, target) => {
      return notificationService.sendCommunityUpdateNotification(
        challengeId,
        title,
        message,
        progress,
        target
      );
    },
    sendChallengeCompleteNotification: async (challengeId, title, reward) => {
      return notificationService.sendChallengeCompleteNotification(
        challengeId,
        title,
        reward
      );
    },
    cancelNotification: async (notificationId) => {
      return notificationService.cancelNotification(notificationId);
    },
    cancelAllNotifications: async () => {
      return notificationService.cancelAllNotifications();
    },
    setBadgeCount: async (count) => {
      return notificationService.setBadgeCount(count);
    },
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 