/**
 * Modal.tsx
 * 
 * Shared interface for the Modal component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  
  /**
   * Callback when the user attempts to close the modal
   * (e.g., by tapping outside or pressing back)
   */
  onClose: () => void;
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Custom style for the modal container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the modal content
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Whether to add padding to the modal content
   * @default true
   */
  contentPadding?: boolean;
  
  /**
   * Whether to close the modal when tapping outside
   * @default true
   */
  closeOnBackdropPress?: boolean;
  
  /**
   * Whether to close the modal when pressing the hardware back button (Android)
   * @default true
   */
  closeOnBackButton?: boolean;
  
  /**
   * Whether to animate modal appearance/disappearance
   * @default true
   */
  animateTransition?: boolean;
  
  /**
   * Duration of the appearance/disappearance animation in milliseconds
   * @default 300
   */
  animationDuration?: number;
  
  /**
   * Custom backdrop color
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  backdropColor?: string;
  
  /**
   * Whether to render the modal above the status bar
   * @default false
   */
  presentAboveStatusBar?: boolean;
  
  /**
   * ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Whether the modal should span the full width and height of the screen
   * @default false
   */
  fullScreen?: boolean;
  
  /**
   * Position of the modal on screen
   * @default 'center'
   */
  position?: 'top' | 'center' | 'bottom';
  
  /**
   * Whether the modal has a header with a close button
   * @default false
   */
  showHeader?: boolean;
  
  /**
   * Title to display in the header
   */
  title?: string;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function Modal(props: ModalProps): JSX.Element {
  console.warn('Modal implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 