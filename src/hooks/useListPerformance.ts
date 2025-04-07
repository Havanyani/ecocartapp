import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatListProps, LayoutAnimation, Platform } from 'react-native';

// Extend the Metric type to support metadata
type ExtendedMetric = Parameters<typeof PerformanceMonitor.recordMetric>[0] & {
  metadata?: Record<string, any>;
};

/**
 * Configuration options for list performance optimization
 */
interface ListPerformanceOptions<T> {
  /** The name of the component (for performance tracking) */
  componentName?: string;
  
  /** Unique identifier for the list (for performance tracking) */
  listId?: string;
  
  /** The data array to render */
  data?: T[];
  
  /** The number of items in the list (alternative to providing data) */
  itemCount?: number;
  
  /** Estimate of the height of each item */
  itemHeight?: number;
  
  /** Number of items to render initially (default: calculated from screen size) */
  initialNumToRender?: number;
  
  /** Maximum number of items to render in each batch (default: 10) */
  maxToRenderPerBatch?: number;
  
  /** How far from the edge to trigger batch rendering (default: 0.5 - half a screen) */
  windowSize?: number;
  
  /** Whether to remove invisible items from native view hierarchy (default: true) */
  removeClippedSubviews?: boolean;
  
  /** Time to wait between batches of rendered items (default: 50ms) */
  updateCellsBatchingPeriod?: number;
  
  /** Whether to enable performance tracking (default: true in development) */
  trackPerformance?: boolean;
  
  /** Whether to optimize for memory usage (for very large lists) */
  optimizeForMemory?: boolean;
}

/**
 * Return value from useListPerformance hook
 */
interface ListPerformanceResult<T> {
  /** Optimized FlatList props */
  listProps: Partial<FlatListProps<T>>;
  
  /** Alternative way to access optimized props for VirtualizedList */
  optimizedProps: {
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    windowSize: number;
    updateCellsBatchingPeriod: number;
    removeClippedSubviews: boolean;
  };
  
  /** Whether the list is being optimized */
  isOptimized: boolean;
  
  /** Performance statistics */
  stats: {
    /** Average render time per item in ms */
    averageRenderTime: number;
    
    /** Total number of items rendered */
    renderedItems: number;
    
    /** Number of items in the data set */
    totalItems: number;
  };
  
  /** Manual trigger to measure performance again */
  measurePerformance: () => void;
  
  /** Function to track render time of an individual item */
  trackItemRender: (index: number, renderTime: number) => void;
  
  /** Function to track render time of the entire list */
  trackListRender: (renderTime: number) => void;
}

/**
 * A hook for optimizing the performance of lists with automatic virtualization
 * 
 * Features:
 * - Automatically calculates optimal FlatList configuration based on device capabilities
 * - Tracks render performance and adjusts settings accordingly
 * - Provides optimized props for FlatList
 * - Supports fixed-height optimization with getItemLayout
 */
export function useListPerformance<T>(
  options: ListPerformanceOptions<T>
): ListPerformanceResult<T> {
  const {
    componentName,
    listId,
    data = [],
    itemCount: itemCountProp,
    itemHeight,
    initialNumToRender: initialNumToRenderProp,
    maxToRenderPerBatch: maxToRenderPerBatchProp,
    windowSize: windowSizeProp,
    removeClippedSubviews: removeClippedSubviewsProp,
    updateCellsBatchingPeriod: updateCellsBatchingPeriodProp,
    trackPerformance = __DEV__,
    optimizeForMemory = false
  } = options;
  
  // Use either provided itemCount or data length
  const itemCount = itemCountProp ?? data.length;
  
  // Keep track of render times for performance analysis
  const renderTimes = useRef<number[]>([]);
  const [averageRenderTime, setAverageRenderTime] = useState(0);
  const dataLengthRef = useRef(itemCount);
  
  // Track if this is a high-performance list
  const isLargeList = itemCount > 50;
  
  // Derived configuration values based on performance measurements
  const needsOptimization = isLargeList || averageRenderTime > 16 || optimizeForMemory;
  
  // Default values, optimized for performance
  const initialNumToRender = initialNumToRenderProp ?? (needsOptimization ? 10 : 20);
  const maxToRenderPerBatch = maxToRenderPerBatchProp ?? (needsOptimization ? 5 : 10);
  const windowSize = windowSizeProp ?? (needsOptimization ? 5 : 21);
  const removeClippedSubviews = removeClippedSubviewsProp ?? (Platform.OS !== 'web' && needsOptimization);
  const updateCellsBatchingPeriod = updateCellsBatchingPeriodProp ?? (needsOptimization ? 50 : 30);
  
  // Create a properly typed getItemLayout function when itemHeight is provided
  const calculatedGetItemLayout = itemHeight
    ? ((_data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }))
    : undefined;
  
  // Track individual item renders
  const trackItemRender = useCallback((index: number, renderTime: number) => {
    if (!trackPerformance) return;
    
    // Record the render time
    renderTimes.current.push(renderTime);
    
    // Only keep the last 20 measurements
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift();
    }
    
    // Report metrics if time is high
    if (renderTime > 16) { // 16ms = target for 60fps
      PerformanceMonitor.recordMetric({
        name: `item_render_${componentName || listId}`,
        duration: renderTime,
        type: 'render',
        component: componentName || `List_${listId}_Item_${index}`,
        timestamp: Date.now()
      } as ExtendedMetric);
    }
  }, [trackPerformance, componentName, listId]);
  
  // Track whole list renders
  const trackListRender = useCallback((renderTime: number) => {
    if (!trackPerformance) return;
    
    PerformanceMonitor.recordMetric({
      name: `list_render_${componentName || listId}`,
      duration: renderTime,
      type: 'render',
      component: componentName || `List_${listId}`,
      timestamp: Date.now()
    } as ExtendedMetric);
  }, [trackPerformance, componentName, listId]);
  
  // Handle measuring performance
  const measurePerformance = useCallback(() => {
    if (!trackPerformance) return;
    
    const total = renderTimes.current.reduce((sum, time) => sum + time, 0);
    const avg = renderTimes.current.length > 0 ? total / renderTimes.current.length : 0;
    
    setAverageRenderTime(avg);
    
    // Report metrics if average is high
    if (avg > 16) {
      PerformanceMonitor.recordMetric({
        name: `slow_list_render_${componentName || listId}`,
        duration: avg,
        type: 'render',
        component: componentName || `List_${listId}`,
        timestamp: Date.now()
      });
    }
  }, [trackPerformance, componentName, listId]);
  
  // Track render performance
  useEffect(() => {
    if (!trackPerformance) return;
    
    // Only measure if the data array length changed
    if (dataLengthRef.current !== itemCount) {
      const startTime = Date.now();
      
      // Schedule a measurement after rendering
      const timerId = setTimeout(() => {
        const renderTime = Date.now() - startTime;
        renderTimes.current.push(renderTime);
        
        // Only keep the last 10 measurements
        if (renderTimes.current.length > 10) {
          renderTimes.current.shift();
        }
        
        measurePerformance();
      }, 100);
      
      dataLengthRef.current = itemCount;
      return () => clearTimeout(timerId);
    }
  }, [itemCount, trackPerformance, measurePerformance]);
  
  // Apply optimized animation configuration
  useEffect(() => {
    if (needsOptimization) {
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
  }, [needsOptimization]);
  
  // Build optimized FlatList props
  const listProps: Partial<FlatListProps<T>> = {
    initialNumToRender,
    maxToRenderPerBatch,
    windowSize,
    removeClippedSubviews,
    updateCellsBatchingPeriod,
    ...(calculatedGetItemLayout ? { getItemLayout: calculatedGetItemLayout } : {}),
    
    // Other performance optimizations
    keyboardShouldPersistTaps: 'handled',
    keyboardDismissMode: 'on-drag',
    
    // Only show scrollbar when needed
    showsVerticalScrollIndicator: !needsOptimization,
  };
  
  // Create optimized props object for VirtualizedList and other components
  const optimizedProps = {
    initialNumToRender,
    maxToRenderPerBatch,
    windowSize,
    updateCellsBatchingPeriod,
    removeClippedSubviews
  };
  
  return {
    listProps,
    optimizedProps,
    isOptimized: needsOptimization,
    stats: {
      averageRenderTime,
      renderedItems: 0, // This would need to be tracked in a real implementation
      totalItems: itemCount,
    },
    measurePerformance,
    trackItemRender,
    trackListRender
  };
} 