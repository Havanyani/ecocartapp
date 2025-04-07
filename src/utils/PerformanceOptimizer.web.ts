/**
 * Web-specific mock for PerformanceOptimizer
 * Provides a simplified implementation for browsers
 */

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private initialized: boolean = false;
  private optimizationLevel: number = 0;

  // Settings with reasonable defaults for web
  private settings = {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableImageCaching: false, // Not available in web
    enableNetworkOptimizations: true,
    lowMemoryMode: false,
    batteryOptimizationEnabled: false,
  };

  private constructor() {
    console.log('PerformanceOptimizer initialized in web environment (limited functionality)');
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Code splitting enabled for web platform');
      
      // We can't use native file system in web, so log a warning
      console.warn('Failed to setup image cache: UnavailabilityError: The method or property expo-file-system.getInfoAsync is not available on web');
      
      // Initialize performance monitoring using Web Performance API
      this.setupPerformanceMonitoring();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PerformanceOptimizer:', error);
    }
  }

  setupImageCache(): void {
    // Not supported in web, but implementation stub to prevent errors
    console.warn('Image cache not available in web environment');
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Use Web Performance API to monitor render and load times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 16) { // 60fps threshold
            console.log(`Performance: Slow ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'paint', 'resource'] });
    }
  }

  // Web implementation doesn't need to free memory aggressively
  reduceMemoryUsage(): void {
    console.log('Memory optimization requested (no-op in web)');
  }

  // Simplified version for web - browsers handle their own power optimizations
  optimizeForBatteryLevel(level: number): void {
    console.log(`Battery optimization requested with level ${level} (no-op in web)`);
  }

  // Allow changing optimization level (mainly for UI toggles)
  setOptimizationLevel(level: number): void {
    this.optimizationLevel = Math.max(0, Math.min(3, level));
    console.log(`Set optimization level to ${this.optimizationLevel}`);
  }

  // Get current settings
  getSettings(): Record<string, any> {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings: Partial<Record<string, any>>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Updated performance settings', this.settings);
  }
}

// Export the singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

export default PerformanceOptimizer; 