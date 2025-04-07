/**
 * Unified theme type definitions
 * @module theme/types
 */

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    h1: number;
    h2: number;
    h3: number;
    subtitle: number;
    body: number;
    caption: number;
  };
  lineHeight: {
    h1: number;
    h2: number;
    h3: number;
    subtitle: number;
    body: number;
    caption: number;
  };
}

export interface ThemeRadii {
  none: number;
  sm: number;
  md: number;
  lg: number;
  full: number;
}

export type ThemeContextValue = Theme | null; 