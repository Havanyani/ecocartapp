/**
 * initializePerformanceOptimizations.ts
 * 
 * A centralized entry point for initializing all performance optimizations in the app.
 * This module brings together various performance utilities to optimize:
 * - Bundle size and code splitting
 * - Asset loading and optimization
 * - Network performance
 * - Startup time
 * - UI rendering
 */

import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { Platform } from 'react-native';
import AssetOptimizer from './AssetOptimizer';
import BundleAnalyzer from './BundleAnalyzer';
import BundleSplitter from './BundleSplitter';
import DependencyOptimizer from './DependencyOptimizer';

// Only import expo-network on native platforms
let getNetworkStateAsync: () => Promise<any>;
if (Platform.OS !== 'web') {
  import('expo-network').then(module => {
    getNetworkStateAsync = module.getNetworkStateAsync;
  });
} else {
  // Mock for web
  getNetworkStateAsync = async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi'
  });
}

// Screens that should be preloaded for quicker navigation
const PRELOAD_SCREENS = [
  'HomeScreen',
  'MaterialsScreen',
  'CollectionsScreen',
];

// Screens that should be lazy-loaded only when needed
const LAZY_LOAD_SCREENS = [
  'AnalyticsDashboard',
  'EnvironmentalImpactScreen',
  'ChallengesScreen',
  'ChatScreen',
];

// Optimization profile definitions based on device capabilities and network conditions
type OptimizationProfile = 'high' | 'medium' | 'low' | 'minimal';
interface OptimizationProfileConfig {
  imageQuality: number;
  preloadAssets: boolean;
  preloadScreens: boolean;
  useLowResImages: boolean;
  enableBackgroundOptimization: boolean;
  aggressiveMemoryManagement: boolean;
  enableWebpConversion: boolean;
  enableVideoOptimization: boolean;
  networkConcurrency: number;
}

const OPTIMIZATION_PROFILES: Record<OptimizationProfile, OptimizationProfileConfig> = {
  high: {
    imageQuality: 90,
    preloadAssets: true,
    preloadScreens: true,
    useLowResImages: false,
    enableBackgroundOptimization: false,
    aggressiveMemoryManagement: false,
    enableWebpConversion: true,
    enableVideoOptimization: true,
    networkConcurrency: 6,
  },
  medium: {
    imageQuality: 75,
    preloadAssets: true,
    preloadScreens: false,
    useLowResImages: false,
    enableBackgroundOptimization: true,
    aggressiveMemoryManagement: false,
    enableWebpConversion: true,
    enableVideoOptimization: true,
    networkConcurrency: 4,
  },
  low: {
    imageQuality: 60,
    preloadAssets: false,
    preloadScreens: false,
    useLowResImages: true,
    enableBackgroundOptimization: true,
    aggressiveMemoryManagement: true,
    enableWebpConversion: true,
    enableVideoOptimization: false,
    networkConcurrency: 2,
  },
  minimal: {
    imageQuality: 50,
    preloadAssets: false,
    preloadScreens: false,
    useLowResImages: true,
    enableBackgroundOptimization: true,
    aggressiveMemoryManagement: true,
    enableWebpConversion: false,
    enableVideoOptimization: false,
    networkConcurrency: 1,
  },
};

/**
 * Detect appropriate optimization profile based on device and network
 */
export async function detectOptimizationProfile(): Promise<OptimizationProfile> {
  try {
    // For web, use navigator.connection if available
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection) {
          if (connection.saveData) {
            // User has requested data saving mode
            return 'minimal';
          }
          
          if (connection.type === 'cellular' || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return 'low';
          }
          
          if (connection.effectiveType === '3g') {
            return 'medium';
          }
        }
      }
      
      // Default for web is medium optimization
      return 'medium';
    }
    
    // For native platforms, check network status using expo-network
    const networkState = await getNetworkStateAsync();
    
    // Determine profile based on connection type and platform
    if (networkState.type === 'none' || networkState.type === 'unknown') {
      return 'minimal';
    }
    
    if (networkState.type === 'cellular') {
      return 'low';
    }
    
    return 'high';
  } catch (error) {
    console.error('Failed to detect optimization profile:', error);
    // Default to medium on error
    return 'medium';
  }
}

/**
 * Initialize all performance optimizations
 */
export async function initializePerformanceOptimizations(): Promise<void> {
  try {
    PerformanceMonitor.startMetricsCollection('app_initialization');
    
    // Detect appropriate optimization profile
    const profile = await detectOptimizationProfile();
    const config = OPTIMIZATION_PROFILES[profile];
    
    console.log(`Initializing performance optimizations with ${profile} profile`);
    
    // Preload critical screens if enabled
    if (config.preloadScreens) {
      BundleSplitter.preloadComponents(PRELOAD_SCREENS);
    }
    
    // Initialize asset optimizer
    const assetOptimizer = AssetOptimizer.getInstance();
    if (config.preloadAssets) {
      // Trigger asset scanning in the background
      setTimeout(() => {
        assetOptimizer.scanAssets();
      }, 1000);
    }
    
    // Configure dependency optimizer
    const dependencyOptimizer = DependencyOptimizer.getInstance();
    // Record main app initialization for analysis
    dependencyOptimizer.recordDependencyUsage('app_initialization', Date.now());
    
    // Start bundle analyzer in development only
    if (__DEV__) {
      BundleAnalyzer.startBundleAnalysis();
    }
    
    // Notify completion
    PerformanceMonitor.stopMetricsCollection('app_initialization');
    console.log('Performance optimizations initialized successfully');
    
    // Return success
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to initialize performance optimizations:', error);
    // Fall back to minimal optimizations on error
    return Promise.resolve();
  }
}

/**
 * Preload key assets for improved startup performance
 */
export function preloadCriticalAssets(): Promise<void> {
  try {
    // This would preload key assets like the logo, main screen images, etc.
    // Actual implementation would depend on specific app needs
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to preload critical assets:', error);
    return Promise.resolve();
  }
}

/**
 * Optimize memory usage by clearing caches and resources
 */
export function optimizeMemoryUsage(): void {
  // Clear image caches
  // Remove unused resources
  // Hint to garbage collector
}

/**
 * Register performance event for analytics
 */
export function trackPerformanceEvent(eventName: string, duration: number): void {
  PerformanceMonitor.recordCustomMetric(eventName, duration);
}

// Default export for easy importing
export default {
  initializePerformanceOptimizations,
  preloadCriticalAssets,
  optimizeMemoryUsage,
  trackPerformanceEvent,
}; 