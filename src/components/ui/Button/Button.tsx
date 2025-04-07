/**
 * Button.tsx
 * 
 * This file defines the shared interface for the Button component across platforms.
 * The actual implementations are in Button.native.tsx and Button.web.tsx.
 */

import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button text content
   */
  label: string;
  
  /**
   * Function to call when button is pressed
   */
  onPress: () => void;
  
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Size variant of the button
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Optional icon to display before the label
   * For React Native: React element
   * For Web: string name of icon or React element
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Optional icon to display after the label
   * For React Native: React element
   * For Web: string name of icon or React element
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Additional styles for the button container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Additional styles for the button text
   */
  textStyle?: StyleProp<TextStyle>;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

// The exports are already declared above, no need to re-export them

