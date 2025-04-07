/**
 * List.tsx
 * 
 * Shared interface for the List component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ListItemProps<T> {
  /**
   * The item data to render
   */
  item: T;
  
  /**
   * The index of the item in the list
   */
  index: number;
  
  /**
   * Whether this is the first item in the list
   */
  isFirst: boolean;
  
  /**
   * Whether this is the last item in the list
   */
  isLast: boolean;
  
  /**
   * Whether this item is currently selected
   */
  isSelected?: boolean;
  
  /**
   * Callback for when the item is pressed
   */
  onPress?: () => void;
}

export interface ListProps<T> {
  /**
   * Array of data to render in the list
   */
  data: T[];
  
  /**
   * Function to render each item in the list
   */
  renderItem: (props: ListItemProps<T>) => React.ReactNode;
  
  /**
   * Key to use for each item in the list
   * Can be a string representing a property of T, or a function that returns a unique key
   */
  keyExtractor: ((item: T, index: number) => string) | keyof T;
  
  /**
   * Custom styles for the list container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Whether to add dividers between items
   * @default false
   */
  showDividers?: boolean;
  
  /**
   * Custom divider component to use between items
   * If not provided, a default divider will be used
   */
  dividerComponent?: React.ReactNode;
  
  /**
   * Whether to show a header component
   * @default false
   */
  showHeader?: boolean;
  
  /**
   * Component to render as the list header
   */
  headerComponent?: React.ReactNode;
  
  /**
   * Whether to show a footer component
   * @default false
   */
  showFooter?: boolean;
  
  /**
   * Component to render as the list footer
   */
  footerComponent?: React.ReactNode;
  
  /**
   * Whether the list is currently loading
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Component to show when the list is loading
   * If not provided, a default loading indicator will be shown
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Whether the list is empty (no data)
   * @default false
   */
  isEmpty?: boolean;
  
  /**
   * Component to show when the list is empty
   * If not provided, a default empty state will be shown
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * Text to show when the list is empty
   * @default 'No items found'
   */
  emptyText?: string;
  
  /**
   * Whether to make the list scrollable
   * @default true
   */
  scrollable?: boolean;
  
  /**
   * Whether the list is refreshable (pull to refresh)
   * @default false
   */
  refreshable?: boolean;
  
  /**
   * Callback when the user refreshes the list
   */
  onRefresh?: () => void;
  
  /**
   * Whether the list is currently refreshing
   * @default false
   */
  refreshing?: boolean;
  
  /**
   * Whether to show a loading indicator at the bottom when loading more items
   * @default false
   */
  loadingMore?: boolean;
  
  /**
   * Callback when the user scrolls to the end of the list
   */
  onEndReached?: () => void;
  
  /**
   * How far from the end of the list to trigger onEndReached
   * @default 0.2
   */
  onEndReachedThreshold?: number;
  
  /**
   * Callback for when the list scroll position changes
   */
  onScroll?: (event: any) => void;
  
  /**
   * ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Whether to have rounded corners on the list container
   * @default false
   */
  rounded?: boolean;
  
  /**
   * Whether to add padding to the list container
   * @default false
   */
  padded?: boolean;
  
  /**
   * Custom padding amount for the list container
   * @default 16
   */
  paddingAmount?: number;
  
  /**
   * Whether to add a border to the list container
   * @default false
   */
  bordered?: boolean;
  
  /**
   * Whether the list can be selected
   * @default false
   */
  selectable?: boolean;
  
  /**
   * Array of selected item indices
   */
  selectedIndices?: number[];
  
  /**
   * Callback for when an item selection changes
   */
  onSelectionChange?: (selectedIndices: number[]) => void;
  
  /**
   * Whether multiple items can be selected
   * @default false
   */
  multiSelect?: boolean;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function List<T>(props: ListProps<T>): JSX.Element {
  console.warn('List implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 