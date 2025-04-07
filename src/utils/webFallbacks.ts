/**
 * Web Fallbacks
 * Provides fallback implementations for native functionality on web
 */

// Default theme values for web platform when the theme provider is not available
export const defaultTheme = {
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
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  dark: false,
};

// Get a safe theme object that works across platforms
export function getSafeTheme(themeResult: any): any {
  if (themeResult && themeResult.theme) {
    return themeResult.theme;
  }
  
  // If the theme is a function (old pattern)
  if (typeof themeResult === 'function') {
    try {
      const result = themeResult();
      if (typeof result === 'function') {
        return result();
      }
      return result;
    } catch (e) {
      console.log('Theme function error:', e);
      return defaultTheme;
    }
  }
  
  return defaultTheme;
}

// Global import to patch all useTheme calls
let isPatched = false;
export function patchThemeSystem() {
  if (isPatched) return;
  
  // Only run this in web environment
  if (typeof window !== 'undefined') {
    console.log('[Web] Patching theme system for web compatibility');
    
    try {
      // Try to import the theme module
      const themeModule = require('@/theme');
      
      // Save the original useTheme
      const originalUseTheme = themeModule.useTheme;
      
      // Override the useTheme function
      themeModule.useTheme = function patchedUseTheme() {
        try {
          // Try to use the original first
          const result = originalUseTheme();
          
          // Provide a safe fallback for nested patterns
          if (typeof result === 'function') {
            console.warn('Using deprecated theme pattern (useTheme()()). Consider updating to use getSafeTheme.');
            
            // Create a function that returns the theme directly
            const safeNestedTheme = () => {
              return () => defaultTheme;
            };
            
            return safeNestedTheme;
          }
          
          return result;
        } catch (e) {
          console.warn('Error in useTheme, using fallback:', e);
          return { theme: defaultTheme };
        }
      };
      
      isPatched = true;
      console.log('[Web] Theme system patched successfully');
    } catch (e) {
      console.error('[Web] Failed to patch theme system:', e);
    }
  }
} 