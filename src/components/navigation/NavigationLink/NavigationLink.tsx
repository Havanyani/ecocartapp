/**
 * NavigationLink.tsx
 * 
 * Shared interface for the NavigationLink component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface NavigationLinkProps {
  /**
   * The route path or ID to navigate to
   */
  to: string;
  
  /**
   * The content of the link
   */
  children: React.ReactNode;
  
  /**
   * Additional parameters to pass to the route
   */
  params?: Record<string, any>;
  
  /**
   * Custom style for the link container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the link text
   */
  textStyle?: StyleProp<TextStyle>;
  
  /**
   * Callback when the link is pressed
   */
  onPress?: () => void;
  
  /**
   * Whether the link should be active (usually determined automatically)
   */
  isActive?: boolean;
  
  /**
   * Custom style to apply when the link is active
   */
  activeStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom text style to apply when the link is active
   */
  activeTextStyle?: StyleProp<TextStyle>;
  
  /**
   * Whether the link should replace the current route in history (web only)
   * @default false
   */
  replace?: boolean;
  
  /**
   * Whether to prefetch the linked route (web only)
   * @default false
   */
  prefetch?: boolean;
  
  /**
   * Accessibility label for the link
   */
  accessibilityLabel?: string;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function NavigationLink(props: NavigationLinkProps): JSX.Element {
  console.warn('NavigationLink implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 