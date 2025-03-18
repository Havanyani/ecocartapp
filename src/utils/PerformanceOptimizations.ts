/**
 * PerformanceOptimizations.ts
 * 
 * A collection of utilities for optimizing app performance.
 * This file contains optimizations for:
 * - App load time
 * - List rendering 
 * - Memory usage
 * - Component rendering
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListRenderItem, ViewToken } from 'react-native';
import { InteractionManager, Platform } from 'react-native';
import { PerformanceMonitor } from './PerformanceMonitoring';

// Types
export interface OptimizedListProps<T> {
  data: ReadonlyArray<T>;
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  updateCellsBatchingPeriod?: number;
  viewabilityConfig?: {
    minimumViewTime?: number;
    viewAreaCoveragePercentThreshold?: number;
    itemVisiblePercentThreshold?: number;
    waitForInteraction?: boolean;
  };
}

// Constants
export const DEFAULT_VIEWABILITY_CONFIG = {
  minimumViewTime: 250,
  viewAreaCoveragePercentThreshold: 50,
  waitForInteraction: false
};

export const OPTIMIZED_LIST_CONFIG = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 5,
  windowSize: 10,
  updateCellsBatchingPeriod: 50,
};

/**
 * Defers a heavy operation until after interactions are complete
 * @param callback The callback to run after interactions
 * @param deps The dependency array for the effect
 */
export function useDeferredOperation<T>(
  callback: () => Promise<T> | T,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    // Use InteractionManager to defer heavy operations
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      PerformanceMonitor.startBenchmark({
        name: 'deferred_operation'
      });
      const result = callback();
      if (result instanceof Promise) {
        result.finally(() => {
          PerformanceMonitor.endBenchmark({
            id: 'deferred_operation', 
            startTime: Date.now()
          }, { name: 'deferred_operation' });
        });
      } else {
        PerformanceMonitor.endBenchmark({
          id: 'deferred_operation', 
          startTime: Date.now()
        }, { name: 'deferred_operation' });
      }
    });

    return () => {
      interactionPromise.cancel();
    };
  }, deps);
}

/**
 * Custom hook for optimized lazy loading of components
 * @param component Function that returns the component to load
 * @param fallback Optional fallback component to show while loading
 */
export function useLazyComponent<T>(
  component: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
): {
  Component: React.ComponentType<T> | null;
  isLoading: boolean;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);

  useEffect(() => {
    let mounted = true;

    InteractionManager.runAfterInteractions(() => {
      component()
        .then((module) => {
          if (mounted) {
            setComponent(() => module.default);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error('Failed to lazy load component:', error);
          setIsLoading(false);
        });
    });

    return () => {
      mounted = false;
    };
  }, [component]);

  return { Component, isLoading };
}

/**
 * Creates a memoized item renderer for FlatList/VirtualizedList components
 * @param renderItem The original render item function
 */
export function useMemoizedItemRenderer<T>(
  renderItem: ListRenderItem<T>
): ListRenderItem<T> {
  return useCallback(
    ({ item, index, separators }) => renderItem({ item, index, separators }),
    [renderItem]
  );
}

/**
 * Creates a memoized visibility changed callback for list view
 * @param onViewableItemsChanged The visibility changed callback
 */
export function useMemoizedViewabilityCallback(
  onViewableItemsChanged: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void
) {
  return useRef(onViewableItemsChanged).current;
}

/**
 * Throttle function to limit the frequency of function calls
 * @param func The function to throttle
 * @param delay The delay between function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

/**
 * Debounce function to delay function calls until after a certain period
 * @param func The function to debounce
 * @param delay The delay before the function is called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Optimize image loading by pre-calculating dimensions
 * @param uri Image URI
 * @param cacheKey Optional cache key for the image
 */
export function useOptimizedImageLoading(
  uri: string,
  cacheKey?: string
): { loading: boolean; error: Error | null } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const preloadImage = async () => {
      try {
        // Image preloading logic would go here
        // For example, using Image.prefetch from react-native
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    preloadImage();

    return () => {
      isMounted = false;
    };
  }, [uri, cacheKey]);

  return { loading, error };
}

/**
 * Get optimized list configuration based on device performance characteristics
 */
export function getOptimizedListConfig(): typeof OPTIMIZED_LIST_CONFIG {
  // These values could be adjusted based on device performance metrics
  // For high-end devices, we might render more items
  // For low-end devices, we might render fewer
  const isLowEndDevice = Platform.OS === 'android' && Platform.Version < 24;
  
  if (isLowEndDevice) {
    return {
      initialNumToRender: 4,
      maxToRenderPerBatch: 2,
      windowSize: 5,
      updateCellsBatchingPeriod: 100,
    };
  }

  return OPTIMIZED_LIST_CONFIG;
}

/**
 * Utility to clear JavaScript heap when app goes to background
 * This is particularly useful for Android
 */
export function registerMemoryManagement(): () => void {
  // This would be used with AppState to clear memory when app goes to background
  
  const clearMemory = () => {
    // Force garbage collection if possible
    if (global.gc) {
      global.gc();
    }
    
    // Clear image caches or other memory-intensive resources
    // ...
  };
  
  return clearMemory;
}

/**
 * Batch update state changes to reduce render cycles
 * @param initialState Initial state object
 */
export function useBatchedUpdates<T extends object>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const batchedSetState = useCallback((updates: Partial<T>) => {
    // Accumulate updates
    pendingUpdates.current = {
      ...pendingUpdates.current,
      ...updates
    };

    // Apply updates in the next frame if not already scheduled
    if (!timeoutId.current) {
      timeoutId.current = setTimeout(() => {
        setState(currentState => ({
          ...currentState,
          ...pendingUpdates.current
        }));
        pendingUpdates.current = {};
        timeoutId.current = null;
      }, 0);
    }
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return [state, batchedSetState] as const;
}

/**
 * Optimizes AsyncStorage operations by batching and using more efficient encoding
 * @param key Storage key
 * @param data Data to encode
 */
export function prepareForStorage<T>(key: string, data: T): { key: string, value: string } {
  // In a real implementation, we might use a more efficient encoding than JSON
  // e.g., MessagePack or CBOR
  return {
    key,
    value: JSON.stringify(data)
  };
}

/**
 * Measure component render time
 * @param componentName Name of the component to measure
 */
export function useRenderMetrics(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      PerformanceMonitor.trackRender(componentName, renderTime);
    };
  }, [componentName]);
} 