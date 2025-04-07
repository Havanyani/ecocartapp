import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    FlatListProps,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    ViewStyle
} from 'react-native';
import { useListPerformance } from '../../hooks/useListPerformance';
import { createMemoizedComponent, useMemoizedCallback } from '../../utils/memoization';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

interface OptimizedListViewProps<ItemT> extends Omit<FlatListProps<ItemT>, 'renderItem'> {
  data: ReadonlyArray<ItemT>;
  renderItem: (item: ItemT, index: number) => React.ReactElement;
  keyExtractor: (item: ItemT, index: number) => string;
  ListEmptyComponent?: React.ReactElement | (() => React.ReactElement);
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | (() => React.ReactElement);
  ListHeaderComponent?: React.ReactElement | (() => React.ReactElement);
  isLoading?: boolean;
  trackPerformance?: boolean;
  componentId?: string;
  containerStyle?: ViewStyle;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
}

/**
 * OptimizedListView is a high-performance list component that applies several
 * optimizations for React Native lists:
 * 
 * 1. Memoized render callbacks to prevent unnecessary re-renders
 * 2. Performance tracking when in development mode
 * 3. Optimized FlatList configuration 
 * 4. Built-in loading states
 */
function OptimizedListViewComponent<ItemT>({
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListFooterComponent,
  ListHeaderComponent,
  isLoading = false,
  trackPerformance = __DEV__,
  componentId = 'OptimizedListView',
  containerStyle,
  windowSize,
  initialNumToRender,
  maxToRenderPerBatch,
  updateCellsBatchingPeriod,
  ...rest
}: OptimizedListViewProps<ItemT>) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Start timing when the list renders
  const startTime = Date.now();
  
  // Use performance hooks to optimize list rendering
  const { optimizedProps, trackItemRender } = useListPerformance<ItemT>({
    componentName: componentId,
    data: data as ItemT[],
    trackPerformance,
    windowSize,
    initialNumToRender,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod
  });

  // Optimize the keyExtractor with memoization
  const memoizedKeyExtractor = useMemoizedCallback(
    (item: ItemT, index: number) => keyExtractor(item, index),
    [keyExtractor],
    { 
      trackPerformance,
      componentName: componentId,
      functionName: 'keyExtractor'
    }
  );

  // Optimize renderItem with memoization 
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: ItemT; index: number }) => {
      // Track individual item render performance in development
      if (trackPerformance) {
        const itemStartTime = Date.now();
        const result = renderItem(item, index);
        const itemRenderTime = Date.now() - itemStartTime;
        
        // Track item render performance
        trackItemRender(index, itemRenderTime);
        
        return result;
      }
      
      return renderItem(item, index);
    },
    [renderItem, trackPerformance, trackItemRender]
  );
  
  // Optimize empty component
  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading...
          </Text>
        </View>
      );
    }

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
  }, [isLoading, ListEmptyComponent, isDarkMode]);

  // Optimize onEndReached to prevent duplicate calls
  const handleEndReached = useMemoizedCallback(
    () => {
      if (!isLoading && onEndReached) {
        onEndReached();
      }
    },
    [isLoading, onEndReached],
    {
      trackPerformance,
      componentName: componentId,
      functionName: 'onEndReached'
    }
  );

  // Log total render time when component completes rendering
  useEffect(() => {
    if (trackPerformance) {
      const renderTime = Date.now() - startTime;
      PerformanceMonitor.recordMetric({
        name: `list_render_${componentId}`,
        duration: renderTime,
        type: 'render',
        component: componentId,
        timestamp: Date.now()
      });
    }
  }, [componentId, trackPerformance]);

  // Use either optimized props or provided props for list configuration
  const finalListProps = useMemo(() => ({
    initialNumToRender: initialNumToRender ?? optimizedProps.initialNumToRender,
    maxToRenderPerBatch: maxToRenderPerBatch ?? optimizedProps.maxToRenderPerBatch,
    windowSize: windowSize ?? optimizedProps.windowSize,
    updateCellsBatchingPeriod: updateCellsBatchingPeriod ?? optimizedProps.updateCellsBatchingPeriod,
    removeClippedSubviews: optimizedProps.removeClippedSubviews
  }), [
    initialNumToRender,
    maxToRenderPerBatch,
    windowSize,
    updateCellsBatchingPeriod,
    optimizedProps
  ]);

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={memoizedKeyExtractor}
        ListEmptyComponent={EmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        initialNumToRender={finalListProps.initialNumToRender}
        maxToRenderPerBatch={finalListProps.maxToRenderPerBatch}
        windowSize={finalListProps.windowSize}
        updateCellsBatchingPeriod={finalListProps.updateCellsBatchingPeriod}
        removeClippedSubviews={finalListProps.removeClippedSubviews}
        {...rest}
      />
    </View>
  );
}

// Create an optimized version of the list with component level memoization
const OptimizedListView = createMemoizedComponent(
  OptimizedListViewComponent,
  { 
    trackPerformance: __DEV__,
    componentName: 'OptimizedListView',
    areEqual: (prevProps, nextProps) => {
      // Custom equality check to prevent unnecessary re-renders
      return (
        prevProps.data === nextProps.data &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.renderItem === nextProps.renderItem
      );
    }
  }
) as <ItemT>(props: OptimizedListViewProps<ItemT>) => React.ReactElement;

// Export the optimized list view
export default OptimizedListView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  darkText: {
    color: '#FFFFFF',
  },
}); 