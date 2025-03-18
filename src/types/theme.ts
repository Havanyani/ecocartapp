/**
 * Theme type definitions
 * @module types/theme
 */

/**
 * Theme colors interface
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  success: string;
  warning: string;
  info: string;
}

/**
 * Typography interface
 */
export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  subtitle1: TextStyle;
  subtitle2: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
}

/**
 * Text style interface
 */
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

/**
 * Theme spacing interface
 */
export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * Theme interface
 */
export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: ThemeSpacing;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    round: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export type ThemeContextValue = Theme; 