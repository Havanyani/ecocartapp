/**
 * MobileAppInitializer.ts
 * 
 * Mobile-specific implementation of the AppInitializer.
 * Optimizes for mobile with features like:
 * - Native asset loading with Expo-Asset
 * - Font preloading with Expo-Font
 * - Splash screen management
 */

import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { initializePerformanceOptimizations } from '../initializePerformanceOptimizations';
import {
    AppInitializerOptions,
    AssetType,
    IAppInitializer,
    InitializationMetrics,
    InitializationStatus
} from './shared';

// Keep the splash screen visible while we initialize
SplashScreen.preventAutoHideAsync().catch(() => {
  // If this fails, it's not critical
  console.warn('Failed to prevent auto hide of splash screen');
});

// Define critical assets that should be preloaded
const CRITICAL_IMAGES = [
  require('@/assets/images/eco-logo.png'),
  require('@/assets/images/splash-icon.png'),
];

// Define critical fonts that should be preloaded
const CRITICAL_FONTS = {
  'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
};

class MobileAppInitializer implements IAppInitializer {
  private static instance: MobileAppInitializer;
  private initializationStatus: InitializationStatus = InitializationStatus.NOT_STARTED;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private criticalResources: Map<string, AssetType> = new Map();
  private metrics: InitializationMetrics = {
    startTime: 0,
    phases: {},
    errors: []
  };

  // Private constructor for singleton pattern
  private constructor() {
    // Add critical resources to the list
    CRITICAL_IMAGES.forEach((image, index) => {
      this.addCriticalResource(`image_${index}`, AssetType.IMAGE);
    });
    
    Object.keys(CRITICAL_FONTS).forEach(fontName => {
      this.addCriticalResource(fontName, AssetType.FONT);
    });
  }

  // Get the MobileAppInitializer instance (singleton)
  public static getInstance(): MobileAppInitializer {
    if (!MobileAppInitializer.instance) {
      MobileAppInitializer.instance = new MobileAppInitializer();
    }
    return MobileAppInitializer.instance;
  }

  /**
   * Preload critical assets for immediate rendering
   */
  private async preloadCriticalAssets(): Promise<void> {
    try {
      this.startPhase('preload_critical_assets');
      
      // Preload fonts
      await Font.loadAsync(CRITICAL_FONTS);
      
      // Preload essential images
      const imageAssets = CRITICAL_IMAGES.map(image => {
        if (typeof image === 'string') {
          return Asset.fromURI(image).downloadAsync();
        } else {
          return Asset.fromModule(image).downloadAsync();
        }
      });
      
      await Promise.all(imageAssets);
      
      this.endPhase('preload_critical_assets');
    } catch (error) {
      console.error('Critical asset preloading failed:', error);
      this.recordError('preload_critical_assets', error as Error);
    }
  }

  /**
   * Initialize performance settings based on device capabilities
   */
  private async initializeOptimizations(): Promise<void> {
    try {
      this.startPhase('initialize_optimizations');
      
      // Initialize performance optimizations with appropriate profile
      await initializePerformanceOptimizations();
      
      this.endPhase('initialize_optimizations');
    } catch (error) {
      console.error('Performance optimizations initialization failed:', error);
      this.recordError('initialize_optimizations', error as Error);
    }
  }

  /**
   * Start tracking a phase of initialization
   */
  private startPhase(phase: string): void {
    this.metrics.phases[phase] = {
      startTime: Date.now(),
    };
  }

  /**
   * End tracking a phase of initialization
   */
  private endPhase(phase: string): void {
    const phaseData = this.metrics.phases[phase];
    if (phaseData) {
      phaseData.endTime = Date.now();
      phaseData.duration = phaseData.endTime - phaseData.startTime;
    }
  }

  /**
   * Record an error during initialization
   */
  private recordError(phase: string, error: Error): void {
    this.metrics.errors.push({
      phase,
      error,
      timestamp: Date.now()
    });
  }

  /**
   * Add a resource to preload during initialization
   */
  public addCriticalResource(resource: string, type: AssetType): void {
    this.criticalResources.set(resource, type);
  }

  /**
   * Initialize the app with required resources and configurations
   */
  public async initialize(options: AppInitializerOptions = {}): Promise<void> {
    // If already initialized or initializing, return existing promise
    if (this.isInitialized) {
      return Promise.resolve();
    }
    
    if (this.initPromise) {
      return this.initPromise;
    }
    
    // Start timing full initialization
    this.metrics.startTime = Date.now();
    this.initializationStatus = InitializationStatus.IN_PROGRESS;
    
    const startTime = Date.now();
    const trackPerformance = options.trackPerformance !== false;
    
    // Create initialization promise
    this.initPromise = (async () => {
      try {
        console.log('[MobileAppInitializer] Starting app initialization');
        
        // Preload critical assets first for faster perceived load time
        if (options.preloadImages !== false && options.preloadFonts !== false) {
          await this.preloadCriticalAssets();
        } else {
          if (options.preloadImages !== false) {
            // Preload only images
            const imageAssets = CRITICAL_IMAGES.map(image => {
              if (typeof image === 'string') {
                return Asset.fromURI(image).downloadAsync();
              } else {
                return Asset.fromModule(image).downloadAsync();
              }
            });
            
            await Promise.all(imageAssets);
          }
          
          if (options.preloadFonts !== false) {
            // Preload only fonts
            await Font.loadAsync(CRITICAL_FONTS);
          }
        }
        
        // Initialize performance optimizations
        if (options.optimizationLevel !== 'minimal') {
          await this.initializeOptimizations();
        }
        
        // Mark as initialized
        this.isInitialized = true;
        this.initializationStatus = InitializationStatus.COMPLETED;
        
        // Complete timing metrics
        this.metrics.endTime = Date.now();
        this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;
        
        // Record initialization metrics
        if (trackPerformance) {
          PerformanceMonitor.recordMetric({
            name: 'app_full_initialization',
            type: 'interaction',
            duration: Date.now() - startTime,
            timestamp: Date.now()
          });
        }
        
        console.log(`[MobileAppInitializer] App initialization complete in ${this.metrics.totalDuration}ms`);
      } catch (error) {
        console.error('[MobileAppInitializer] Initialization failed:', error);
        this.initializationStatus = InitializationStatus.FAILED;
        this.recordError('full_initialization', error as Error);
        
        // Even on error, we want to proceed with the app, so we still mark as initialized
        this.isInitialized = true;
        
        // Complete timing metrics even on error
        this.metrics.endTime = Date.now();
        this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;
        
        if (trackPerformance) {
          PerformanceMonitor.recordMetric({
            name: 'app_full_initialization_error',
            type: 'interaction',
            duration: Date.now() - startTime,
            timestamp: Date.now()
          });
        }
      }
    })();
    
    return this.initPromise;
  }
  
  /**
   * Hide the splash screen when initialization is complete
   */
  public async hideSplashScreen(): Promise<void> {
    // Make sure initialization is complete
    await this.initialize();
    
    // Hide the splash screen with a slight delay to ensure smooth transition
    await new Promise(resolve => setTimeout(resolve, 100));
    await SplashScreen.hideAsync().catch(error => {
      console.warn('Failed to hide splash screen:', error);
    });
  }
  
  /**
   * Check if the app has been initialized
   */
  public isAppInitialized(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Get the current initialization status
   */
  public getInitializationStatus(): InitializationStatus {
    return this.initializationStatus;
  }
  
  /**
   * Get initialization metrics for performance tracking
   */
  public getInitializationMetrics(): InitializationMetrics {
    return this.metrics;
  }
}

// Export singleton instance
export const mobileAppInitializer = MobileAppInitializer.getInstance();

export default MobileAppInitializer; 