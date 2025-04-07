/**
 * TextField.tsx
 * 
 * Shared interface for the TextField component.
 * This file defines the props and types used by both native and web implementations.
 */

import React from 'react';
import { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

export type TextFieldVariant = 'outlined' | 'filled' | 'underlined';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /**
   * Label text to display
   */
  label?: string;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Error message to display (also changes the input to error state)
   */
  error?: string;
  
  /**
   * Callback for when the input is focused
   */
  onFocus?: () => void;
  
  /**
   * Callback for when the input loses focus
   */
  onBlur?: () => void;
  
  /**
   * Input value
   */
  value?: string;
  
  /**
   * Default value for uncontrolled components
   */
  defaultValue?: string;
  
  /**
   * Callback for when the input value changes
   */
  onChangeText?: (text: string) => void;
  
  /**
   * Visual variant of the text field
   * @default 'outlined'
   */
  variant?: TextFieldVariant;
  
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Leading icon to display (component or element)
   */
  leadingIcon?: React.ReactNode;
  
  /**
   * Trailing icon to display (component or element)
   */
  trailingIcon?: React.ReactNode;
  
  /**
   * Custom style for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the input
   */
  inputStyle?: StyleProp<TextStyle>;
  
  /**
   * Custom style for the label
   */
  labelStyle?: StyleProp<TextStyle>;
  
  /**
   * Whether the input is required
   * @default false
   */
  required?: boolean;
  
  /**
   * Whether to show the character count
   * @default false
   */
  showCharacterCount?: boolean;
  
  /**
   * Maximum number of characters allowed
   */
  maxLength?: number;
  
  /**
   * ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

// Placeholder implementation that will be overridden by platform-specific versions
export function TextField(props: TextFieldProps): JSX.Element {
  console.warn('TextField implementation not found. Did you forget to import the platform-specific version?');
  return null as any;
} 