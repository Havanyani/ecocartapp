import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    ActivityIndicator,
    ListRenderItemInfo,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    ViewStyle,
    VirtualizedList
} from 'react-native';
import { useListPerformance } from '../../hooks/useListPerformance';
import { createMemoizedComponent } from '../../utils/memoization';

interface OptimizedVirtualizedListProps<ItemT> {
  /**
   * Data to be rendered in the list
   */
  data: readonly ItemT[];
  
  /**
   * Function that returns the number of items in the data
   */
  getItemCount: (data: readonly ItemT[]) => number;
  
  /**
   * Function that returns the item at the specified index
   */
  getItem: (data: readonly ItemT[], index: number) => ItemT;
  
  /**
   * Function to render each item
   */
  renderItem: (info: ListRenderItemInfo<ItemT>) => React.ReactElement | null;
  
  /**
   * Function to extract a unique key for each item
   */
  keyExtractor: (item: ItemT, index: number) => string;
  
  /**
   * Component to render when the list is empty
   */
  ListEmptyComponent?: React.ReactElement | (() => React.ReactElement);
  
  /**
   * Component to render at the top of the list
   */
  ListHeaderComponent?: React.ReactElement | (() => React.ReactElement);
  
  /**
   * Component to render at the bottom of the list
   */
  ListFooterComponent?: React.ReactElement | (() => React.ReactElement);
  
  /**
   * Component to render between each item
   */
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  
  /**
   * Function called when the end of the list is reached
   */
  onEndReached?: () => void;
  
  /**
   * How far from the end (in units of visible length) the bottom edge 
   * of the list must be from the end of the content to trigger onEndReached
   */
  onEndReachedThreshold?: number;
  
  /**
   * Called when the user pulls to refresh
   */
  onRefresh?: () => void;
  
  /**
   * Whether the list is currently refreshing
   */
  refreshing?: boolean;
  
  /**
   * Whether the list is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Optional error to display
   */
  error?: Error | null;
  
  /**
   * Style for the container
   */
  style?: ViewStyle;
  
  /**
   * Style for the content container
   */
  contentContainerStyle?: ViewStyle;
  
  /**
   * Unique identifier for performance tracking
   */
  listId?: string;
  
  /**
   * Whether to track performance metrics
   */
  trackPerformance?: boolean;
  
  /**
   * Whether optimization parameters should be automatically adjusted based on performance
   */
  autoOptimize?: boolean;
  
  /**
   * The estimated height of each item (for performance optimization)
   */
  estimatedItemSize?: number;
  
  /**
   * Whether to recycle views that are outside of the visible area
   */
  removeClippedSubviews?: boolean;
}

/**
 * High-performance virtualized list component with advanced optimization features:
 * 
 * - View recycling for memory efficiency
 * - Performance tracking and automatic optimization
 * - Smart batching for render performance
 * - Efficient window sizing based on device capabilities
 * - Memory usage optimization for large lists
 */
function OptimizedVirtualizedListComponent<ItemT>({
  data,
  getItemCount,
  getItem,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  onRefresh,
  refreshing = false,
  isLoading = false,
  error = null,
  style,
  contentContainerStyle,
  listId = 'virtualized-list',
  trackPerformance = __DEV__,
  autoOptimize = true,
  estimatedItemSize,
  removeClippedSubviews
}: OptimizedVirtualizedListProps<ItemT>) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Calculate data length for performance tracking
  const itemCount = useMemo(() => getItemCount(data), [data, getItemCount]);
  
  // Monitor list performance and get optimized configuration
  const { optimizedProps, trackItemRender, trackListRender } = useListPerformance<ItemT>({
    listId,
    componentName: `OptimizedVirtualizedList_${listId}`,
    itemCount,
    trackPerformance,
    optimizeForMemory: removeClippedSubviews,
    itemHeight: estimatedItemSize
  });
  
  // Configure optimization parameters - either use performance suggestions or defaults
  const listConfig = useMemo(() => {
    if (autoOptimize) {
      return optimizedProps;
    }
    
    return {
      initialNumToRender: Math.min(10, itemCount),
      maxToRenderPerBatch: 5,
      windowSize: 10,
      updateCellsBatchingPeriod: 50,
      removeClippedSubviews: Platform.OS === 'android' || removeClippedSubviews || itemCount > 100
    };
  }, [autoOptimize, itemCount, optimizedProps, removeClippedSubviews]);
  
  // Track overall list rendering performance
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Track individual item render time
  const trackItemRenderTime = useCallback(
    (index: number) => {
      if (!trackPerformance) return null;
      
      const startTime = Date.now();
      
      return () => {
        const renderTime = Date.now() - startTime;
        if (isMountedRef.current) {
          trackItemRender(index, renderTime);
        }
      };
    },
    [trackPerformance, trackItemRender]
  );
  
  // Create memoized renderer with performance tracking
  const memoizedRenderItem = useCallback(
    (info: ListRenderItemInfo<ItemT>) => {
      const trackingCallback = trackItemRenderTime(info.index);
      const result = renderItem(info);
      
      if (trackingCallback) {
        // Use requestAnimationFrame to measure after the render completes
        requestAnimationFrame(trackingCallback);
      }
      
      return result;
    },
    [renderItem, trackItemRenderTime]
  );
  
  // Handle the end of list reached
  const handleEndReached = useCallback(() => {
    if (!isLoading && onEndReached) {
      onEndReached();
    }
  }, [isLoading, onEndReached]);
  
  // Track list render completion
  useEffect(() => {
    if (!trackPerformance) return;
    
    const renderCompleteTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        const totalRenderTime = Date.now() - startTimeRef.current;
        trackListRender(totalRenderTime);
      }
    }, 0);
    
    return () => clearTimeout(renderCompleteTimeout);
  }, [data, trackPerformance, trackListRender]);
  
  // Loading indicator 
  const loadingIndicator = useMemo(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator 
        size="large" 
        color={isDarkMode ? '#FFFFFF' : '#000000'} 
      />
      <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
        Loading...
      </Text>
    </View>
  ), [isDarkMode]);
  
  // Error indicator
  const errorIndicator = useMemo(() => error && (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
        {error.message || 'An error occurred'}
      </Text>
    </View>
  ), [error, isDarkMode]);
  
  // Empty state component
  const emptyComponent = useMemo(() => {
    if (isLoading) return loadingIndicator;
    if (error) return errorIndicator;
    
    if (typeof ListEmptyComponent === 'function') {
      return ListEmptyComponent();
    }
    
    return ListEmptyComponent || (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
          No items found
        </Text>
      </View>
    );
  }, [
    isLoading, 
    loadingIndicator, 
    error, 
    errorIndicator, 
    ListEmptyComponent, 
    isDarkMode
  ]);
  
  // Setup refresh control
  const refreshControl = useMemo(() => 
    onRefresh ? (
      <RefreshControl 
        refreshing={refreshing} 
        onRefresh={onRefresh}
        colors={[isDarkMode ? '#FFFFFF' : '#000000']}
        tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
      />
    ) : undefined,
    [onRefresh, refreshing, isDarkMode]
  );
  
  return (
    <View style={[styles.container, style]}>
      <VirtualizedList
        data={data}
        getItemCount={getItemCount}
        getItem={getItem}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={emptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        refreshControl={refreshControl}
        contentContainerStyle={contentContainerStyle}
        
        // Performance optimization properties
        initialNumToRender={listConfig.initialNumToRender}
        maxToRenderPerBatch={listConfig.maxToRenderPerBatch}
        windowSize={listConfig.windowSize}
        updateCellsBatchingPeriod={listConfig.updateCellsBatchingPeriod}
        removeClippedSubviews={listConfig.removeClippedSubviews}
        
        // Additional optimizations
        getItemLayout={estimatedItemSize ? (_, index) => ({
          length: estimatedItemSize,
          offset: estimatedItemSize * index,
          index
        }) : undefined}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10
        }}
      />
    </View>
  );
}

// Create memoized version of the component
const OptimizedVirtualizedList = createMemoizedComponent(
  OptimizedVirtualizedListComponent,
  {
    trackPerformance: __DEV__,
    componentName: 'OptimizedVirtualizedList',
    areEqual: (prevProps, nextProps) => {
      // Custom equality check for performance optimization
      return (
        prevProps.data === nextProps.data &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.error === nextProps.error &&
        prevProps.renderItem === nextProps.renderItem
      );
    }
  }
) as typeof OptimizedVirtualizedListComponent;

export default OptimizedVirtualizedList;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF3B30'
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  darkText: {
    color: '#FFFFFF'
  }
}); 