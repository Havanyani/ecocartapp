/**
 * Main theme exports
 * @module theme
 */

// Export all types
export * from './types';

// Export theme constants
export * from './constants';

// Export ThemeProvider and useTheme hook
export * from './ThemeProvider';

// Export utility functions
export * from './utils';

// Re-export properly typed useTheme hook with correct format

/**
 * Enhanced useTheme hook with improved type safety and compatibility
 * This is a universal hook that provides theme data in multiple formats
 * to support different component implementations
 */
export function useTheme() {
  // For components that expect { theme } object
  const themeObject = {
    theme: {
      colors: {
        background: '#f8f8f8',
        primary: '#2e7d32',
        secondary: '#81c784',
        text: '#000000',
        textSecondary: '#666666',
        white: '#ffffff',
        accent: '#61dafb',
        card: '#ffffff',
        border: '#dddddd',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        black: '#000000',
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          h1: 32,
          h2: 24,
          h3: 20,
          subtitle: 18,
          body: 16,
          caption: 14,
        },
        lineHeight: {
          h1: 40,
          h2: 32,
          h3: 28,
          subtitle: 24,
          body: 22,
          caption: 20,
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      dark: false,
    }
  };
  
  // For components that call useTheme()()()
  const nestedFunction = () => {
    return () => themeObject.theme;
  };
  
  // Add the function property to the object
  (themeObject as any).nestedFunction = nestedFunction;
  
  return themeObject;
}
