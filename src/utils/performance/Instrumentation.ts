import aiPerformanceMonitor, { MetricType } from './AIPerformanceMonitor';

/**
 * Wraps a function with performance monitoring
 * @param fn The function to instrument
 * @param metricType The type of metric to record
 * @param metricName Optional custom name for the metric (defaults to function name)
 * @returns The instrumented function with the same signature
 */
export function instrument<T extends (...args: any[]) => any>(
  fn: T,
  metricType: MetricType,
  metricName?: string
): T {
  const wrappedFunction = function (this: any, ...args: any[]) {
    const startTime = performance.now();
    let result;
    
    try {
      result = fn.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          aiPerformanceMonitor.recordMetric(metricType, duration, metricName || fn.name);
        });
      }
      
      return result;
    } finally {
      if (!(result instanceof Promise)) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        aiPerformanceMonitor.recordMetric(metricType, duration, metricName || fn.name);
      }
    }
  };
  
  return wrappedFunction as T;
}

/**
 * Creates an instrumentation context for measuring code block performance
 * @param metricType The type of metric to record
 * @param metricName Name for the metric
 * @returns An object with start and end methods to control measurement
 */
export function createInstrumentationContext(metricType: MetricType, metricName: string) {
  let startTime = 0;
  
  return {
    start: () => {
      startTime = performance.now();
      return startTime;
    },
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      aiPerformanceMonitor.recordMetric(metricType, duration, metricName);
      return duration;
    },
    measure: <T>(callback: () => T): T => {
      startTime = performance.now();
      try {
        return callback();
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        aiPerformanceMonitor.recordMetric(metricType, duration, metricName);
      }
    },
    measureAsync: async <T>(callback: () => Promise<T>): Promise<T> => {
      startTime = performance.now();
      try {
        return await callback();
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        aiPerformanceMonitor.recordMetric(metricType, duration, metricName);
      }
    }
  };
}

/**
 * Records memory usage at the current point
 * @param label Optional label for the memory snapshot
 */
export function recordMemoryUsage(label?: string) {
  if (typeof global.performance !== 'undefined' && 
      typeof global.performance.memory !== 'undefined') {
    // Web-like environment with memory info
    const memoryInfo = global.performance.memory;
    const usedJSHeapSize = memoryInfo.usedJSHeapSize / (1024 * 1024); // Convert to MB
    aiPerformanceMonitor.recordMetric('memory_usage', usedJSHeapSize, label);
    return usedJSHeapSize;
  } else {
    // React Native environment - use a rough estimate
    // This is not accurate but can show relative changes
    try {
      // Force garbage collection if possible (this is environment dependent)
      if (global.gc) {
        global.gc();
      }
    } catch (e) {
      // Ignore - GC not available
    }
    
    const memoryEstimate = process.memoryUsage?.() || { heapUsed: 0 };
    const memoryUsageMB = memoryEstimate.heapUsed / (1024 * 1024); // Convert to MB
    aiPerformanceMonitor.recordMetric('memory_usage', memoryUsageMB, label);
    return memoryUsageMB;
  }
}

/**
 * Decorator for class methods to add performance monitoring
 * Usage: @instrumentMethod('cache_lookup')
 */
export function instrumentMethod(metricType: MetricType, metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.finally(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            aiPerformanceMonitor.recordMetric(
              metricType, 
              duration, 
              metricName || `${target.constructor.name}.${propertyKey}`
            );
          });
        }
        
        return result;
      } finally {
        if (!(arguments[0] instanceof Promise)) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          aiPerformanceMonitor.recordMetric(
            metricType, 
            duration, 
            metricName || `${target.constructor.name}.${propertyKey}`
          );
        }
      }
    };
    
    return descriptor;
  };
}

export default {
  instrument,
  createInstrumentationContext,
  recordMemoryUsage,
  instrumentMethod
}; 