import { Theme, useTheme } from '@/hooks/useTheme';
import { useCallback, useMemo } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
// @ts-ignore - Add color library without type declarations
import Color from 'color';

// Add type declaration for color module
declare module 'color' {
  interface Color {
    lighten(amount: number): Color;
    darken(amount: number): Color;
    alpha(amount: number): Color;
    isLight(): boolean;
    rgb(): Color;
    hex(): string;
    toString(): string;
  }
  export default function(color: string): Color;
}

export interface ColorUtils {
  /**
   * Lighten a color by a percentage (0-100)
   */
  lighten: (color: string, amount: number) => string;
  
  /**
   * Darken a color by a percentage (0-100)
   */
  darken: (color: string, amount: number) => string;
  
  /**
   * Create a transparent version of a color
   */
  alpha: (color: string, amount: number) => string;
  
  /**
   * Create a contrasting color (white or black) based on a background color
   */
  contrast: (backgroundColor: string) => string;
  
  /**
   * Generate a palette from a base color
   */
  generatePalette: (baseColor: string) => {
    light: string;
    lighter: string;
    dark: string;
    darker: string;
    contrastText: string;
  };
}

export interface ThemeActions {
  /**
   * Toggle between light and dark mode
   */
  toggleThemeMode: () => Promise<void>;
  
  /**
   * Set the theme mode explicitly
   */
  setThemeMode: (mode: 'light' | 'dark' | 'system') => Promise<void>;
  
  /**
   * Check if current mode is dark
   */
  isDarkMode: boolean;
  
  /**
   * Check if current mode is system default
   */
  isSystemMode: boolean;
}

export interface UseThemingReturn {
  /**
   * Theme object from useTheme
   */
  theme: Theme;
  
  /**
   * Color manipulation utilities
   */
  colors: ColorUtils;
  
  /**
   * Theme mode actions
   */
  actions: ThemeActions;
}

/**
 * Hook that extends useTheme with color manipulation and theme mode switching
 */
export function useTheming(): UseThemingReturn {
  const { theme, isDark } = useTheme();
  
  // Get stored theme mode
  const [themeMode, setThemeMode] = useAsyncStorage<'light' | 'dark' | 'system'>(
    'theme_mode',
    'system'
  );
  
  // Check if dark mode is active
  const isDarkMode = useMemo(() => {
    if (themeMode === 'system') {
      return isDark;
    }
    return themeMode === 'dark';
  }, [themeMode, isDark]);
  
  // Check if system mode is active
  const isSystemMode = useMemo(() => {
    return themeMode === 'system';
  }, [themeMode]);
  
  // Toggle theme mode
  const toggleThemeMode = useCallback(async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isDarkMode, setThemeMode]);
  
  // Color utilities
  const colorUtils: ColorUtils = useMemo(() => ({
    lighten: (color, amount) => {
      try {
        return Color(color).lighten(amount / 100).hex();
      } catch (err) {
        console.error(`Error lightening color ${color}:`, err);
        return color;
      }
    },
    
    darken: (color, amount) => {
      try {
        return Color(color).darken(amount / 100).hex();
      } catch (err) {
        console.error(`Error darkening color ${color}:`, err);
        return color;
      }
    },
    
    alpha: (color, amount) => {
      try {
        return Color(color).alpha(amount).rgb().toString();
      } catch (err) {
        console.error(`Error setting alpha for color ${color}:`, err);
        return color;
      }
    },
    
    contrast: (backgroundColor) => {
      try {
        // Return white for dark backgrounds, black for light backgrounds
        return Color(backgroundColor).isLight() ? '#000000' : '#FFFFFF';
      } catch (err) {
        console.error(`Error calculating contrast for ${backgroundColor}:`, err);
        return '#000000';
      }
    },
    
    generatePalette: (baseColor) => {
      try {
        const base = Color(baseColor);
        return {
          light: base.lighten(0.2).hex(),
          lighter: base.lighten(0.4).hex(),
          dark: base.darken(0.2).hex(),
          darker: base.darken(0.4).hex(),
          contrastText: base.isLight() ? '#000000' : '#FFFFFF',
        };
      } catch (err) {
        console.error(`Error generating palette for ${baseColor}:`, err);
        return {
          light: baseColor,
          lighter: baseColor,
          dark: baseColor,
          darker: baseColor,
          contrastText: '#000000',
        };
      }
    },
  }), []);
  
  // Theme actions
  const themeActions: ThemeActions = useMemo(() => ({
    toggleThemeMode,
    setThemeMode,
    isDarkMode,
    isSystemMode,
  }), [toggleThemeMode, setThemeMode, isDarkMode, isSystemMode]);
  
  return {
    theme,
    colors: colorUtils,
    actions: themeActions,
  };
} 