import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

type NotificationContent = Omit<Notifications.NotificationContentInput, 'vibrate'> & {
  vibrate?: number[];
};

interface NotificationTrigger {
  date?: Date;
  seconds?: number;
  repeats?: boolean;
  channelId?: string;
}

interface DeliveryUpdate {
  status: 'preparing' | 'in_transit' | 'delivered' | 'delayed';
  estimatedTime?: string;
}

export class NotificationManagementService {
  private static readonly DEFAULT_CHANNEL_ID = 'default';
  private static readonly REMINDER_CHANNEL_ID = 'reminders';
  private static readonly DELIVERY_CHANNEL_ID = 'delivery';
  private static readonly CREDITS_CHANNEL_ID = 'credits';

  static async initialize(): Promise<Notifications.ExpoPushToken> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      const token = await Notifications.getExpoPushTokenAsync();
      PerformanceMonitor.addBreadcrumb(
        'notifications',
        'Notification permissions granted and initialized'
      );

      return token;
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw new Error('Failed to initialize notifications: ' + (error as Error).message);
    }
  }

  private static async setupAndroidChannels(): Promise<void> {
    try {
      await Promise.all([
        Notifications.setNotificationChannelAsync(this.DEFAULT_CHANNEL_ID, {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2E7D32'
        }),
        Notifications.setNotificationChannelAsync(this.REMINDER_CHANNEL_ID, {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1976D2'
        }),
        Notifications.setNotificationChannelAsync(this.DELIVERY_CHANNEL_ID, {
          name: 'Delivery Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFA000'
        }),
        Notifications.setNotificationChannelAsync(this.CREDITS_CHANNEL_ID, {
          name: 'Credits',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#388E3C'
        })
      ]);
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw new Error('Failed to setup Android notification channels');
    }
  }

  private static async scheduleNotification(
    content: NotificationContent,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          sound: content.sound ?? true,
          priority: content.priority ?? Notifications.AndroidNotificationPriority.HIGH
        },
        trigger: trigger ?? null
      });

      PerformanceMonitor.addBreadcrumb(
        'notifications',
        `Scheduled notification: ${content.title}`
      );

      return notificationId;
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw new Error('Failed to schedule notification');
    }
  }

  static async scheduleCollectionReminder(date: Date): Promise<string> {
    const reminderDate = new Date(date);
    reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before

    return this.scheduleNotification(
      {
        title: 'Collection Reminder',
        body: 'Don\'t forget to prepare your recyclables for tomorrow\'s collection!',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sound: true,
        data: { type: 'collection_reminder', collectionDate: date.toISOString() }
      },
      {
        date: reminderDate,
        channelId: this.REMINDER_CHANNEL_ID
      }
    );
  }

  static async scheduleDeliveryUpdate(update: DeliveryUpdate): Promise<string> {
    return this.scheduleNotification(
      {
        title: 'Delivery Update',
        body: `Your delivery is ${update.status}. ${
          update.estimatedTime ? `Estimated arrival: ${update.estimatedTime}` : ''
        }`,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        data: { type: 'delivery_update', ...update }
      },
      {
        channelId: this.DELIVERY_CHANNEL_ID
      }
    );
  }

  static async scheduleCreditsEarned(amount: number): Promise<string> {
    return this.scheduleNotification(
      {
        title: 'Credits Earned!',
        body: `You've earned R${amount.toFixed(2)} in recycling credits!`,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
        sound: true,
        data: { type: 'credits_earned', amount }
      },
      {
        channelId: this.CREDITS_CHANNEL_ID
      }
    );
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      PerformanceMonitor.addBreadcrumb(
        'notifications',
        `Cancelled notification: ${notificationId}`
      );
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw new Error('Failed to cancel notification');
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      PerformanceMonitor.addBreadcrumb(
        'notifications',
        'Cancelled all notifications'
      );
    } catch (error) {
      PerformanceMonitor.captureError(error as Error);
      throw new Error('Failed to cancel all notifications');
    }
  }
} 