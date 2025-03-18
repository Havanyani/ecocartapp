import { Theme } from './types';

export const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#2E7D32',
    secondary: '#0277BD',
    accent: '#FF4081',
    error: '#D32F2F',
    warning: '#FFA000',
    success: '#388E3C',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
      inverse: '#FFFFFF'
    },
    border: {
      default: '#E0E0E0',
      focused: '#2E7D32'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999
  },
  isDark: false
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#66BB6A',
    secondary: '#29B6F6',
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#757575',
      inverse: '#212121'
    },
    border: {
      default: '#424242',
      focused: '#66BB6A'
    }
  },
  isDark: true
}; 