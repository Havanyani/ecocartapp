import { NotificationHistory, NotificationHistoryFilters, NotificationHistoryStats } from '@/types/NotificationHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@notification_history';

/**
 * Service for managing notification history
 */
class NotificationHistoryService {
  private static instance: NotificationHistoryService;
  private history: NotificationHistory[] = [];

  private constructor() {
    this.loadHistory();
  }

  /**
   * Get the singleton instance of NotificationHistoryService
   */
  public static getInstance(): NotificationHistoryService {
    if (!NotificationHistoryService.instance) {
      NotificationHistoryService.instance = new NotificationHistoryService();
    }
    return NotificationHistoryService.instance;
  }

  /**
   * Load notification history from storage
   */
  private async loadHistory(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }

  /**
   * Save notification history to storage
   */
  private async saveHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  /**
   * Add a new notification to history
   */
  public async addNotification(notification: Omit<NotificationHistory, 'id' | 'timestamp' | 'read'>): Promise<NotificationHistory> {
    const newNotification: NotificationHistory = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
    };

    this.history.unshift(newNotification);
    await this.saveHistory();
    return newNotification;
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead(id: string): Promise<void> {
    const notification = this.history.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      await this.saveHistory();
    }
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(): Promise<void> {
    this.history.forEach(notification => {
      notification.read = true;
    });
    await this.saveHistory();
  }

  /**
   * Get notification history with optional filters
   */
  public async getHistory(filters?: NotificationHistoryFilters): Promise<NotificationHistory[]> {
    // Ensure history is loaded
    if (this.history.length === 0) {
      await this.loadHistory();
    }

    // Apply filters if provided
    if (!filters) {
      return [...this.history];
    }

    return this.history.filter(notification => {
      // Filter by read status
      if (filters.read !== undefined && notification.read !== filters.read) {
        return false;
      }

      // Filter by type
      if (filters.type && notification.type !== filters.type) {
        return false;
      }

      // Filter by personnel ID
      if (filters.personnelId && notification.personnelId !== filters.personnelId) {
        return false;
      }

      // Filter by date range
      if (filters.startDate && notification.timestamp < filters.startDate) {
        return false;
      }

      if (filters.endDate && notification.timestamp > filters.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Clear all notification history
   */
  public async clearHistory(): Promise<void> {
    this.history = [];
    await this.saveHistory();
  }

  /**
   * Get notification history statistics
   */
  public getStats(): NotificationHistoryStats {
    const stats: NotificationHistoryStats = {
      total: this.history.length,
      unread: this.history.filter(n => !n.read).length,
      byType: {
        delivery_status: 0,
        location_update: 0,
        route_change: 0,
        collection_update: 0,
      },
      byDate: {},
    };

    this.history.forEach(notification => {
      // Count by type
      stats.byType[notification.type]++;
      
      // Count by date
      const dateKey = notification.timestamp.toISOString().split('T')[0];
      stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + 1;
    });

    return stats;
  }

  /**
   * Delete a specific notification by ID
   */
  public async deleteNotification(id: string): Promise<void> {
    const index = this.history.findIndex(n => n.id === id);
    if (index !== -1) {
      this.history.splice(index, 1);
      await this.saveHistory();
    }
  }

  /**
   * Delete notifications by filter criteria
   */
  public async deleteNotifications(filters: NotificationHistoryFilters): Promise<number> {
    const beforeCount = this.history.length;
    
    this.history = this.history.filter(notification => {
      // Keep if doesn't match read status filter
      if (filters.read !== undefined && notification.read !== filters.read) {
        return true;
      }

      // Keep if doesn't match type filter
      if (filters.type && notification.type !== filters.type) {
        return true;
      }

      // Keep if doesn't match personnel ID filter
      if (filters.personnelId && notification.personnelId !== filters.personnelId) {
        return true;
      }

      // Keep if doesn't match date range filters
      if (filters.startDate && notification.timestamp < filters.startDate) {
        return true;
      }

      if (filters.endDate && notification.timestamp > filters.endDate) {
        return true;
      }

      // Delete if matches all filters
      return false;
    });

    await this.saveHistory();
    return beforeCount - this.history.length;
  }
}

// Export singleton instance
export const notificationHistoryService = {
  getInstance: () => NotificationHistoryService.getInstance()
}; 