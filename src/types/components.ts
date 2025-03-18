/**
 * Component type definitions
 * @module types/components
 */

import { ViewStyle } from 'react-native';
import { Theme } from './theme';

/**
 * Base component props interface
 */
export interface BaseComponentProps {
  testID?: string;
  style?: ViewStyle;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Layout props interface
 */
export interface LayoutProps extends BaseComponentProps {
  padding?: keyof Theme['spacing'];
  margin?: keyof Theme['spacing'];
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: keyof Theme['spacing'];
}

/**
 * Style props interface
 */
export interface StyleProps {
  backgroundColor?: keyof Theme['colors'];
  borderRadius?: keyof Theme['borderRadius'];
  shadow?: keyof Theme['shadows'];
  typography?: keyof Theme['typography'];
  color?: keyof Theme['colors']['text'];
}

/**
 * Button props interface
 */
export interface ButtonProps extends BaseComponentProps, StyleProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Text input props interface
 */
export interface TextInputProps extends BaseComponentProps, StyleProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  label?: string;
  helperText?: string;
}

/**
 * Card props interface
 */
export interface CardProps extends BaseComponentProps, StyleProps {
  onPress?: () => void;
  elevation?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * List item props interface
 */
export interface ListItemProps extends BaseComponentProps, StyleProps {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  divider?: boolean;
} 