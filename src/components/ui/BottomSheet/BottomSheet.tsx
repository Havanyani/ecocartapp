/**
 * BottomSheet.tsx
 * 
 * Shared interface for the BottomSheet component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type BottomSheetSnapPoint = number | string | 'content';

export interface BottomSheetProps {
  /**
   * Whether the bottom sheet is visible
   */
  isVisible: boolean;
  
  /**
   * Callback when the bottom sheet is closed
   */
  onClose: () => void;
  
  /**
   * Content to display in the bottom sheet
   */
  children: React.ReactNode;
  
  /**
   * Custom style for the bottom sheet container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the bottom sheet content
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * List of snap points for the sheet
   * - Numbers represent fixed heights in pixels
   * - Strings like '25%' represent a percentage of screen height
   * - 'content' will size the sheet to fit its content
   * @default ['50%']
   */
  snapPoints?: BottomSheetSnapPoint[];
  
  /**
   * Initial snap point index to show
   * @default 0
   */
  initialSnapIndex?: number;
  
  /**
   * Whether to show a handle at the top of the sheet
   * @default true
   */
  showHandle?: boolean;
  
  /**
   * Whether the sheet should have rounded corners
   * @default true
   */
  rounded?: boolean;
  
  /**
   * Custom radius for rounded corners
   * @default 16
   */
  borderRadius?: number;
  
  /**
   * Whether the bottom sheet can be dismissed by tapping outside
   * @default true
   */
  closeOnBackdropPress?: boolean;
  
  /**
   * Custom backdrop color
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  backdropColor?: string;
  
  /**
   * Whether to animate when opening/closing
   * @default true
   */
  animateOnOpen?: boolean;
  
  /**
   * Duration of open/close animation in milliseconds
   * @default 300
   */
  animationDuration?: number;
  
  /**
   * Whether the bottom sheet can be dragged up and down
   * @default true
   */
  enableDrag?: boolean;
  
  /**
   * Callback when the sheet position changes
   */
  onPositionChange?: (index: number) => void;
  
  /**
   * Whether to show a dark overlay behind the sheet
   * @default true
   */
  showBackdrop?: boolean;
  
  /**
   * ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Whether the sheet should take over the full screen when expanded
   * @default false
   */
  expandToFullscreen?: boolean;
  
  /**
   * Whether to show a close button
   * @default false
   */
  showCloseButton?: boolean;
  
  /**
   * Title to display at the top of the sheet
   */
  title?: string;
  
  /**
   * Whether to include a safe area at the bottom of the sheet
   * @default true
   */
  enableBottomSafeArea?: boolean;
  
  /**
   * Callback when the user begins to drag the sheet
   */
  onDragStart?: () => void;
  
  /**
   * Callback when the user finishes dragging the sheet
   */
  onDragEnd?: () => void;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function BottomSheet(props: BottomSheetProps): JSX.Element {
  console.warn('BottomSheet implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 