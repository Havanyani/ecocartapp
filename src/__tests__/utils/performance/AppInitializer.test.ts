import { appInitializer } from '@/utils/performance/AppInitializer';
import { initializePerformanceOptimizations } from '@/utils/performance/initializePerformanceOptimizations';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Mock dependencies
jest.mock('@/utils/PerformanceMonitoring', () => ({
  PerformanceMonitor: {
    startMetricsCollection: jest.fn(),
    stopMetricsCollection: jest.fn(),
    recordMetric: jest.fn(),
    captureError: jest.fn(),
  },
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromURI: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
    }),
    fromModule: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@/utils/performance/initializePerformanceOptimizations', () => ({
  initializePerformanceOptimizations: jest.fn().mockResolvedValue(undefined),
}));

describe('AppInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the instance state by accessing a private property (for testing only)
    // @ts-ignore - accessing private property for test purposes
    appInitializer.isInitialized = false;
    // @ts-ignore - accessing private property for test purposes
    appInitializer.initPromise = null;
  });

  it('should be a singleton', () => {
    expect(appInitializer).toBeDefined();
    
    // Getting the instance again should return the same instance
    // @ts-ignore - accessing private property for test purposes
    const AppInitializer = appInitializer.constructor;
    // @ts-ignore - accessing private static method for test purposes
    const instance1 = AppInitializer.getInstance();
    expect(instance1).toBe(appInitializer);
  });

  describe('initialize', () => {
    it('should initialize app resources', async () => {
      await appInitializer.initialize();
      
      // Verify performance monitoring was started and stopped
      expect(PerformanceMonitor.startMetricsCollection).toHaveBeenCalledWith('app_full_initialization');
      expect(PerformanceMonitor.startMetricsCollection).toHaveBeenCalledWith('preload_critical_assets');
      expect(PerformanceMonitor.stopMetricsCollection).toHaveBeenCalledWith('preload_critical_assets');
      expect(PerformanceMonitor.stopMetricsCollection).toHaveBeenCalledWith('app_full_initialization');
      
      // Verify assets were preloaded
      expect(Font.loadAsync).toHaveBeenCalled();
      expect(Asset.fromModule).toHaveBeenCalled();
      
      // Verify optimizations were initialized
      expect(initializePerformanceOptimizations).toHaveBeenCalled();
    });

    it('should return the same promise if already initializing', async () => {
      // Start initializing
      const promise1 = appInitializer.initialize();
      // Call initialize again while still initializing
      const promise2 = appInitializer.initialize();
      
      // Should return the same promise
      expect(promise1).toBe(promise2);
      
      // Complete initialization
      await promise1;
    });

    it('should return immediately if already initialized', async () => {
      // Initialize
      await appInitializer.initialize();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call initialize again
      await appInitializer.initialize();
      
      // Should not initialize resources again
      expect(Font.loadAsync).not.toHaveBeenCalled();
      expect(Asset.fromModule).not.toHaveBeenCalled();
      expect(initializePerformanceOptimizations).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock Font.loadAsync to throw an error
      (Font.loadAsync as jest.Mock).mockRejectedValueOnce(new Error('Font loading error'));
      
      // Initialize should not throw
      await expect(appInitializer.initialize()).resolves.not.toThrow();
      
      // Should still be marked as initialized
      expect(appInitializer.isAppInitialized()).toBe(true);
    });
  });

  describe('hideSplashScreen', () => {
    it('should hide the splash screen after initialization', async () => {
      await appInitializer.hideSplashScreen();
      
      // Verify initialize was called
      expect(initializePerformanceOptimizations).toHaveBeenCalled();
      
      // Verify splash screen was hidden
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  describe('isAppInitialized', () => {
    it('should return false before initialization', () => {
      expect(appInitializer.isAppInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await appInitializer.initialize();
      expect(appInitializer.isAppInitialized()).toBe(true);
    });
  });
}); 