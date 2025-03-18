/**
 * NotificationService
 * 
 * Manages all notifications in the app, including:
 * - Push notifications
 * - In-app notifications
 * - Achievement and quest notifications
 * - Real-time notification delivery
 * - Notification preferences
 */

import { CollectionStatus } from '@/types/Collection';
import { DeliveryStatus } from '@/types/DeliveryPersonnel';
import { NotificationCategory, NotificationChannel, NotificationPreferences } from '@/types/NotificationPreferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ApiService } from './ApiService';
import { WebSocketService } from './WebSocketService';

// Storage keys
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';
const PUSH_TOKEN_KEY = 'push_notification_token';

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  allNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  
  collection: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    priority: 'high'
  },
  
  delivery: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    priority: 'high'
  },
  
  system: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    priority: 'medium'
  },
  
  rewards: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    priority: 'medium'
  },
  
  community: {
    enabled: true,
    channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
    priority: 'low'
  },
  
  schedule: {
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    daysEnabled: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
  },
  
  collectionStatusChanges: true,
  personnelLocationUpdates: true,
  deliveryStatusUpdates: true,
  locationUpdates: true,
  routeChanges: true,
  collectionUpdates: true,
  achievementNotifications: true,
  questNotifications: true,
  creditUpdates: true,
  communityEvents: true
};

class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private pushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  
  private constructor() {}
  
  /**
   * Gets the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Initialize the notification service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Load saved preferences
    await this.loadPreferences();
    
    // Request permissions
    if (this.preferences.pushNotificationsEnabled) {
      await this.requestPermissions();
    }
    
    // Configure notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        // Check if in quiet hours
        if (this.preferences.schedule.quietHoursEnabled && this.isInQuietHours()) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }
        
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });
    
    // Register for push notifications
    if (this.preferences.pushNotificationsEnabled) {
      await this.registerForPushNotifications();
    }
    
    // Set up notification listeners
    this.setupNotificationListeners();
    
    // Set up real-time notifications from WebSocket
    this.setupRealTimeNotifications();
    
    this.isInitialized = true;
  }
  
  /**
   * Loads notification preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const savedPrefs = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (savedPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
      }
      
      const savedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (savedToken) {
        this.pushToken = savedToken;
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }
  
  /**
   * Save notification preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }
  
  /**
   * Get current notification preferences
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }
  
  /**
   * Update notification preferences
   */
  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    
    // If push notifications were toggled, handle that change
    if (preferences.pushNotificationsEnabled !== undefined) {
      if (preferences.pushNotificationsEnabled) {
        await this.registerForPushNotifications();
      }
    }
    
    // Save updated preferences
    await this.savePreferences();
    
    // Update server with new preferences if we have a token
    if (this.pushToken) {
      await this.updateServerPreferences();
    }
  }
  
  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.schedule.quietHoursEnabled) {
      return false;
    }
    
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if the current day is enabled
    const dayEnabled = this.isDayEnabled(day);
    if (!dayEnabled) {
      return false;
    }
    
    // Parse quiet hours
    const [startHour, startMinute] = this.preferences.schedule.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.preferences.schedule.quietHoursEnd.split(':').map(Number);
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert to minutes for easier comparison
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    // Check if current time is in quiet hours
    if (startTimeMinutes < endTimeMinutes) {
      // Simple case: start and end on the same day
      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
    } else {
      // Complex case: quiet hours span midnight
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
    }
  }
  
  /**
   * Check if the current day is enabled for notifications
   */
  private isDayEnabled(day: number): boolean {
    const dayMap = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];
    
    return this.preferences.schedule.daysEnabled[dayMap[day]];
  }
  
  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    // Check if physical device (permissions are always granted on emulators)
    if (!Device.isDevice) {
      return true;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00CA4E',
      });
      
      // Create additional channels for different categories
      Notifications.setNotificationChannelAsync('collection', {
        name: 'Collection Notifications',
        description: 'Notifications about your recycling collections',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
      
      Notifications.setNotificationChannelAsync('delivery', {
        name: 'Delivery Notifications',
        description: 'Notifications about delivery personnel',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });
    }
    
    return true;
  }
  
  /**
   * Register for push notifications
   */
  private async registerForPushNotifications(): Promise<void> {
    if (!Device.isDevice) {
      console.log('Push notifications are not supported in the emulator');
      return;
    }
    
    try {
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) return;
      
      // Get push token
      const tokenData = await Notifications.getDevicePushTokenAsync();
      this.pushToken = tokenData.data;
      
      // Save token
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);
      
      // Register token with server
      await this.registerTokenWithServer();
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }
  
  /**
   * Register token with server
   */
  private async registerTokenWithServer(): Promise<void> {
    if (!this.pushToken) return;
    
    try {
      await ApiService.getInstance().post('/notifications/register-device', {
        token: this.pushToken,
        platform: Platform.OS,
        preferences: this.preferences
      });
    } catch (error) {
      console.error('Error registering token with server:', error);
    }
  }
  
  /**
   * Update server with new preferences
   */
  private async updateServerPreferences(): Promise<void> {
    if (!this.pushToken) return;
    
    try {
      await ApiService.getInstance().post('/notifications/update-preferences', {
        token: this.pushToken,
        preferences: this.preferences
      });
    } catch (error) {
      console.error('Error updating server preferences:', error);
    }
  }
  
  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Handle received notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Add notification to history
      this.addNotificationToHistory(notification);
    });
    
    // Handle notification responses (when user taps the notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Handle navigation based on notification type
      this.handleNotificationTap(data);
    });
  }
  
  /**
   * Add a notification to history
   */
  private async addNotificationToHistory(notification: Notifications.Notification): Promise<void> {
    try {
      const data = notification.request.content.data || {};
      const title = notification.request.content.title || '';
      const body = notification.request.content.body || '';
      
      const historyItem = {
        id: notification.request.identifier,
        type: data.type || 'general',
        category: data.category || NotificationCategory.SYSTEM,
        title,
        body,
        timestamp: new Date(),
        read: false,
        data
      };
      
      // Send to server to store in history
      await ApiService.getInstance().post('/notifications/history', historyItem);
    } catch (error) {
      console.error('Error adding notification to history:', error);
    }
  }
  
  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: any): void {
    // Navigate based on notification type
    // This will need to be integrated with your app's navigation
    // For now, we just log it
    console.log('Notification tapped with data:', data);
  }
  
  /**
   * Schedule a local notification
   */
  public async scheduleNotification(
    title: string, 
    body: string, 
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Check if notifications are enabled
    if (!this.preferences.allNotificationsEnabled) {
      return '';
    }
    
    // Check if the specific category is enabled
    const category = data?.category || NotificationCategory.SYSTEM;
    if (!this.isCategoryEnabled(category)) {
      return '';
    }
    
    // Determine Android channel
    let androidChannelId = 'default';
    if (category === NotificationCategory.COLLECTION) {
      androidChannelId = 'collection';
    } else if (category === NotificationCategory.DELIVERY) {
      androidChannelId = 'delivery';
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        ...(Platform.OS === 'android' && { channelId: androidChannelId })
      },
      trigger: trigger || null,
    });
    
    return notificationId;
  }
  
  /**
   * Check if a category is enabled
   */
  private isCategoryEnabled(category: NotificationCategory): boolean {
    if (category === NotificationCategory.COLLECTION) {
      return this.preferences.collection.enabled;
    } else if (category === NotificationCategory.DELIVERY) {
      return this.preferences.delivery.enabled;
    } else if (category === NotificationCategory.SYSTEM) {
      return this.preferences.system.enabled;
    } else if (category === NotificationCategory.REWARDS) {
      return this.preferences.rewards.enabled;
    } else if (category === NotificationCategory.COMMUNITY) {
      return this.preferences.community.enabled;
    }
    
    return true;
  }
  
  /**
   * Send an immediate notification
   */
  public async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.scheduleNotification(title, body, data);
  }
  
  /**
   * Send a notification for an achievement
   */
  public async sendAchievementNotification(
    achievementId: string,
    title: string,
    message: string
  ): Promise<string> {
    if (!this.preferences.achievementNotifications) return '';
    
    return this.sendImmediateNotification(
      title,
      message,
      {
        type: 'achievement',
        category: NotificationCategory.REWARDS,
        achievementId
      }
    );
  }
  
  /**
   * Send a notification for quest completion
   */
  public async sendQuestNotification(
    questId: string,
    title: string,
    message: string
  ): Promise<string> {
    if (!this.preferences.questNotifications) return '';
    
    return this.sendImmediateNotification(
      title,
      message,
      {
        type: 'quest',
        category: NotificationCategory.REWARDS,
        questId
      }
    );
  }
  
  /**
   * Send a reminder notification
   */
  public async scheduleReminderNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>
  ): Promise<string> {
    return this.scheduleNotification(
      title,
      body,
      {
        ...data,
        type: 'reminder',
        category: NotificationCategory.SYSTEM
      },
      { date: triggerDate }
    );
  }
  
  /**
   * Cancel a scheduled notification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
  
  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Send notification for delivery status update
   */
  public async sendDeliveryStatusNotification(
    personnelId: string,
    status: DeliveryStatus,
    details: string
  ): Promise<string> {
    if (!this.preferences.deliveryStatusUpdates) return '';

    const title = this.getStatusTitle(status);
    const body = this.getStatusBody(status, details);

    return this.scheduleNotification(
      title,
      body,
      {
        type: 'delivery-status',
        category: NotificationCategory.DELIVERY,
        personnelId,
        status
      }
    );
  }

  /**
   * Send notification for location update
   */
  public async sendLocationUpdateNotification(
    personnelId: string,
    location: string
  ): Promise<string> {
    if (!this.preferences.locationUpdates) return '';

    return this.scheduleNotification(
      'Location Update',
      `Delivery personnel is now at ${location}`,
      {
        type: 'location-update',
        category: NotificationCategory.DELIVERY,
        personnelId
      }
    );
  }

  /**
   * Send notification for route change
   */
  public async sendRouteChangeNotification(
    personnelId: string,
    newRoute: string
  ): Promise<string> {
    if (!this.preferences.routeChanges) return '';

    return this.scheduleNotification(
      'Route Change',
      `Delivery route has been updated to ${newRoute}`,
      {
        type: 'route-change',
        category: NotificationCategory.DELIVERY,
        personnelId
      }
    );
  }

  /**
   * Send notification for collection update
   */
  public async sendCollectionUpdateNotification(
    collectionId: string,
    collectionDetails: string
  ): Promise<string> {
    if (!this.preferences.collectionUpdates) return '';

    return this.scheduleNotification(
      'Collection Update',
      collectionDetails,
      {
        type: 'collection-update',
        category: NotificationCategory.COLLECTION,
        collectionId
      }
    );
  }

  /**
   * Send notification for user collection update
   */
  public async sendUserCollectionUpdate(
    data: {
      collectionId: string;
      status: string;
      message: string;
    }
  ): Promise<string> {
    if (!this.preferences.collectionStatusChanges) return '';
    
    return this.scheduleNotification(
      'Collection Update',
      data.message,
      {
        type: 'user-collection-update',
        category: NotificationCategory.COLLECTION,
        collectionId: data.collectionId,
        status: data.status
      }
    );
  }
  
  /**
   * Send notification for dispatch events
   */
  public async sendDispatchNotification(
    data: {
      type: string;
      routeId?: string;
      collectionId?: string;
      message: string;
    }
  ): Promise<string> {
    return this.scheduleNotification(
      'Dispatch Notification',
      data.message,
      {
        type: 'dispatch',
        category: NotificationCategory.SYSTEM,
        ...data
      }
    );
  }

  private getStatusTitle(status: DeliveryStatus): string {
    switch (status) {
      case 'available':
        return 'Delivery Personnel Available';
      case 'on_delivery':
        return 'Delivery in Progress';
      case 'completed':
        return 'Delivery Completed';
      case 'offline':
        return 'Delivery Personnel Offline';
      default:
        return 'Delivery Status Update';
    }
  }

  private getStatusBody(status: DeliveryStatus, details: string): string {
    switch (status) {
      case 'available':
        return `Delivery personnel is now available. ${details}`;
      case 'on_delivery':
        return `Delivery is currently in progress. ${details}`;
      case 'completed':
        return `Delivery has been completed successfully. ${details}`;
      case 'offline':
        return `Delivery personnel is currently offline. ${details}`;
      default:
        return details;
    }
  }

  /**
   * Send live notification for personnel location update
   */
  public async sendPersonnelLocationUpdate(
    personnelId: string,
    location: { latitude: number; longitude: number }
  ): Promise<string> {
    if (!this.preferences.personnelLocationUpdates) return '';
    
    return this.scheduleNotification(
      'Delivery Personnel Update',
      'Your delivery personnel has moved to a new location',
      {
        type: 'personnel-location-update',
        category: NotificationCategory.COLLECTION,
        personnelId,
        location
      }
    );
  }

  /**
   * Send live notification for collection status changes
   */
  public async sendCollectionStatusChangeNotification(
    collectionId: string,
    status: CollectionStatus,
    address: string
  ): Promise<string> {
    if (!this.preferences.collectionStatusChanges) return '';
    
    const statusMessages = {
      pending: 'Your collection request is pending',
      confirmed: 'Your collection has been confirmed',
      in_progress: 'Your collection is now in progress',
      completed: 'Your collection has been completed successfully',
      cancelled: 'Your collection has been cancelled',
      rescheduled: 'Your collection has been rescheduled',
    };
    
    const message = status in statusMessages 
      ? `${statusMessages[status]} at ${address}`
      : `Your collection status has been updated to ${status} at ${address}`;
    
    return this.scheduleNotification(
      'Collection Status Update',
      message,
      {
        type: 'collection-status-change',
        category: NotificationCategory.COLLECTION,
        collectionId,
        status
      }
    );
  }

  /**
   * Send notification when delivery personnel is assigned
   */
  public async sendDeliveryPersonnelAssignedNotification(
    collectionId: string,
    personnelId: string,
    personnelName: string
  ): Promise<string> {
    return this.scheduleNotification(
      'Delivery Personnel Assigned',
      `${personnelName} has been assigned to your collection`,
      {
        type: 'delivery-personnel-assigned',
        category: NotificationCategory.COLLECTION,
        collectionId,
        personnelId,
        personnelName
      }
    );
  }

  /**
   * Register for real-time notifications from WebSocket
   */
  public setupRealTimeNotifications(): void {
    // Get WebSocket service and connect if not already connected
    const webSocketService = WebSocketService.getInstance();
    webSocketService.connect();
    
    // Handle real-time notification events
    webSocketService.subscribe('notification', (event: any) => {
      if (!event || !event.type) return;
      
      switch (event.type) {
        case 'personnel-location-update':
          if (this.preferences.personnelLocationUpdates) {
            this.sendPersonnelLocationUpdate(event.personnelId, event.location);
          }
          break;
        case 'collection-status-change':
          if (this.preferences.collectionStatusChanges) {
            this.sendCollectionStatusChangeNotification(
              event.collectionId, 
              event.status, 
              event.address || 'your address'
            );
          }
          break;
        case 'delivery-personnel-assigned':
          this.sendDeliveryPersonnelAssignedNotification(
            event.collectionId,
            event.personnelId,
            event.personnelName || 'A delivery agent'
          );
          break;
        case 'delivery-status-update':
          if (this.preferences.deliveryStatusUpdates) {
            this.sendDeliveryStatusNotification(
              event.personnelId,
              event.status,
              event.details || ''
            );
          }
          break;
      }
    });
  }
  
  /**
   * Clean up notification listeners
   */
  public cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default NotificationService; 