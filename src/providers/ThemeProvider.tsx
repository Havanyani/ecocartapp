import { AppTheme } from '@/types/theme';
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextValue {
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const defaultTheme: AppTheme = {
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
  },
};

const darkColors: Partial<AppTheme['colors']> = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2C2C2C',
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const theme: AppTheme = {
    ...defaultTheme,
    dark: colorScheme === 'dark',
    colors: {
      ...defaultTheme.colors,
      ...(colorScheme === 'dark' ? darkColors : {}),
    },
  };

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 