/**
 * FeedbackService.ts
 * 
 * Service for collecting and managing user feedback, bug reports, and feature requests.
 * Provides methods for submitting feedback, viewing feedback history, and analyzing feedback trends.
 */

import { SafeStorage } from '@/utils/storage';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { environment } from '@/config/environments';

// Feedback types
export enum FeedbackType {
  BUG_REPORT = 'bug_report',
  FEATURE_REQUEST = 'feature_request',
  GENERAL_FEEDBACK = 'general_feedback',
  RATING = 'rating',
}

// Feedback status
export enum FeedbackStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

// Feedback priority
export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Feedback interface
export interface Feedback {
  id: string;
  userId?: string;
  type: FeedbackType;
  title: string;
  description: string;
  rating?: number; // 1-5 rating
  screenshotUri?: string;
  category?: string;
  priority?: FeedbackPriority;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  deviceInfo: {
    deviceName?: string;
    deviceModel?: string;
    osName?: string;
    osVersion?: string;
    appVersion: string;
  };
}

/**
 * Service for handling user feedback
 */
export class FeedbackService {
  private static readonly FEEDBACK_STORAGE_KEY = '@ecocart/feedback';
  private static readonly FEEDBACK_CONFIG_KEY = '@ecocart/feedback_config';

  /**
   * Submit user feedback
   * 
   * @param type Type of feedback
   * @param title Short title or summary
   * @param description Detailed feedback
   * @param rating Optional rating (1-5)
   * @param screenshotUri Optional screenshot URI
   * @param category Optional category
   * @returns The created feedback object
   */
  static async submitFeedback(
    type: FeedbackType,
    title: string,
    description: string,
    rating?: number,
    screenshotUri?: string,
    category?: string,
  ): Promise<Feedback> {
    try {
      // Generate unique ID
      const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      // Get user ID if available
      let userId: string | undefined;
      try {
        userId = await SafeStorage.getItem('@ecocart/user_id') || undefined;
      } catch (error) {
        console.warn('Could not retrieve user ID for feedback:', error);
      }

      // Get device info
      const deviceInfo = await this.getDeviceInfo();

      // Create feedback object
      const feedback: Feedback = {
        id,
        userId,
        type,
        title,
        description,
        rating,
        status: FeedbackStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        deviceInfo,
        category,
      };

      // Handle screenshot if provided
      if (screenshotUri) {
        // Check if we need to copy the screenshot to app storage
        if (screenshotUri.startsWith('file://') || screenshotUri.startsWith('content://')) {
          const feedbackDir = `${FileSystem.documentDirectory}feedback/`;
          
          // Ensure directory exists
          const dirInfo = await FileSystem.getInfoAsync(feedbackDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(feedbackDir, { intermediates: true });
          }
          
          // Copy file
          const newUri = `${feedbackDir}${id}.jpg`;
          await FileSystem.copyAsync({
            from: screenshotUri,
            to: newUri,
          });
          
          feedback.screenshotUri = newUri;
        } else {
          feedback.screenshotUri = screenshotUri;
        }
      }

      // Save feedback locally
      await this.saveFeedback(feedback);

      // Attempt to submit feedback to server
      try {
        await this.syncFeedbackToServer(feedback);
      } catch (error) {
        console.warn('Failed to sync feedback to server:', error);
        // Will be synced later when online
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback. Please try again.');
    }
  }

  /**
   * Get all user feedback
   * 
   * @returns Array of feedback items
   */
  static async getAllFeedback(): Promise<Feedback[]> {
    try {
      const feedbackJson = await SafeStorage.getItem(this.FEEDBACK_STORAGE_KEY);
      const feedback: Feedback[] = feedbackJson ? JSON.parse(feedbackJson) : [];
      return feedback.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  }

  /**
   * Get pending feedback that hasn't been synced to the server
   * 
   * @returns Array of pending feedback items
   */
  static async getPendingFeedback(): Promise<Feedback[]> {
    try {
      const allFeedback = await this.getAllFeedback();
      return allFeedback.filter(item => item.status === FeedbackStatus.PENDING);
    } catch (error) {
      console.error('Error getting pending feedback:', error);
      return [];
    }
  }

  /**
   * Update feedback status
   * 
   * @param feedbackId ID of the feedback to update
   * @param status New status
   * @param priority Optional priority update
   * @returns Updated feedback item or null if not found
   */
  static async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
    priority?: FeedbackPriority
  ): Promise<Feedback | null> {
    try {
      const allFeedback = await this.getAllFeedback();
      const index = allFeedback.findIndex(item => item.id === feedbackId);
      
      if (index === -1) {
        return null;
      }
      
      // Update feedback
      allFeedback[index] = {
        ...allFeedback[index],
        status,
        priority: priority || allFeedback[index].priority,
        updatedAt: new Date().toISOString(),
      };
      
      // Save updated feedback
      await SafeStorage.setItem(this.FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
      
      return allFeedback[index];
    } catch (error) {
      console.error('Error updating feedback:', error);
      return null;
    }
  }

  /**
   * Delete feedback
   * 
   * @param feedbackId ID of the feedback to delete
   * @returns Whether the deletion was successful
   */
  static async deleteFeedback(feedbackId: string): Promise<boolean> {
    try {
      const allFeedback = await this.getAllFeedback();
      const updatedFeedback = allFeedback.filter(item => item.id !== feedbackId);
      
      // If no items were removed, the ID wasn't found
      if (updatedFeedback.length === allFeedback.length) {
        return false;
      }
      
      // Save updated feedback
      await SafeStorage.setItem(this.FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
      
      // Delete screenshot if exists
      const feedback = allFeedback.find(item => item.id === feedbackId);
      if (feedback?.screenshotUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(feedback.screenshotUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(feedback.screenshotUri);
          }
        } catch (error) {
          console.warn('Error deleting feedback screenshot:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  }

  /**
   * Get feedback statistics
   * 
   * @returns Statistics about collected feedback
   */
  static async getFeedbackStats(): Promise<{
    total: number;
    byType: Record<FeedbackType, number>;
    byStatus: Record<FeedbackStatus, number>;
    averageRating: number;
    recentTrend: 'up' | 'down' | 'stable';
  }> {
    try {
      const allFeedback = await this.getAllFeedback();
      
      // Initialize counters
      const byType: Record<FeedbackType, number> = {
        [FeedbackType.BUG_REPORT]: 0,
        [FeedbackType.FEATURE_REQUEST]: 0,
        [FeedbackType.GENERAL_FEEDBACK]: 0,
        [FeedbackType.RATING]: 0,
      };
      
      const byStatus: Record<FeedbackStatus, number> = {
        [FeedbackStatus.PENDING]: 0,
        [FeedbackStatus.ACKNOWLEDGED]: 0,
        [FeedbackStatus.IN_PROGRESS]: 0,
        [FeedbackStatus.RESOLVED]: 0,
        [FeedbackStatus.REJECTED]: 0,
      };
      
      // Calculate statistics
      let ratingSum = 0;
      let ratingCount = 0;
      
      allFeedback.forEach(feedback => {
        // Count by type
        byType[feedback.type] = (byType[feedback.type] || 0) + 1;
        
        // Count by status
        byStatus[feedback.status] = (byStatus[feedback.status] || 0) + 1;
        
        // Sum ratings
        if (feedback.rating) {
          ratingSum += feedback.rating;
          ratingCount++;
        }
      });
      
      // Calculate average rating
      const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
      
      // Calculate recent trend
      // Compare average rating in the last month vs the previous month
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      
      const recentFeedback = allFeedback.filter(f => 
        f.rating && new Date(f.createdAt) >= oneMonthAgo
      );
      
      const olderFeedback = allFeedback.filter(f => 
        f.rating && new Date(f.createdAt) >= twoMonthsAgo && new Date(f.createdAt) < oneMonthAgo
      );
      
      let recentAvg = 0, olderAvg = 0;
      
      if (recentFeedback.length > 0) {
        recentAvg = recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length;
      }
      
      if (olderFeedback.length > 0) {
        olderAvg = olderFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / olderFeedback.length;
      }
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (recentFeedback.length > 0 && olderFeedback.length > 0) {
        const diff = recentAvg - olderAvg;
        if (diff > 0.2) {
          trend = 'up';
        } else if (diff < -0.2) {
          trend = 'down';
        }
      }
      
      return {
        total: allFeedback.length,
        byType,
        byStatus,
        averageRating,
        recentTrend: trend,
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return {
        total: 0,
        byType: {
          [FeedbackType.BUG_REPORT]: 0,
          [FeedbackType.FEATURE_REQUEST]: 0,
          [FeedbackType.GENERAL_FEEDBACK]: 0,
          [FeedbackType.RATING]: 0,
        },
        byStatus: {
          [FeedbackStatus.PENDING]: 0,
          [FeedbackStatus.ACKNOWLEDGED]: 0,
          [FeedbackStatus.IN_PROGRESS]: 0,
          [FeedbackStatus.RESOLVED]: 0,
          [FeedbackStatus.REJECTED]: 0,
        },
        averageRating: 0,
        recentTrend: 'stable',
      };
    }
  }

  /**
   * Sync all pending feedback to the server
   * 
   * @returns Number of successfully synced items
   */
  static async syncPendingFeedback(): Promise<number> {
    try {
      const pendingFeedback = await this.getPendingFeedback();
      let syncedCount = 0;
      
      for (const feedback of pendingFeedback) {
        try {
          await this.syncFeedbackToServer(feedback);
          await this.updateFeedbackStatus(feedback.id, FeedbackStatus.ACKNOWLEDGED);
          syncedCount++;
        } catch (error) {
          console.warn(`Failed to sync feedback ${feedback.id}:`, error);
        }
      }
      
      return syncedCount;
    } catch (error) {
      console.error('Error syncing pending feedback:', error);
      return 0;
    }
  }

  /**
   * Get feedback configuration
   * 
   * @returns Feedback configuration
   */
  static async getFeedbackConfig(): Promise<{
    promptAfterDays: number;
    promptAfterSessions: number;
    lastPromptDate: string | null;
    sessionCount: number;
    hasGivenFeedback: boolean;
  }> {
    try {
      const configJson = await SafeStorage.getItem(this.FEEDBACK_CONFIG_KEY);
      
      if (!configJson) {
        // Default configuration
        const defaultConfig = {
          promptAfterDays: 3,
          promptAfterSessions: 5,
          lastPromptDate: null,
          sessionCount: 0,
          hasGivenFeedback: false,
        };
        
        await SafeStorage.setItem(this.FEEDBACK_CONFIG_KEY, JSON.stringify(defaultConfig));
        return defaultConfig;
      }
      
      return JSON.parse(configJson);
    } catch (error) {
      console.error('Error getting feedback config:', error);
      
      // Default configuration
      return {
        promptAfterDays: 3,
        promptAfterSessions: 5,
        lastPromptDate: null,
        sessionCount: 0,
        hasGivenFeedback: false,
      };
    }
  }

  /**
   * Update feedback configuration
   * 
   * @param config Partial configuration to update
   * @returns Updated configuration
   */
  static async updateFeedbackConfig(config: Partial<{
    promptAfterDays: number;
    promptAfterSessions: number;
    lastPromptDate: string | null;
    sessionCount: number;
    hasGivenFeedback: boolean;
  }>): Promise<{
    promptAfterDays: number;
    promptAfterSessions: number;
    lastPromptDate: string | null;
    sessionCount: number;
    hasGivenFeedback: boolean;
  }> {
    try {
      const currentConfig = await this.getFeedbackConfig();
      const updatedConfig = { ...currentConfig, ...config };
      
      await SafeStorage.setItem(this.FEEDBACK_CONFIG_KEY, JSON.stringify(updatedConfig));
      return updatedConfig;
    } catch (error) {
      console.error('Error updating feedback config:', error);
      throw new Error('Failed to update feedback configuration');
    }
  }

  /**
   * Increment session count
   * Called when the app starts
   * 
   * @returns Updated session count
   */
  static async incrementSessionCount(): Promise<number> {
    try {
      const config = await this.getFeedbackConfig();
      const sessionCount = config.sessionCount + 1;
      
      await this.updateFeedbackConfig({ sessionCount });
      return sessionCount;
    } catch (error) {
      console.error('Error incrementing session count:', error);
      return 0;
    }
  }

  /**
   * Check if it's time to prompt for feedback
   * 
   * @returns Whether to prompt for feedback
   */
  static async shouldPromptForFeedback(): Promise<boolean> {
    try {
      const config = await this.getFeedbackConfig();
      
      // If user has already given feedback, don't prompt again
      if (config.hasGivenFeedback) {
        return false;
      }
      
      // Check if enough sessions have passed
      if (config.sessionCount < config.promptAfterSessions) {
        return false;
      }
      
      // Check if enough days have passed since last prompt
      if (config.lastPromptDate) {
        const lastPromptDate = new Date(config.lastPromptDate);
        const now = new Date();
        const daysSinceLastPrompt = Math.floor((now.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPrompt < config.promptAfterDays) {
          return false;
        }
      }
      
      // Update last prompt date
      await this.updateFeedbackConfig({ lastPromptDate: new Date().toISOString() });
      
      return true;
    } catch (error) {
      console.error('Error checking if should prompt for feedback:', error);
      return false;
    }
  }

  /**
   * Mark that the user has given feedback
   */
  static async markFeedbackGiven(): Promise<void> {
    try {
      await this.updateFeedbackConfig({ hasGivenFeedback: true });
    } catch (error) {
      console.error('Error marking feedback given:', error);
    }
  }

  // Private methods

  /**
   * Get device information for feedback
   */
  private static async getDeviceInfo(): Promise<{
    deviceName?: string;
    deviceModel?: string;
    osName?: string;
    osVersion?: string;
    appVersion: string;
  }> {
    try {
      const deviceName = await Device.getDeviceNameAsync() || undefined;
      const deviceModel = Device.modelName || undefined;
      const osName = Platform.OS;
      const osVersion = Platform.Version.toString();
      const appVersion = environment.appVersion || '1.0.0';

      return {
        deviceName,
        deviceModel,
        osName,
        osVersion,
        appVersion,
      };
    } catch (error) {
      console.warn('Error getting device info:', error);
      return {
        appVersion: '1.0.0',
      };
    }
  }

  /**
   * Save feedback item to local storage
   */
  private static async saveFeedback(feedback: Feedback): Promise<void> {
    try {
      const allFeedback = await this.getAllFeedback();
      allFeedback.push(feedback);
      await SafeStorage.setItem(this.FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw new Error('Failed to save feedback locally');
    }
  }

  /**
   * Sync feedback to server
   */
  private static async syncFeedbackToServer(feedback: Feedback): Promise<void> {
    // In a real implementation, this would send the feedback to your backend API
    // For now, we'll simulate a successful sync with a timeout
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const shouldSucceed = Math.random() > 0.1; // 90% success rate
        
        if (shouldSucceed) {
          resolve();
        } else {
          reject(new Error('Simulated network failure'));
        }
      }, 500);
    });
  }
} 