import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
const lightTheme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#FFFFFF',
    cardBackground: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    textInverse: '#FFFFFF',
    error: '#D32F2F',
    success: '#00C853',
    warning: '#FFC107',
    info: '#2196F3',
    border: '#E0E0E0',
  }
};

const darkTheme = {
  colors: {
    primary: '#66BB6A',
    secondary: '#42A5F5',
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textInverse: '#000000',
    error: '#EF5350',
    success: '#4CAF50',
    warning: '#FFD54F',
    info: '#42A5F5',
    border: '#424242',
  }
};

export type Theme = typeof lightTheme;

/**
 * Hook that provides theme colors and responds to system color scheme changes
 */
export function useTheme() {
  // Get system color scheme
  const colorScheme = useColorScheme();
  
  // State to hold the current theme
  const [theme, setTheme] = useState<Theme>(
    colorScheme === 'dark' ? darkTheme : lightTheme
  );
  
  // Update theme when system color scheme changes
  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);
  
  return { theme, isDark: colorScheme === 'dark' };
}

export default useTheme; 