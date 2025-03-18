/**
 * AnalyticsService.ts
 * 
 * Service for tracking user behavior and feature usage to inform product decisions.
 * Integrates with Firebase Analytics but provides an abstraction layer for potential
 * future analytics provider changes.
 */

import * as Analytics from 'expo-firebase-analytics';
import { Platform } from 'react-native';
import { environment, isProduction } from '@/config/environments';

export type EventProperties = Record<string, string | number | boolean | null | undefined>;
export type UserProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Feature usage tracking for analytics-based prioritization
 */
interface FeatureUsage {
  featureId: string;
  usageCount: number;
  lastUsed: Date;
  userSegments: Record<string, number>;
  averageTimeSpent?: number;
  completionRate?: number;
  userRating?: number;
}

/**
 * Analytics service for tracking user behavior and feature usage
 */
export class AnalyticsService {
  private static isInitialized = false;
  private static featureMetrics: Map<string, FeatureUsage> = new Map();
  private static userSegment: string | null = null;

  /**
   * Initialize the analytics service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Only track analytics in production or staging
      if (isProduction || environment.name === 'staging') {
        await Analytics.setAnalyticsCollectionEnabled(true);
      } else {
        // In development, disable real tracking but still log to console
        await Analytics.setAnalyticsCollectionEnabled(false);
        console.log('Analytics tracking disabled in development');
      }

      // Set default user properties
      await Analytics.setDefaultEventParameters({
        platform: Platform.OS,
        appVersion: environment.appVersion,
        environment: environment.name,
      });

      this.isInitialized = true;
      console.log(`Analytics initialized in ${environment.name} environment`);
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track an analytics event
   * 
   * @param eventName Name of the event to track
   * @param properties Additional properties for the event
   */
  static async trackEvent(eventName: string, properties?: EventProperties): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (isProduction || environment.name === 'staging') {
        await Analytics.logEvent(eventName, properties);
      } else {
        // In development, just log to console
        console.log(`[Analytics] Event: ${eventName}`, properties);
      }
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }

  /**
   * Set user properties for segmentation
   * 
   * @param properties User properties to set
   */
  static async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // For segmentation, save primary segment if available
      if (properties.userSegment && typeof properties.userSegment === 'string') {
        this.userSegment = properties.userSegment;
      }

      if (isProduction || environment.name === 'staging') {
        for (const [key, value] of Object.entries(properties)) {
          if (value !== undefined && value !== null) {
            await Analytics.setUserProperty(key, String(value));
          }
        }
      } else {
        // In development, just log to console
        console.log('[Analytics] Setting user properties:', properties);
      }
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Track user ID for analytics
   * 
   * @param userId User ID to track
   */
  static async setUserId(userId: string | null): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (isProduction || environment.name === 'staging') {
        await Analytics.setUserId(userId);
      } else {
        // In development, just log to console
        console.log(`[Analytics] Setting user ID: ${userId}`);
      }
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  /**
   * Track current screen for analytics
   * 
   * @param screenName Screen name to track
   * @param screenClass Optional screen class
   */
  static async trackScreen(screenName: string, screenClass?: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (isProduction || environment.name === 'staging') {
        await Analytics.logEvent('screen_view', {
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
      } else {
        // In development, just log to console
        console.log(`[Analytics] Screen view: ${screenName} (${screenClass || screenName})`);
      }
    } catch (error) {
      console.error(`Error tracking screen ${screenName}:`, error);
    }
  }

  /**
   * Track feature usage for analytics-based prioritization
   * 
   * @param featureId Unique identifier for the feature
   * @param timeSpent Optional time spent using the feature (ms)
   * @param completed Whether the feature usage was completed successfully
   * @param rating Optional user rating for the feature (1-5)
   */
  static trackFeatureUsage(
    featureId: string,
    timeSpent?: number,
    completed?: boolean,
    rating?: number
  ): void {
    try {
      // Track event
      this.trackEvent('feature_usage', {
        feature_id: featureId,
        time_spent: timeSpent,
        completed: completed,
        rating: rating,
      });

      // Update feature metrics
      let metrics = this.featureMetrics.get(featureId);
      if (!metrics) {
        metrics = {
          featureId,
          usageCount: 0,
          lastUsed: new Date(),
          userSegments: {},
          averageTimeSpent: 0,
          completionRate: 0,
          userRating: 0,
        };
      }

      // Update metrics
      metrics.usageCount += 1;
      metrics.lastUsed = new Date();

      // Update by user segment if available
      if (this.userSegment) {
        metrics.userSegments[this.userSegment] = (metrics.userSegments[this.userSegment] || 0) + 1;
      }

      // Update time spent
      if (timeSpent) {
        const totalTimeSpent = (metrics.averageTimeSpent || 0) * (metrics.usageCount - 1) + timeSpent;
        metrics.averageTimeSpent = totalTimeSpent / metrics.usageCount;
      }

      // Update completion rate
      if (completed !== undefined) {
        const totalCompletions = (metrics.completionRate || 0) * (metrics.usageCount - 1) + (completed ? 1 : 0);
        metrics.completionRate = totalCompletions / metrics.usageCount;
      }

      // Update user rating
      if (rating !== undefined && rating >= 1 && rating <= 5) {
        const totalRating = (metrics.userRating || 0) * (metrics.usageCount - 1) + rating;
        metrics.userRating = totalRating / metrics.usageCount;
      }

      // Save updated metrics
      this.featureMetrics.set(featureId, metrics);
    } catch (error) {
      console.error(`Error tracking feature usage for ${featureId}:`, error);
    }
  }

  /**
   * Get feature usage metrics for product analytics
   * 
   * @returns Object containing feature usage metrics
   */
  static getFeatureMetrics(): Record<string, FeatureUsage> {
    const result: Record<string, FeatureUsage> = {};
    for (const [featureId, metrics] of this.featureMetrics.entries()) {
      result[featureId] = { ...metrics };
    }
    return result;
  }

  /**
   * Calculate feature score for prioritization
   * Formula considers usage count, completion rate, recency, and user rating
   * 
   * @param featureId Feature to calculate score for
   * @returns Score between 0-100
   */
  static getFeatureScore(featureId: string): number {
    const metrics = this.featureMetrics.get(featureId);
    if (!metrics) {
      return 0;
    }

    // Calculate recency score (0-1) based on how recently the feature was used
    const daysSinceLastUsed = (new Date().getTime() - metrics.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSinceLastUsed / 30)); // 0 after 30 days

    // Usage score - normalized between 0-1 with diminishing returns
    const usageScore = Math.min(1, metrics.usageCount / 100);

    // Completion rate
    const completionScore = metrics.completionRate || 0;

    // User satisfaction
    const ratingScore = metrics.userRating ? (metrics.userRating - 1) / 4 : 0; // Normalize 1-5 to 0-1

    // Weighted score (0-100)
    const weightedScore = (
      usageScore * 0.4 +
      completionScore * 0.2 +
      recencyScore * 0.2 +
      ratingScore * 0.2
    ) * 100;

    return Math.round(weightedScore);
  }

  /**
   * Get prioritized features based on metrics
   * 
   * @returns Array of features sorted by priority score
   */
  static getPrioritizedFeatures(): { featureId: string; score: number }[] {
    const features: { featureId: string; score: number }[] = [];

    for (const featureId of this.featureMetrics.keys()) {
      features.push({
        featureId,
        score: this.getFeatureScore(featureId),
      });
    }

    // Sort by score descending
    return features.sort((a, b) => b.score - a.score);
  }

  /**
   * Reset analytics data
   * Useful for development and testing
   */
  static reset(): void {
    this.featureMetrics.clear();
    this.userSegment = null;
    console.log('[Analytics] Data reset');
  }
} 