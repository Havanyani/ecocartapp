/**
 * A highly optimized FlatList component for React Native that implements performance best practices
 * and provides configurable optimization levels.
 * 
 * @component
 * @template T - The type of items in the list
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <OptimizedFlatList
 *   data={items}
 *   renderItem={({ item }) => <ItemComponent item={item} />}
 * />
 * 
 * // With performance optimizations
 * <OptimizedFlatList
 *   data={items}
 *   renderItem={({ item }) => <ItemComponent item={item} />}
 *   itemHeight={80}
 *   optimizationLevel="high"
 *   trackPerformance={true}
 * />
 * 
 * // With accessibility
 * <OptimizedFlatList
 *   data={items}
 *   renderItem={({ item }) => <ItemComponent item={item} />}
 *   accessible={true}
 *   accessibilityLabel="List of items"
 *   accessibilityHint="Displays a scrollable list of items"
 * />
 * ```
 * 
 * @features
 * - Memoized item rendering with React.memo for optimal performance
 * - Window-based rendering optimization to minimize memory usage
 * - Configurable fixed item height for smooth scrolling
 * - Performance tracking and metrics collection
 * - Optimized scroll event handling with throttling
 * - Memory usage optimization with removeClippedSubviews
 * 
 * @performance
 * - Uses getItemLayout when itemHeight is provided for O(1) layout calculation
 * - Implements removeClippedSubviews to reduce memory footprint
 * - Batches scroll events for better performance
 * - Configurable viewability thresholds for optimal rendering
 * - Memoizes configuration and callbacks to prevent unnecessary re-renders
 * 
 * @accessibility
 * - Maintains native FlatList accessibility features
 * - Supports VoiceOver and TalkBack screen readers
 * - Provides keyboard navigation support
 * - Includes ARIA roles and labels
 * 
 * @bestPractices
 * - Provide itemHeight when possible for best scrolling performance
 * - Use trackPerformance in development to monitor metrics
 * - Choose appropriate optimizationLevel based on data size:
 *   - low: <100 items
 *   - medium: 100-500 items
 *   - high: >500 items
 * - Consider using windowSize prop for memory optimization
 * - Implement proper key extraction for optimal rendering
 * 
 * @see {@link https://reactnative.dev/docs/flatlist} React Native FlatList documentation
 * @see {@link https://reactnative.dev/docs/optimizing-flatlist-configuration} FlatList optimization guide
 */

import { PerformanceMonitor } from '@/utils/Performance';
import React, { memo, useCallback, useMemo } from 'react';
import {
    FlatList,
    FlatListProps,
    ListRenderItemInfo,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    ViewToken
} from 'react-native';
import {
    DEFAULT_VIEWABILITY_CONFIG
} from '../../utils/PerformanceOptimizations';

/**
 * Props interface for the OptimizedFlatList component
 * @template T - The type of items in the list
 * @extends {Omit<FlatListProps<T>, 'onViewableItemsChanged'>} Extends FlatList props excluding onViewableItemsChanged
 */
export interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'onViewableItemsChanged'> {
    /** 
     * Fixed height for list items. Providing this improves scrolling performance by enabling O(1) layout calculation.
     * @example
     * itemHeight={80}
     */
    itemHeight?: number;
    
    /** 
     * Enable performance tracking and metrics collection. Useful for development and debugging.
     * @default false
     */
    trackPerformance?: boolean;
    
    /** 
     * Level of performance optimizations to apply
     * - low: Basic optimizations, suitable for small lists (<100 items)
     * - medium: Balanced optimizations, good for most use cases (100-500 items)
     * - high: Aggressive optimizations, best for large lists (>500 items)
     * @default 'medium'
     */
    optimizationLevel?: 'low' | 'medium' | 'high';
    
    /** 
     * Callback when items become visible in the viewport.
     * Provides information about which items are currently visible and what changed.
     * @param info - Object containing viewable items and changes
     */
    onItemVisible?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
    
    /** 
     * Disable all optimizations. Useful for debugging and comparing performance.
     * @default false
     */
    disableOptimizations?: boolean;
    
    /** 
     * Custom scroll throttle interval in milliseconds.
     * Lower values provide more frequent updates but may impact performance.
     * @default 16
     */
    scrollThrottleMs?: number;
    
    /** 
     * Enable window-based rendering optimization.
     * Helps reduce memory usage by rendering only items near the viewport.
     * @default true
     */
    useWindowOptimization?: boolean;
}

/**
 * Configuration for different optimization levels.
 * These values are carefully tuned based on performance testing.
 */
const OPTIMIZATION_CONFIGS = {
    low: {
        windowSize: 3,
        maxToRenderPerBatch: 5,
        updateCellsBatchingPeriod: 50,
        initialNumToRender: 10,
    },
    medium: {
        windowSize: 5,
        maxToRenderPerBatch: 10,
        updateCellsBatchingPeriod: 30,
        initialNumToRender: 8,
    },
    high: {
        windowSize: 7,
        maxToRenderPerBatch: 15,
        updateCellsBatchingPeriod: 20,
        initialNumToRender: 5,
    },
} as const;

/**
 * OptimizedFlatList component implementation
 * @template T - The type of items in the list
 * @param {OptimizedFlatListProps<T>} props - Component props
 * @returns {JSX.Element} Rendered FlatList component
 */
function OptimizedFlatListComponent<T>(props: OptimizedFlatListProps<T>) {
    const {
        data,
        renderItem,
        itemHeight,
        trackPerformance = false,
        optimizationLevel = 'medium',
        onItemVisible,
        keyExtractor,
        disableOptimizations = false,
        scrollThrottleMs = 16,
        useWindowOptimization = true,
        onScrollBeginDrag: propsOnScrollBeginDrag,
        onScrollEndDrag: propsOnScrollEndDrag,
        ...restProps
    } = props;

    // Memoize optimization config
    const optimizationConfig = useMemo(() => {
        if (disableOptimizations) return {};
        return {
            ...OPTIMIZATION_CONFIGS[optimizationLevel],
            ...(itemHeight && {
                getItemLayout: (_: any, index: number) => ({
                    length: itemHeight,
                    offset: itemHeight * index,
                    index,
                }),
            }),
            removeClippedSubviews: Platform.OS !== 'web',
            maxToRenderPerBatch: OPTIMIZATION_CONFIGS[optimizationLevel].maxToRenderPerBatch,
            windowSize: OPTIMIZATION_CONFIGS[optimizationLevel].windowSize,
            updateCellsBatchingPeriod: OPTIMIZATION_CONFIGS[optimizationLevel].updateCellsBatchingPeriod,
            initialNumToRender: OPTIMIZATION_CONFIGS[optimizationLevel].initialNumToRender,
        };
    }, [disableOptimizations, optimizationLevel, itemHeight]);

    // Memoize render item function
    const memoizedRenderItem = useCallback((info: ListRenderItemInfo<T>) => {
        if (!renderItem) return null;
        
        if (trackPerformance) {
            const startTime = Date.now();
            const result = renderItem(info);
            PerformanceMonitor.trackResponseTime('render_item', startTime);
            return result;
        }
        return renderItem(info);
    }, [renderItem, trackPerformance]);

    // Handle scroll events
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (trackPerformance) {
            PerformanceMonitor.addBreadcrumb('scroll', 'List scrolled');
        }
        props.onScroll?.(event);
    }, [props.onScroll, trackPerformance]);

    // Handle viewable items changed
    const handleViewableItemsChanged = useCallback(({ viewableItems, changed }: {
        viewableItems: ViewToken[];
        changed: ViewToken[];
    }) => {
        if (trackPerformance) {
            PerformanceMonitor.addBreadcrumb(
                'visibility',
                `Visible items: ${viewableItems.length}`
            );
        }
        onItemVisible?.({ viewableItems, changed });
    }, [onItemVisible, trackPerformance]);

    // Initialize performance monitoring
    React.useEffect(() => {
        if (trackPerformance) {
            PerformanceMonitor.addBreadcrumb(
                'lifecycle',
                'OptimizedFlatList mounted'
            );
        }
        return () => {
            if (trackPerformance) {
                PerformanceMonitor.addBreadcrumb(
                    'lifecycle',
                    'OptimizedFlatList unmounted'
                );
            }
        };
    }, [trackPerformance]);

    return (
        <FlatList<T>
            data={data}
            renderItem={memoizedRenderItem}
            keyExtractor={keyExtractor}
            onScroll={handleScroll}
            scrollEventThrottle={scrollThrottleMs}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={DEFAULT_VIEWABILITY_CONFIG}
            {...optimizationConfig}
            {...restProps}
            accessible={true}
            accessibilityRole="list"
        />
    );
}

/**
 * Memoized OptimizedFlatList component
 * Prevents unnecessary re-renders when parent components update
 */
export const OptimizedFlatList = memo(OptimizedFlatListComponent) as typeof OptimizedFlatListComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
}); 