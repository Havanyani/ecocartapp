/**
 * WebPerformanceService.web.ts
 * 
 * Web-specific service for integrating performance monitoring with React Navigation.
 * Tracks route changes and performance metrics for web builds.
 */

import { WebPerformanceMonitor } from '@/utils/performance/WebPerformanceMonitor.web';
import type { NavigationContainerRef } from '@react-navigation/native';
import { Platform } from 'react-native';

/**
 * Service for managing web performance tracking
 */
class WebPerformanceService {
  private isInitialized = false;
  private navigationRef: NavigationContainerRef<any> | null = null;
  private currentRoute = '';

  /**
   * Initialize the web performance service
   */
  public init(): void {
    // Only run on web platform
    if (Platform.OS !== 'web') return;
    
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    // Register necessary event listeners
    this.registerEventListeners();
  }

  /**
   * Register the React Navigation container
   */
  public registerNavigationContainer(ref: NavigationContainerRef<any>): void {
    // Only run on web platform
    if (Platform.OS !== 'web') return;
    
    this.navigationRef = ref;
    
    // Listen for navigation state changes
    if (ref) {
      ref.addListener('state', this.handleNavigationStateChange);
    }
  }

  /**
   * Handle navigation state changes to track route performance
   */
  private handleNavigationStateChange = (): void => {
    if (!this.navigationRef) return;
    
    try {
      const previousRoute = this.currentRoute;
      const currentRoute = this.navigationRef.getCurrentRoute()?.name || '';
      
      if (previousRoute && currentRoute && previousRoute !== currentRoute) {
        // Track the route change in the web performance monitor
        WebPerformanceMonitor.trackRouteChange(previousRoute, currentRoute);
      }
      
      this.currentRoute = currentRoute;
    } catch (error) {
      console.error('Error tracking navigation state change:', error);
    }
  };

  /**
   * Register browser event listeners for performance tracking
   */
  private registerEventListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        WebPerformanceMonitor.markStart('app_visible');
      } else {
        WebPerformanceMonitor.markEnd('app_visible');
      }
    });
    
    // Track user interactions
    const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {
        WebPerformanceMonitor.markStart(`interaction_${eventType}`);
        
        // Use requestAnimationFrame to measure time to next render
        requestAnimationFrame(() => {
          WebPerformanceMonitor.markEnd(`interaction_${eventType}`);
        });
      }, { passive: true });
    });
    
    // Track page load completion
    window.addEventListener('load', () => {
      WebPerformanceMonitor.markEnd('page_load');
    });
  }

  /**
   * Clean up event listeners and references
   */
  public cleanup(): void {
    if (this.navigationRef) {
      this.navigationRef.removeListener('state', this.handleNavigationStateChange);
      this.navigationRef = null;
    }
  }

  /**
   * Record an error in the performance monitoring system
   * @param error The error to record
   */
  public static recordError(error: Error): void {
    // Record the error in the console for now
    console.error('Performance monitoring error:', error);

    // If browser supports performance API, mark the error in the timeline
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`error_${Date.now()}`);
      
      // If error reporting is available, send it there
      if (typeof window !== 'undefined' && window.onerror) {
        const errorMsg = error.message || 'Unknown performance monitoring error';
        const errorFile = 'WebPerformanceService.web.ts';
        const errorLine = 0;
        const errorCol = 0;
        window.onerror(errorMsg, errorFile, errorLine, errorCol, error);
      }
    }
  }
}

// Create singleton instance
export const webPerformanceService = new WebPerformanceService();

// Auto-initialize on import
webPerformanceService.init();

export default webPerformanceService; 