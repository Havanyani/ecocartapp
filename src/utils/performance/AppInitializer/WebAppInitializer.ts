/**
 * WebAppInitializer.ts
 * 
 * Web-specific implementation of the AppInitializer.
 * Optimizes for web with features like:
 * - Service worker registration
 * - Web font loading with FontFace API
 * - Critical CSS optimization
 * - Core Web Vitals tracking
 */

import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import {
    AppInitializerOptions,
    AssetType,
    IAppInitializer,
    InitializationMetrics,
    InitializationStatus
} from './shared';

// Define critical web assets
const CRITICAL_CSS = [
  '/styles/critical.css'
];

const CRITICAL_IMAGES = [
  '/assets/images/eco-logo.png',
  '/assets/images/hero-mobile.jpg'
];

const CRITICAL_FONTS = [
  {
    family: 'Inter',
    url: '/assets/fonts/Inter-Regular.woff2',
    weight: '400',
    style: 'normal'
  },
  {
    family: 'Inter',
    url: '/assets/fonts/Inter-Medium.woff2',
    weight: '500',
    style: 'normal'
  },
  {
    family: 'Inter',
    url: '/assets/fonts/Inter-Bold.woff2',
    weight: '700',
    style: 'normal'
  }
];

class WebAppInitializer implements IAppInitializer {
  private static instance: WebAppInitializer;
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
    // Initialize critical resources
    CRITICAL_IMAGES.forEach(image => this.addCriticalResource(image, AssetType.IMAGE));
    CRITICAL_CSS.forEach(css => this.addCriticalResource(css, AssetType.STYLESHEET));
    CRITICAL_FONTS.forEach(font => this.addCriticalResource(font.url, AssetType.FONT));
  }

  // Get the WebAppInitializer instance (singleton)
  public static getInstance(): WebAppInitializer {
    if (!WebAppInitializer.instance) {
      WebAppInitializer.instance = new WebAppInitializer();
    }
    return WebAppInitializer.instance;
  }

  /**
   * Register service worker for caching and offline support
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.startPhase('service_worker_registration');
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service worker registered:', registration);
        this.endPhase('service_worker_registration');
      } catch (error) {
        console.error('Service worker registration failed:', error);
        this.recordError('service_worker_registration', error as Error);
      }
    }
  }

  /**
   * Load critical web fonts using FontFace API
   */
  private async loadWebFonts(): Promise<void> {
    if ('FontFace' in window) {
      try {
        this.startPhase('font_loading');
        
        const fontPromises = CRITICAL_FONTS.map(font => {
          return new Promise<void>((resolve, reject) => {
            const fontFace = new FontFace(
              font.family, 
              `url(${font.url})`,
              { 
                weight: font.weight,
                style: font.style 
              }
            );
            
            fontFace.load()
              .then(loadedFont => {
                // Add the loaded font to the document fonts
                (document.fonts as any).add(loadedFont);
                resolve();
              })
              .catch(err => {
                console.warn(`Failed to load font ${font.family}:`, err);
                resolve(); // Resolve anyway to not block other fonts
              });
          });
        });
        
        await Promise.all(fontPromises);
        this.endPhase('font_loading');
      } catch (error) {
        console.error('Font loading failed:', error);
        this.recordError('font_loading', error as Error);
      }
    }
  }

  /**
   * Preload critical assets using link preload
   */
  private async preloadCriticalAssets(): Promise<void> {
    try {
      this.startPhase('preload_critical_assets');
      
      // Create preload links for critical resources
      const preloadPromises: Promise<void>[] = [];
      
      this.criticalResources.forEach((type, url) => {
        const promise = new Promise<void>((resolve) => {
          // Don't preload if already in cache or loaded
          if (url.startsWith('data:') || url.startsWith('blob:')) {
            resolve();
            return;
          }
          
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = url;
          
          // Set appropriate 'as' attribute based on asset type
          switch (type) {
            case AssetType.IMAGE:
              link.as = 'image';
              break;
            case AssetType.FONT:
              link.as = 'font';
              link.crossOrigin = 'anonymous';
              break;
            case AssetType.STYLESHEET:
              link.as = 'style';
              break;
            case AssetType.SCRIPT:
              link.as = 'script';
              break;
          }
          
          link.onload = () => resolve();
          link.onerror = () => {
            console.warn(`Failed to preload: ${url}`);
            resolve(); // Don't reject to allow other preloads to complete
          };
          
          document.head.appendChild(link);
        });
        
        preloadPromises.push(promise);
      });
      
      await Promise.all(preloadPromises);
      this.endPhase('preload_critical_assets');
    } catch (error) {
      console.error('Critical asset preloading failed:', error);
      this.recordError('preload_critical_assets', error as Error);
    }
  }

  /**
   * Track Core Web Vitals metrics
   */
  private initWebVitalsTracking(): void {
    try {
      this.startPhase('web_vitals_tracking');
      
      // Use Performance Observer to track metrics if available
      if ('PerformanceObserver' in window) {
        // Track Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          PerformanceMonitor.recordMetric({
            name: 'LCP',
            type: 'interaction',
            timestamp: Date.now(),
            duration: lastEntry.startTime,
            component: 'WebVitals'
          });
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            PerformanceMonitor.recordMetric({
              name: 'FID',
              type: 'interaction',
              timestamp: Date.now(),
              duration: (entry as any).processingStart - entry.startTime,
              component: 'WebVitals'
            });
          });
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Track Cumulative Layout Shift (CLS)
        let cumulativeLayoutShift = 0;
        
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // Only count layout shifts without recent user input
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value;
            }
          }
          
          PerformanceMonitor.recordMetric({
            name: 'CLS',
            type: 'interaction',
            timestamp: Date.now(),
            duration: 0,
            component: 'WebVitals'
          });
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }
      
      this.endPhase('web_vitals_tracking');
    } catch (error) {
      console.error('Web vitals tracking initialization failed:', error);
      this.recordError('web_vitals_tracking', error as Error);
    }
  }

  /**
   * Initialize web-specific optimizations
   */
  private async initializeWebOptimizations(): Promise<void> {
    try {
      this.startPhase('initialize_web_optimizations');
      
      // Set up adaptive resource loading based on network conditions
      if ('connection' in navigator && (navigator as any).connection) {
        const connection = (navigator as any).connection;
        
        // If on slow connection, reduce quality of images and limit concurrent requests
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          // Set low-quality images flag
          (window as any).__ECO_CART_LOW_QUALITY = true;
          
          // Limit concurrent connections
          if ('saveData' in connection && connection.saveData === true) {
            (window as any).__ECO_CART_SAVE_DATA = true;
          }
        }
      }
      
      this.endPhase('initialize_web_optimizations');
    } catch (error) {
      console.error('Web optimizations initialization failed:', error);
      this.recordError('initialize_web_optimizations', error as Error);
    }
  }

  /**
   * Start tracking a phase of initialization
   */
  private startPhase(phase: string): void {
    this.metrics.phases[phase] = {
      startTime: performance.now(),
    };
  }

  /**
   * End tracking a phase of initialization
   */
  private endPhase(phase: string): void {
    const phaseData = this.metrics.phases[phase];
    if (phaseData) {
      phaseData.endTime = performance.now();
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
      timestamp: performance.now()
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
    this.metrics.startTime = performance.now();
    this.initializationStatus = InitializationStatus.IN_PROGRESS;
    
    const startTime = Date.now();
    const trackPerformance = options.trackPerformance !== false;
    
    // Set initialization timeout
    const timeout = options.initializationTimeout || 10000;
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Initialization timed out'));
        this.initializationStatus = InitializationStatus.TIMED_OUT;
      }, timeout);
    });
    
    // Create initialization promise
    const initWork = async () => {
      try {
        console.log('[WebAppInitializer] Starting app initialization');
        
        // Load web fonts first for better visual appearance
        if (options.preloadFonts !== false) {
          await this.loadWebFonts();
        }
        
        // Preload critical assets
        if (options.preloadImages !== false) {
          await this.preloadCriticalAssets();
        }
        
        // Start tracking web vitals
        this.initWebVitalsTracking();
        
        // Register service worker for caching (in the background)
        this.registerServiceWorker().catch(error => {
          console.warn('Service worker registration failed, continuing without it:', error);
        });
        
        // Initialize web-specific optimizations
        await this.initializeWebOptimizations();
        
        // Mark as initialized
        this.isInitialized = true;
        this.initializationStatus = InitializationStatus.COMPLETED;
        
        // Complete timing metrics
        this.metrics.endTime = performance.now();
        this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;
        
        // Record initialization metrics
        if (trackPerformance) {
          PerformanceMonitor.recordMetric({
            name: 'web_app_initialization',
            type: 'interaction',
            duration: Date.now() - startTime,
            timestamp: Date.now()
          });
        }
        
        console.log(`[WebAppInitializer] App initialization complete in ${this.metrics.totalDuration}ms`);
      } catch (error) {
        console.error('[WebAppInitializer] Initialization failed:', error);
        this.initializationStatus = InitializationStatus.FAILED;
        this.recordError('full_initialization', error as Error);
        
        // Even on error, we want to mark as initialized to prevent blocking the app
        this.isInitialized = true;
        
        // Complete timing metrics even on error
        this.metrics.endTime = performance.now();
        this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;
        
        if (trackPerformance) {
          PerformanceMonitor.recordMetric({
            name: 'web_app_initialization_error',
            type: 'interaction',
            duration: Date.now() - startTime,
            timestamp: Date.now()
          });
        }
        
        throw error;
      }
    };
    
    // Start initialization with timeout
    this.initPromise = Promise.race([initWork(), timeoutPromise])
      .catch(error => {
        console.error('[WebAppInitializer] Initialization error or timeout:', error);
        this.isInitialized = true;
      });
    
    return this.initPromise;
  }
  
  /**
   * Hide the splash screen when initialization is complete
   */
  public async hideSplashScreen(): Promise<void> {
    // Make sure initialization is complete
    await this.initialize();
    
    // For web, hide the splash screen element
    const splashElement = document.getElementById('app-splash-screen');
    if (splashElement) {
      // Add fade-out class
      splashElement.classList.add('fade-out');
      
      // Remove after animation completes
      setTimeout(() => {
        if (splashElement.parentNode) {
          splashElement.parentNode.removeChild(splashElement);
        }
      }, 500); // Match the CSS transition duration
    }
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
export const webAppInitializer = WebAppInitializer.getInstance();

export default WebAppInitializer; 