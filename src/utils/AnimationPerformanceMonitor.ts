/**
 * AnimationPerformanceMonitor.ts
 * 
 * Utility to monitor animation performance and help diagnose animation issues.
 */
import { InteractionManager, Platform } from 'react-native';
// Import PerformanceMonitor or create a simple implementation
// import { PerformanceMonitor } from './PerformanceMonitoring';

// Simple performance event recorder implementation
class SimplePerformanceMonitor {
  recordEvent(eventName: string, data: Record<string, any>): void {
    console.log(`[Performance] ${eventName}:`, data);
  }
}

// Animation tracking interface
interface AnimationTracker {
  id: string;
  startTime: number;
  isComplete: boolean;
  nativeDriver: boolean;
  duration: number;
}

class AnimationPerformanceMonitor {
  private animations: Map<string, AnimationTracker> = new Map();
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  // Use our simple implementation instead
  private performanceMonitor = new SimplePerformanceMonitor();
  
  /**
   * Start tracking an animation
   * 
   * @param id Unique identifier for the animation
   * @param duration Expected duration in ms
   * @param useNativeDriver Whether the animation uses native driver
   * @returns A function to call when the animation completes
   */
  trackAnimation(id: string, duration: number, useNativeDriver: boolean): () => void {
    // Create a tracker for this animation
    const tracker: AnimationTracker = {
      id,
      startTime: Date.now(),
      isComplete: false,
      nativeDriver: useNativeDriver,
      duration,
    };
    
    this.animations.set(id, tracker);
    
    // Start monitoring if not already
    this.startMonitoring();
    
    // Return completion function
    return () => this.completeAnimation(id);
  }
  
  /**
   * Create an animation ID based on component and animation type
   * This was previously a static method but needs to be an instance method
   * to be accessible from the AnimationMonitor instance
   */
  createAnimationId(componentName: string, animationType: string): string {
    return `${componentName}_${animationType}_${Date.now().toString(36)}`;
  }
  
  /**
   * Mark an animation as completed
   * 
   * @param id The animation id
   */
  private completeAnimation(id: string): void {
    const tracker = this.animations.get(id);
    if (tracker) {
      tracker.isComplete = true;
      
      // Calculate actual duration
      const actualDuration = Date.now() - tracker.startTime;
      
      // Report performance if significantly different from expected
      if (actualDuration > tracker.duration * 1.5) {
        this.reportPerformanceIssue(tracker, actualDuration);
      }
      
      // Remove completed animations after a short delay
      setTimeout(() => {
        this.animations.delete(id);
        
        // Stop monitoring if no more animations
        if (this.animations.size === 0) {
          this.stopMonitoring();
        }
      }, 1000);
    }
  }
  
  /**
   * Start the monitoring interval
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => this.checkAnimations(), 1000);
  }
  
  /**
   * Stop the monitoring interval
   */
  private stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.isMonitoring = false;
  }
  
  /**
   * Check for animations that may be stuck
   */
  private checkAnimations(): void {
    const now = Date.now();
    
    this.animations.forEach((tracker, id) => {
      if (!tracker.isComplete) {
        const runningTime = now - tracker.startTime;
        
        // If animation has been running 3x longer than expected
        if (runningTime > tracker.duration * 3) {
          this.reportStuckAnimation(tracker, runningTime);
          this.animations.delete(id);
        }
      }
    });
  }
  
  /**
   * Report a performance issue with an animation
   */
  private reportPerformanceIssue(tracker: AnimationTracker, actualDuration: number): void {
    console.warn(`[Animation Performance] Animation ${tracker.id} took ${actualDuration}ms (expected ${tracker.duration}ms)`);
    
    if (Platform.OS === 'android' && !tracker.nativeDriver) {
      console.warn('[Animation Performance] Consider using useNativeDriver: true for better performance on Android');
    }
    
    this.performanceMonitor.recordEvent('animation_performance_issue', {
      animationId: tracker.id,
      expected: tracker.duration,
      actual: actualDuration,
      nativeDriver: tracker.nativeDriver,
      platform: Platform.OS,
    });
    
    // Schedule work after animations complete
    InteractionManager.runAfterInteractions(() => {
      // Check if UI is responsive after animation
      const checkTime = Date.now();
      
      setTimeout(() => {
        const responseTime = Date.now() - checkTime;
        if (responseTime > 100) {
          console.warn(`[Animation Performance] UI thread blocked for ${responseTime}ms after animation`);
        }
      }, 5);
    });
  }
  
  /**
   * Report a stuck animation
   */
  private reportStuckAnimation(tracker: AnimationTracker, runningTime: number): void {
    console.error(`[Animation Performance] Animation ${tracker.id} appears to be stuck (running for ${runningTime}ms)`);
    
    this.performanceMonitor.recordEvent('animation_stuck', {
      animationId: tracker.id,
      expected: tracker.duration,
      runningTime,
      nativeDriver: tracker.nativeDriver,
      platform: Platform.OS,
    });
  }
}

// Singleton instance
export const AnimationMonitor = new AnimationPerformanceMonitor(); 