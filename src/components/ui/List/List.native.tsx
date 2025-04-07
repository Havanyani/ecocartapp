/**
 * List.native.tsx
 * 
 * Native-specific implementation of the List component.
 * Uses FlatList for efficient rendering with native optimizations.
 */

import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    ViewStyle
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
  
  // Memoize the actual isEmpty state by checking data length
  const actuallyEmpty = useMemo(() => 
    isEmpty || !data || data.length === 0, 
    [isEmpty, data]
  );
  
  // Create a wrapper for the renderItem function to provide additional props
  const renderItemWrapper = useCallback(({ item, index }: { item: T; index: number }) => {
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
    return headerComponent;
  }, [showHeader, headerComponent]);
  
  // Render footer component
  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      );
    }
    
    if (!showFooter || !footerComponent) return null;
    return footerComponent;
  }, [showFooter, footerComponent, loadingMore, theme.colors.primary]);
  
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
  
  // Non-scrollable list
  if (!scrollable) {
    return (
      <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
        {renderHeader()}
        {data.map((item, index) => (
          <React.Fragment key={keyExtractorFn(item, index)}>
            {index > 0 && renderDivider()}
            {renderItemWrapper({ item, index })}
          </React.Fragment>
        ))}
        {renderFooter()}
      </View>
    );
  }
  
  // Scrollable list with FlatList
  return (
    <View style={containerStyles} testID={testID} accessibilityLabel={accessibilityLabel}>
      <FlatList
        data={data}
        renderItem={renderItemWrapper}
        keyExtractor={keyExtractorFn}
        ItemSeparatorComponent={renderDivider}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        refreshControl={
          refreshable ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onScroll={onScroll}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  loadingMoreContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 