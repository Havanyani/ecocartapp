export { Theme, ThemeColors, ThemeSpacing, ThemeTypography } from '../theme/types';

export interface AppTheme {
  dark: boolean;
  colors: AppColors;
  spacing: AppSpacing;
  typography: AppTypography;
}

export interface AppColors {
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

export interface AppSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface AppTypography {
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

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  notification: string;
  card: string;
  statusBar: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  tabBarBorder: string;
  header: string;
  headerText: string;
  headerBorder: string;
  modal: string;
  modalBackdrop: string;
  modalBorder: string;
  input: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  button: string;
  buttonText: string;
  buttonDisabled: string;
  buttonDisabledText: string;
  link: string;
  linkActive: string;
  divider: string;
  shadow: string;
  overlay: string;
  highlight: string;
  ripple: string;
}

export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
    italic: string;
    mediumItalic: string;
    boldItalic: string;
    lightItalic: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    loose: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    loose: number;
  };
  fontWeight: {
    light: string;
    regular: string;
    medium: string;
    bold: string;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface BorderRadius {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  round: number;
}

export interface Shadows {
  none: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xs: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  sm: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xxl: {
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: BorderRadius;
  shadows: Shadows;
  isDark: boolean;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: {
    primary: string;
    secondary: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
  chartColors: string[];
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}

export interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export interface ThemeStyle {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  shadowColor?: string;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export type ThemeStyleFunction = (theme: Theme) => ThemeStyle;

export interface ThemeStyleObject {
  [key: string]: ThemeStyle | ThemeStyleFunction;
}

export interface ThemeStyleProps {
  style?: ThemeStyle | ThemeStyleObject;
  theme?: Theme;
}

export interface UseThemeStyleResult {
  style: ThemeStyle;
  theme: Theme;
}

export function useThemeStyle(
  style?: ThemeStyle | ThemeStyleObject,
  theme?: Theme
): UseThemeStyleResult; 