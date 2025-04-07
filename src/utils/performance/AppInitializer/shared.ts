/**
 * AppInitializer/shared.ts
 * 
 * Shared types and interfaces for the AppInitializer component.
 * Used by both mobile and web implementations.
 */

/**
 * Initialization options for the AppInitializer
 */
export interface AppInitializerOptions {
  /**
   * Whether to preload fonts
   * @default true
   */
  preloadFonts?: boolean;

  /**
   * Whether to preload images
   * @default true
   */
  preloadImages?: boolean;

  /**
   * Whether to preload configuration
   * @default true
   */
  preloadConfig?: boolean;

  /**
   * Timeout in milliseconds before initialization is considered failed
   * @default 10000 (10 seconds)
   */
  initializationTimeout?: number;

  /**
   * Whether to track performance metrics during initialization
   * @default true
   */
  trackPerformance?: boolean;

  /**
   * List of critical resources to preload
   * @default []
   */
  criticalResources?: string[];

  /**
   * Initial optimization level
   * @default 'balanced'
   */
  optimizationLevel?: 'minimal' | 'balanced' | 'aggressive';
}

/**
 * Status of initialization process
 */
export enum InitializationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMED_OUT = 'timed_out'
}

/**
 * Initialization metrics tracked during app startup
 */
export interface InitializationMetrics {
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  phases: {
    [phase: string]: {
      startTime: number;
      endTime?: number;
      duration?: number;
    }
  };
  errors: Array<{
    phase: string;
    error: Error;
    timestamp: number;
  }>;
}

/**
 * Asset types that can be preloaded
 */
export enum AssetType {
  IMAGE = 'image',
  FONT = 'font',
  CONFIGURATION = 'configuration',
  TRANSLATION = 'translation',
  STYLESHEET = 'stylesheet',
  SCRIPT = 'script'
}

/**
 * Interface for the AppInitializer service
 */
export interface IAppInitializer {
  /**
   * Initialize the app with required resources and configurations
   */
  initialize(options?: AppInitializerOptions): Promise<void>;
  
  /**
   * Hide the splash screen once initialization is complete
   */
  hideSplashScreen(): Promise<void>;

  /**
   * Check if the app is initialized
   */
  isAppInitialized(): boolean;

  /**
   * Get the current initialization status
   */
  getInitializationStatus(): InitializationStatus;

  /**
   * Get initialization metrics for performance tracking
   */
  getInitializationMetrics(): InitializationMetrics;

  /**
   * Add a resource to preload during initialization
   */
  addCriticalResource(resource: string, type: AssetType): void;
} 