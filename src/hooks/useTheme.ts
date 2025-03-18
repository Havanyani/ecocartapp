import { createContext, useContext } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: {
    primary: string;
    secondary: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
    },
  },
  isDark: false,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  toggleTheme: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { defaultTheme, ThemeContext };

