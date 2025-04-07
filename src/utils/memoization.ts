import React, { useCallback, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { PerformanceMonitor } from './PerformanceMonitoring';

/**
 * Creates a deeply memoized callback function that only changes
 * if any of the dependencies have changed.
 * 
 * This version also tracks performance if in development mode.
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList,
  options?: {
    trackPerformance?: boolean;
    componentName?: string;
    functionName?: string;
  }
): T {
  const { trackPerformance = __DEV__, componentName, functionName } = options || {};
  
  // Standard useCallback for memoization
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    if (!trackPerformance) {
      return callback(...args);
    }
    
    // Track performance in development
    const startTime = Date.now();
    const result = callback(...args);
    
    // For promises, track completion time
    if (result instanceof Promise) {
      result.finally(() => {
        const duration = Date.now() - startTime;
        
        InteractionManager.runAfterInteractions(() => {
          PerformanceMonitor.recordMetric({
            name: `callback_${functionName || 'anonymous'}`,
            duration,
            type: 'interaction',
            component: componentName,
            timestamp: Date.now()
          });
        });
      });
    } else {
      // For synchronous functions, track immediately
      const duration = Date.now() - startTime;
      
      InteractionManager.runAfterInteractions(() => {
        PerformanceMonitor.recordMetric({
          name: `callback_${functionName || 'anonymous'}`,
          duration,
          type: 'interaction',
          component: componentName,
          timestamp: Date.now()
        });
      });
    }
    
    return result;
  }, dependencies);
  
  return memoizedCallback as T;
}

/**
 * A utility to create a stable object reference that can be safely
 * used in dependency arrays without causing re-renders.
 */
export function useStableObject<T extends object>(obj: T): T {
  const ref = useRef<T>(obj);
  
  // Only update the reference if object properties have changed
  if (!shallowEqual(ref.current, obj)) {
    ref.current = obj;
  }
  
  return ref.current;
}

/**
 * Performs a shallow equality check between two objects.
 * Returns true if both objects have the same keys and values.
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }
  
  if (typeof objA !== 'object' || objA === null || 
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  // Test for equality of all keys
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      objA[key] !== objB[key]
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a memoized component that only re-renders when its props change.
 * This also adds optional performance tracking.
 */
export function createMemoizedComponent<P>(
  Component: React.ComponentType<P>,
  options?: {
    trackPerformance?: boolean;
    componentName?: string;
    areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;
  }
) {
  const { 
    trackPerformance = __DEV__, 
    componentName = Component.displayName || Component.name,
    areEqual
  } = options || {};
  
  // Create a performance tracking wrapper
  function PerformanceTrackedComponent(props: P) {
    if (trackPerformance) {
      const startTime = Date.now();
      const result = React.createElement(Component, props);
      
      InteractionManager.runAfterInteractions(() => {
        const duration = Date.now() - startTime;
        
        PerformanceMonitor.recordMetric({
          name: `render_${componentName}`,
          duration,
          type: 'render',
          component: componentName,
          timestamp: Date.now()
        });
      });
      
      return result;
    }
    
    return React.createElement(Component, props);
  }
  
  // Set display name for debugging
  PerformanceTrackedComponent.displayName = `Memoized(${componentName})`;
  
  // Apply memo with custom equality function if provided
  return React.memo(PerformanceTrackedComponent, areEqual);
} 