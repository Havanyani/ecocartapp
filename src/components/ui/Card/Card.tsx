/**
 * Card.tsx
 * 
 * This file defines the shared interface for the Card component across platforms.
 * The actual implementations are in Card.native.tsx and Card.web.tsx.
 */

import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface CardProps {
  /**
   * Content to be rendered inside the card
   */
  children: ReactNode;
  
  /**
   * Additional styles for the card
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Function to call when the card is pressed
   * If provided, the card becomes interactive
   */
  onPress?: () => void;
  
  /**
   * Level of shadow (1-5)
   * 1: Subtle shadow
   * 2: Light shadow (default)
   * 3: Medium shadow
   * 4: Pronounced shadow
   * 5: Heavy shadow
   * @default 2
   */
  shadowLevel?: 1 | 2 | 3 | 4 | 5;
  
  /**
   * Border radius of the card
   * @default 8
   */
  borderRadius?: number;
  
  /**
   * Whether to add padding inside the card
   * @default true
   */
  padded?: boolean;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;
} 