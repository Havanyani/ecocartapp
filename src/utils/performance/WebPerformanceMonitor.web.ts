/**
 * WebPerformanceMonitor.web.ts
 * 
 * Web-specific implementation of performance monitoring.
 * Tracks Web Vitals and other web-specific performance metrics.
 * Only imported in web platform builds.
 */

import { Platform } from 'react-native';
import { PerformanceMonitor } from '../PerformanceMonitoring';

// Web Vitals metrics
export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  timestamp: number;
}

interface NavigationTimingMetrics {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number;
  download: number;
  domInteractive: number;
  domComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

/**
 * Web Performance Monitor class for tracking web-specific metrics
 */
class WebPerformanceMonitorClass {
  private isInitialized = false;
  private webVitals: WebVitalMetric[] = [];
  private navigationTiming: NavigationTimingMetrics | null = null;

  constructor() {
    // Only run on web platform
    if (Platform.OS !== 'web') return;
    
    // Initialize on first load
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize the Web Performance Monitor
   */
  public init(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.setupPerformanceObservers();
    this.captureNavigationTiming();
    
    // Report initial page load to underlying performance monitor
    PerformanceMonitor.recordMetric({
      name: 'web_page_load',
      type: 'interaction',
      duration: this.getPageLoadTime(),
      timestamp: Date.now()
    });
  }

  /**
   * Set up Performance Observers to track Web Vitals
   */
  private setupPerformanceObservers(): void {
    // Only available in browser environment
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Get LCP timing
        const lcp = lastEntry.startTime;
        
        // Rate the LCP value
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
        if (lcp > 2500) {
          rating = 'needs-improvement';
        }
        if (lcp > 4000) {
          rating = 'poor';
        }
        
        this.webVitals.push({
          name: 'LCP',
          value: lcp,
          rating,
          timestamp: Date.now()
        });
        
        // Send to general performance metrics
        PerformanceMonitor.recordMetric({
          name: 'web_vital_lcp',
          type: 'interaction',
          duration: lcp,
          timestamp: Date.now(),
          component: 'WebVitals'
        });
      });
      
      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          // Calculate FID (time between user interaction and browser response)
          const fid = (entry as any).processingStart - entry.startTime;
          
          // Rate the FID value
          let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
          if (fid > 100) {
            rating = 'needs-improvement';
          }
          if (fid > 300) {
            rating = 'poor';
          }
          
          this.webVitals.push({
            name: 'FID',
            value: fid,
            rating,
            timestamp: Date.now()
          });
          
          // Send to general performance metrics
          PerformanceMonitor.recordMetric({
            name: 'web_vital_fid',
            type: 'interaction',
            duration: fid,
            timestamp: Date.now(),
            component: 'WebVitals'
          });
        });
      });
      
      // Track Cumulative Layout Shift (CLS)
      let cumulativeLayoutShift = 0;
      
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        
        // Rate the CLS value
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
        if (cumulativeLayoutShift > 0.1) {
          rating = 'needs-improvement';
        }
        if (cumulativeLayoutShift > 0.25) {
          rating = 'poor';
        }
        
        this.webVitals.push({
          name: 'CLS',
          value: cumulativeLayoutShift,
          rating,
          timestamp: Date.now()
        });
        
        // Send to general performance metrics
        PerformanceMonitor.recordMetric({
          name: 'web_vital_cls',
          type: 'interaction',
          duration: 0, // CLS doesn't have a duration
          timestamp: Date.now(),
          component: 'WebVitals'
        });
      });
      
      // Track First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            
            // Rate the FCP value
            let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
            if (fcp > 1800) {
              rating = 'needs-improvement';
            }
            if (fcp > 3000) {
              rating = 'poor';
            }
            
            this.webVitals.push({
              name: 'FCP',
              value: fcp,
              rating,
              timestamp: Date.now()
            });
            
            // Send to general performance metrics
            PerformanceMonitor.recordMetric({
              name: 'web_vital_fcp',
              type: 'interaction',
              duration: fcp,
              timestamp: Date.now(),
              component: 'WebVitals'
            });
          }
        }
      });
      
      // Start observing
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      fcpObserver.observe({ type: 'paint', buffered: true });
      
    } catch (error) {
      console.error('Error setting up performance observers:', error);
      // Record error in performance monitor
      PerformanceMonitor.captureError(error as Error);
    }
  }

  /**
   * Capture navigation timing metrics
   */
  private captureNavigationTiming(): void {
    // Only available in browser environment
    if (typeof window === 'undefined' || !('performance' in window)) return;
    
    try {
      // Wait for the page to be fully loaded
      window.addEventListener('load', () => {
        if (!performance || !performance.timing) return;
        
        // Get timing data
        const timing = performance.timing;
        
        this.navigationTiming = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ssl: timing.connectEnd - timing.secureConnectionStart,
          ttfb: timing.responseStart - timing.requestStart,
          download: timing.responseEnd - timing.responseStart,
          domInteractive: timing.domInteractive - timing.navigationStart,
          domComplete: timing.domComplete - timing.navigationStart,
          firstPaint: 0, // Will be set if available
          firstContentfulPaint: 0 // Will be set if available
        };
        
        // Try to get more precise paint timing if available
        const paintMetrics = performance.getEntriesByType('paint');
        for (const paint of paintMetrics) {
          if (paint.name === 'first-paint') {
            this.navigationTiming.firstPaint = paint.startTime;
          } else if (paint.name === 'first-contentful-paint') {
            this.navigationTiming.firstContentfulPaint = paint.startTime;
          }
        }
        
        // Record TTFB for tracking
        const ttfb = timing.responseStart - timing.navigationStart;
        
        // Rate the TTFB value
        let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
        if (ttfb > 800) {
          rating = 'needs-improvement';
        }
        if (ttfb > 1800) {
          rating = 'poor';
        }
        
        this.webVitals.push({
          name: 'TTFB',
          value: ttfb,
          rating,
          timestamp: Date.now()
        });
        
        // Send navigation timing metrics to general performance monitor
        PerformanceMonitor.recordMetric({
          name: 'navigation_timing',
          type: 'api',
          duration: timing.loadEventEnd - timing.navigationStart,
          timestamp: Date.now(),
          component: 'Navigation'
        });
      });
    } catch (error) {
      console.error('Error capturing navigation timing:', error);
      PerformanceMonitor.captureError(error as Error);
    }
  }

  /**
   * Mark the start of a custom performance measurement
   */
  public markStart(name: string): void {
    if (typeof performance === 'undefined') return;
    
    try {
      // Create a unique mark name to avoid conflicts
      const markName = `${name}_start`;
      performance.mark(markName);
    } catch (error) {
      console.error(`Error marking start for ${name}:`, error);
    }
  }

  /**
   * Mark the end of a custom performance measurement and record the duration
   */
  public markEnd(name: string): void {
    if (typeof performance === 'undefined') return;
    
    try {
      // Create a unique mark name to avoid conflicts
      const startMark = `${name}_start`;
      const endMark = `${name}_end`;
      const measureName = `${name}_measure`;
      
      // Mark the end
      performance.mark(endMark);
      
      // Measure between the marks
      performance.measure(measureName, startMark, endMark);
      
      // Get the measurement
      const entries = performance.getEntriesByName(measureName);
      const duration = entries[0]?.duration || 0;
      
      // Record the measurement
      PerformanceMonitor.recordMetric({
        name: `web_${name}`,
        type: 'interaction',
        duration,
        timestamp: Date.now(),
        component: 'Custom'
      });
      
      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
      
    } catch (error) {
      console.error(`Error marking end for ${name}:`, error);
    }
  }

  /**
   * Track a route change in single-page application
   */
  public trackRouteChange(from: string, to: string): void {
    // Mark the start of route change
    this.markStart('route_change');
    
    // Track after next frame to allow rendering to complete
    requestAnimationFrame(() => {
      this.markEnd('route_change');
      
      // Record specific route change
      PerformanceMonitor.recordMetric({
        name: `route_change_${from}_to_${to}`,
        type: 'interaction',
        duration: 0, // This will be updated when we get the measurement
        timestamp: Date.now(),
        component: 'Navigation'
      });
    });
  }

  /**
   * Get time since navigation start (approximate page load time)
   */
  private getPageLoadTime(): number {
    if (typeof performance === 'undefined') return 0;
    
    try {
      return performance.now();
    } catch (e) {
      return Date.now() - (window as any).__START_TIME__ || 0;
    }
  }

  /**
   * Get all Web Vitals metrics
   */
  public getWebVitals(): WebVitalMetric[] {
    return [...this.webVitals];
  }

  /**
   * Get navigation timing metrics
   */
  public getNavigationTiming(): NavigationTimingMetrics | null {
    return this.navigationTiming;
  }

  /**
   * Generate a complete performance report for web
   */
  public generateReport(): {
    webVitals: WebVitalMetric[];
    navigationTiming: NavigationTimingMetrics | null;
    performanceScore: number;
    recommendations: string[];
    metrics: any[];
  } {
    // Get general performance metrics from the main monitor
    const generalMetrics = PerformanceMonitor.getMetrics();
    
    // Calculate performance score based on Web Vitals
    let performanceScore = 100;
    const recommendations: string[] = [];
    
    // Analyze Web Vitals
    for (const vital of this.webVitals) {
      if (vital.rating === 'needs-improvement') {
        performanceScore -= 5;
        recommendations.push(`Improve ${vital.name} (${vital.value.toFixed(2)}ms)`);
      } else if (vital.rating === 'poor') {
        performanceScore -= 15;
        recommendations.push(`Critical: Fix ${vital.name} (${vital.value.toFixed(2)}ms)`);
      }
    }
    
    // Cap score between 0-100
    performanceScore = Math.max(0, Math.min(100, performanceScore));
    
    // Add recommendations based on score
    if (performanceScore < 50) {
      recommendations.push('Consider implementing code splitting to reduce bundle size');
      recommendations.push('Optimize images and implement lazy loading');
    }
    
    if (this.navigationTiming && this.navigationTiming.ttfb > 1000) {
      recommendations.push('Improve server response time (TTFB)');
    }
    
    return {
      webVitals: this.webVitals,
      navigationTiming: this.navigationTiming,
      performanceScore,
      recommendations,
      metrics: generalMetrics
    };
  }
}

// Create singleton instance
export const WebPerformanceMonitor = new WebPerformanceMonitorClass();

// Auto-initialize on import
WebPerformanceMonitor.init();

export default WebPerformanceMonitor; 