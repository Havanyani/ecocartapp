// This is our single source of truth for theme context
import type { ThemeColors, ThemeContextType } from '@/hooks/useTheme';
import React, { createContext, useCallback, useState } from 'react';

const lightColors: ThemeColors = {
  primary: '#2e7d32',
  secondary: '#81c784',
  background: '#f8f8f8',
  surface: '#ffffff',
  error: '#ff3d00',
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
};

const darkColors: ThemeColors = {
  primary: '#4caf50',
  secondary: '#a5d6a7',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#ff6e40',
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
  },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value: ThemeContextType = {
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };

