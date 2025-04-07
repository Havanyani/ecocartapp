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
import { Notification } from '@/types/Notification';
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationCategory, NotificationChannel, NotificationPreferences } from '@/types/NotificationPreferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WebSocketService } from './WebSocketService';

// Storage keys
const NOTIFICATION_PREFERENCES_KEY = 'eco_cart_notification_preferences';
const PUSH_TOKEN_KEY = 'eco_cart_device_token';
const NOTIFICATION_HISTORY_KEY = 'eco_cart_notification_history';
const MAX_NOTIFICATION_HISTORY = 100;

// Default preferences with proper importance property
const DEFAULT_PREFERENCES: NotificationPreferences = {
  allNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: false,
  smsNotificationsEnabled: false,
  
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
  
  schedule: {
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '7:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6]
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

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private preferences: NotificationPreferences | null = null;
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
    
    try {
      // Load preferences
      await this.loadPreferences();
      
      // Register for push notifications if enabled
      if (this.preferences?.pushNotificationsEnabled) {
        await this.registerForPushNotifications();
      }
      
      // Configure notification handler
      this.configureNotificationHandler();
      
      this.isInitialized = true;
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      throw error;
    }
  }
  
  /**
   * Loads notification preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const preferencesJson = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      
      if (preferencesJson) {
        this.preferences = JSON.parse(preferencesJson) as NotificationPreferences;
      } else {
        // Use default preferences
        this.preferences = DEFAULT_NOTIFICATION_PREFERENCES;
        await this.savePreferences();
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      this.preferences = DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }
  
  /**
   * Save notification preferences to storage
   */
  private async savePreferences(): Promise<void> {
    if (!this.preferences) return;
    
    try {
      // Update last updated timestamp
      this.preferences.lastUpdated = Date.now();
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(
        NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      throw error;
    }
  }
  
  /**
   * Get current notification preferences
   */
  public getPreferences(): NotificationPreferences {
    if (!this.preferences) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
    return this.preferences;
  }
  
  /**
   * Update notification preferences
   */
  public async updatePreferences(newPreferences: NotificationPreferences): Promise<void> {
    this.preferences = newPreferences;
    await this.savePreferences();
    
    // If push notification preference changed, update registration
    if (newPreferences.pushNotificationsEnabled) {
      await this.registerForPushNotifications();
    }
    
    // Update Android channels if needed
    if (Platform.OS === 'android') {
      await this.setupAndroidNotificationChannels();
    }
  }
  
  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences) return false;
    
    const schedule = this.preferences.schedule;
    if (!schedule.quietHoursEnabled) return false;
    
    // Check if today is an active day
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    if (!schedule.activeDays.includes(today)) return false;
    
    // Parse quiet hours times
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [startHour, startMinute] = schedule.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = schedule.quietHoursEnd.split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    // Handle case where quiet hours span midnight
    if (startTimeMinutes > endTimeMinutes) {
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
    }
    
    // Normal case
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
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
  private async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available on emulator');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.pushToken = token;
      
      // Save token to storage
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      
      if (Platform.OS === 'android') {
        await this.setupAndroidNotificationChannels();
      }
      
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }
  
  /**
   * Setup Android notification channels
   */
  private async setupAndroidNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;
    
    // Create channel for each category with appropriate importance
    for (const category of Object.values(NotificationCategory)) {
      const categoryPrefs = this.preferences?.[category];
      if (!categoryPrefs) continue;
      
      await Notifications.setNotificationChannelAsync(category, {
        name: this.getCategoryDisplayName(category),
        importance: this.getImportanceLevel(categoryPrefs.importance),
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }
  
  /**
   * Get category display name
   */
  private getCategoryDisplayName(category: NotificationCategory): string {
    switch (category) {
      case NotificationCategory.COLLECTION:
        return 'Collection Notifications';
      case NotificationCategory.DELIVERY:
        return 'Delivery Notifications';
      case NotificationCategory.REWARDS:
        return 'Rewards Notifications';
      case NotificationCategory.COMMUNITY:
        return 'Community Notifications';
      case NotificationCategory.SYSTEM:
        return 'System Notifications';
      default:
        return 'Notifications';
    }
  }
  
  /**
   * Get Android notification importance level
   */
  private getImportanceLevel(importance: string): Notifications.AndroidImportance {
    switch (importance) {
      case 'high':
        return Notifications.AndroidImportance.HIGH;
      case 'medium':
        return Notifications.AndroidImportance.DEFAULT;
      case 'low':
        return Notifications.AndroidImportance.LOW;
      default:
        return Notifications.AndroidImportance.DEFAULT;
    }
  }
  
  /**
   * Configure notification handler
   */
  private configureNotificationHandler(): void {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const category = notification.request.content.data?.category as NotificationCategory || NotificationCategory.SYSTEM;
        const shouldShowAlert = this.shouldShowNotification(category);
        
        // Add notification to history
        const notificationData: Notification = {
          id: notification.request.identifier,
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          category: category,
          read: false,
          createdAt: new Date().toISOString(),
          data: notification.request.content.data as Record<string, any> || {},
        };
        
        await this.addNotificationToHistory(notificationData);
        
        return {
          shouldShowAlert,
          shouldPlaySound: shouldShowAlert && this.preferences?.soundEnabled || false,
          shouldSetBadge: true,
        };
      },
    });
  }
  
  /**
   * Check if notification should be shown based on preferences and quiet hours
   */
  private shouldShowNotification(category: NotificationCategory): boolean {
    if (!this.preferences) return true;
    
    // Check if notifications are enabled globally
    if (!this.preferences.allNotificationsEnabled) return false;
    
    // Check if category is enabled
    const categoryPrefs = this.preferences[category];
    if (!categoryPrefs?.enabled) return false;
    
    // Check quiet hours
    if (this.preferences.schedule.quietHoursEnabled && this.isInQuietHours()) {
      return false;
    }
    
    return true;
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
      const notificationData = notification.request.content.data || {};
      const category = notificationData.category || NotificationCategory.SYSTEM;
      
      const historyItem: Notification = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        category,
        read: false,
        createdAt: new Date().toISOString(),
        data: notificationData
      };
      
      await this.addNotificationToHistoryInternal(historyItem);
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

  /**
   * Get notification history
   */
  public async getNotificationHistory(): Promise<Notification[]> {
    try {
      const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (!historyJson) return [];
      
      const history = JSON.parse(historyJson) as Notification[];
      return history.sort((a, b) => {
        const aTime = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt;
        const bTime = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt;
        return bTime - aTime; // Sort newest first
      });
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }
  
  /**
   * Mark a notification as read
   */
  public async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read
   */
  public async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map(notification => ({ ...notification, read: true }));
      
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
  
  /**
   * Delete a notification
   */
  public async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.filter(notification => notification.id !== notificationId);
      
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
  
  /**
   * Clear all notifications
   */
  public async clearAllNotifications(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadCount(): Promise<number> {
    try {
      const history = await this.getNotificationHistory();
      return history.filter(notification => !notification.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Add notification to history when received
   * This method should be called whenever a notification is displayed
   */
  private async addNotificationToHistoryInternal(notification: Notification): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      
      // Check if notification with same ID already exists
      const exists = history.some(n => n.id === notification.id);
      if (exists) return;
      
      // Add to history
      const updatedHistory = [notification, ...history];
      
      // Limit history size
      const MAX_HISTORY_SIZE = 100;
      if (updatedHistory.length > MAX_HISTORY_SIZE) {
        updatedHistory.splice(MAX_HISTORY_SIZE);
      }
      
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding notification to history:', error);
    }
  }
}

export default NotificationService; 