/**
 * Theme constants including light and dark theme definitions
 * @module theme/constants
 */

import { Theme } from './types';

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    secondary: '#03DAC6',
    accent: '#03DAC6',
    background: '#F6F6F6',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FB8C00',
    error: '#F44336',
    info: '#2196F3',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      h1: 32,
      h2: 24,
      h3: 20,
      subtitle: 16,
      body: 14,
      caption: 12,
    },
    lineHeight: {
      h1: 40,
      h2: 32,
      h3: 28,
      subtitle: 24,
      body: 20,
      caption: 16,
    },
  }
};

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2C2C2C',
  }
}; 