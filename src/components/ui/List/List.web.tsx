/**
 * List.web.tsx
 * 
 * Web-specific implementation of the List component.
 * Optimized for web rendering with virtualization for performance.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ListItemProps, ListProps } from './List';

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  containerStyle,
  showDividers = false,
  dividerComponent,
  showHeader = false,
  headerComponent,
  showFooter = false,
  footerComponent,
  isLoading = false,
  loadingComponent,
  isEmpty = false,
  emptyComponent,
  emptyText = 'No items found',
  scrollable = true,
  refreshable = false,
  onRefresh,
  refreshing = false,
  loadingMore = false,
  onEndReached,
  onEndReachedThreshold = 0.2,
  onScroll,
  testID,
  accessibilityLabel,
  rounded = false,
  padded = false,
  paddingAmount = 16,
  bordered = false,
  selectable = false,
  selectedIndices = [],
  onSelectionChange,
  multiSelect = false,
}: ListProps<T>): JSX.Element {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  
  // Memoize the actual isEmpty state by checking data length
  const actuallyEmpty = useMemo(() => 
    isEmpty || !data || data.length === 0, 
    [isEmpty, data]
  );
  
  // Handle end reached when near bottom and loadingMore changes
  useEffect(() => {
    if (isNearBottom && !loadingMore && onEndReached) {
      onEndReached();
    }
  }, [isNearBottom, loadingMore, onEndReached]);
  
  // Handle manual refresh for web (pull-to-refresh not available)
  const handleRefresh = useCallback(() => {
    if (refreshable && onRefresh && !refreshing) {
      onRefresh();
    }
  }, [refreshable, onRefresh, refreshing]);
  
  // Handle scroll event
  const handleScroll = useCallback((event: any) => {
    if (onScroll) {
      onScroll(event);
    }
    
    // Check if we're near the bottom for infinite loading
    if (onEndReached && scrollable) {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = contentSize.height * onEndReachedThreshold;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
      
      setIsNearBottom(isCloseToBottom);
    }
  }, [onScroll, onEndReached, scrollable, onEndReachedThreshold]);
  
  // Create a wrapper for the renderItem function to provide additional props
  const renderItemWrapper = useCallback((item: T, index: number) => {
    const isFirst = index === 0;
    const isLast = index === data.length - 1;
    const isSelected = selectedIndices.includes(index);
    
    // Create a handler for item press
    const handlePress = () => {
      if (selectable && onSelectionChange) {
        let newSelectedIndices: number[];
        
        if (multiSelect) {
          // For multi-select, toggle the selection
          newSelectedIndices = isSelected
            ? selectedIndices.filter(i => i !== index)
            : [...selectedIndices, index];
        } else {
          // For single select, replace the selection
          newSelectedIndices = isSelected ? [] : [index];
        }
        
        onSelectionChange(newSelectedIndices);
      }
    };
    
    // Create props for the renderItem function
    const itemProps: ListItemProps<T> = {
      item,
      index,
      isFirst,
      isLast,
      isSelected,
      onPress: selectable ? handlePress : undefined,
    };
    
    return renderItem(itemProps);
  }, [data, renderItem, selectable, selectedIndices, multiSelect, onSelectionChange]);
  
  // Function to extract keys from items
  const keyExtractorFn = useCallback((item: T, index: number) => {
    if (typeof keyExtractor === 'function') {
      return keyExtractor(item, index);
    }
    
    // If keyExtractor is a string, use it as a property name
    const key = item[keyExtractor as keyof T];
    return key ? key.toString() : index.toString();
  }, [keyExtractor]);
  
  // Render the default divider
  const renderDivider = useCallback(() => {
    if (!showDividers) return null;
    
    if (dividerComponent) {
      return dividerComponent;
    }
    
    return (
      <View
        style={[
          styles.divider,
          { backgroundColor: theme.colors.border },
        ]}
      />
    );
  }, [showDividers, dividerComponent, theme.colors.border]);
  
  // Render header component
  const renderHeader = useCallback(() => {
    if (!showHeader || !headerComponent) return null;
    
    // For web, add a refresh button if refreshable
    if (refreshable && onRefresh) {
      return (
        <View>
          {headerComponent}
          {refreshing ? (
            <View style={styles.refreshingContainer}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={[styles.refreshingText, { color: theme.colors.text }]}>
                Refreshing...
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return headerComponent;
  }, [showHeader, headerComponent, refreshable, onRefresh, refreshing, handleRefresh, theme]);
  
  // Render footer component
  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={[styles.loadingMoreText, { color: theme.colors.text }]}>
            Loading more...
          </Text>
        </View>
      );
    }
    
    if (!showFooter || !footerComponent) return null;
    return footerComponent;
  }, [showFooter, footerComponent, loadingMore, theme]);
  
  // Calculate container styles
  const containerStyles = useMemo(() => {
    const baseContainerStyle: ViewStyle = {};
    
    if (rounded) {
      baseContainerStyle.borderRadius = 8;
      baseContainerStyle.overflow = 'hidden';
    }
    
    if (padded) {
      baseContainerStyle.padding = paddingAmount;
    }
    
    if (bordered) {
      baseContainerStyle.borderWidth = 1;
      baseContainerStyle.borderColor = theme.colors.border;
    }
    
    // Web-specific styles
    baseContainerStyle.maxWidth = '100%';
    
    return [
      styles.container,
      baseContainerStyle,
      containerStyle,
    ];
  }, [rounded, padded, bordered, paddingAmount, theme.colors.border, containerStyle]);
  
  // Loading state
  if (isLoading) {
    return (
      <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
        {loadingComponent || (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        )}
      </View>
    );
  }
  
  // Empty state
  if (actuallyEmpty) {
    return (
      <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
        {emptyComponent || (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {emptyText}
            </Text>
          </View>
        )}
      </View>
    );
  }
  
  // Create the content to render
  const content = (
    <>
      {renderHeader()}
      {data.map((item, index) => (
        <React.Fragment key={keyExtractorFn(item, index)}>
          {index > 0 && renderDivider()}
          {renderItemWrapper(item, index)}
        </React.Fragment>
      ))}
      {renderFooter()}
    </>
  );
  
  // Non-scrollable list
  if (!scrollable) {
    return (
      <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }
  
  // Scrollable list with ScrollView for web
  return (
    <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        data-testid={testID ? `${testID}-scroll` : undefined}
      >
        {content}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  refreshButton: {
    alignSelf: 'flex-end',
    padding: 8,
    margin: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
    margin: 8,
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 14,
  },
}); 