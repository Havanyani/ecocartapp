import { useTheme } from '@/contexts/ThemeContext';
import { SafeStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native';

const THEME_STORAGE_KEY = '@ecocart:theme';

// Define the proper theme context interface with all required properties
interface ThemeContextType {
  theme: AppTheme;
  isDarkMode?: boolean;
  setDarkMode?: (isDark: boolean) => void;
  toggleTheme?: () => void;
  themeAnimation?: Animated.Value;
  useSystemTheme?: boolean;
  setUseSystemTheme?: (useSystem: boolean) => void;
}

interface AppTheme {
  colors: {
    background: string;
    text: string;
    primary: string;
    // Add other properties as needed
  };
}

interface ThemeSwitcherProps {
  style?: ViewStyle;
  compact?: boolean;
}

export function ThemeSwitcher({ style, compact = false }: ThemeSwitcherProps) {
  const systemColorScheme = useColorScheme();
  const [useSystemTheme, setUseSystemTheme] = React.useState(true);
  const rotationValue = React.useRef(new Animated.Value(0)).current;
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  // Get theme context with proper error handling for web
  const themeContext = useTheme() as ThemeContextType;
  const { theme, isDarkMode } = themeContext;
  
  // Safely access functions that might be undefined in certain environments
  const setDarkMode = (isDark: boolean) => {
    try {
      if (typeof themeContext.setDarkMode === 'function') {
        themeContext.setDarkMode(isDark);
      } else {
        console.warn('setDarkMode is not available');
      }
    } catch (error) {
      console.error('Error setting dark mode:', error);
    }
  };
  
  const toggleTheme = () => {
    try {
      if (typeof themeContext.toggleTheme === 'function') {
        themeContext.toggleTheme();
      } else {
        // Fallback implementation if toggleTheme is not available
        setDarkMode(!isDarkMode);
      }
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };
  
  // Load theme preferences on mount
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Update theme when system theme changes if using system theme
  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      try {
        setDarkMode(systemColorScheme === 'dark');
      } catch (error) {
        console.error('Error applying system theme:', error);
      }
    }
  }, [systemColorScheme, useSystemTheme]);

  // Load saved theme preferences
  const loadThemePreferences = async () => {
    try {
      const savedPreferences = await SafeStorage.getItem(THEME_STORAGE_KEY);
      if (savedPreferences) {
        const { isDark, useSystem } = JSON.parse(savedPreferences);
        setUseSystemTheme(useSystem);
        
        if (!useSystem) {
          setDarkMode(isDark);
        }
      }
    } catch (error) {
      console.error('Failed to load theme preferences:', error);
    }
  };

  // Save theme preferences
  const saveThemePreferences = async (isDark: boolean, useSystem: boolean) => {
    try {
      await SafeStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ isDark, useSystem })
      );
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
    }
  };

  // Handle theme toggle
  const handleToggleTheme = () => {
    try {
      if (useSystemTheme) {
        // First, switch to manual mode
        setUseSystemTheme(false);
        saveThemePreferences(!isDarkMode, false);
      } else {
        // Just toggle the theme
        saveThemePreferences(!isDarkMode, false);
      }
      
      // Animate the toggle
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 150,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotationValue, {
          toValue: isDarkMode ? 0 : 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start();
      
      toggleTheme();
    } catch (error) {
      console.error('Error in theme toggle:', error);
    }
  };

  // Handle system theme toggle
  const handleSystemThemeToggle = (value: boolean) => {
    try {
      setUseSystemTheme(value);
      
      if (value && systemColorScheme) {
        // If switching to system theme, apply system preference
        setDarkMode(systemColorScheme === 'dark');
      }
      
      saveThemePreferences(isDarkMode ?? false, value);
    } catch (error) {
      console.error('Error in system theme toggle:', error);
    }
  };

  // Rotation interpolation
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // For compact version (icon only)
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={handleToggleTheme}
        accessibilityLabel={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        accessibilityRole="button"
      >
        <Animated.View style={{ transform: [{ rotate: rotation }, { scale: scaleValue }] }}>
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color={theme?.colors?.text || '#000000'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Full version with system theme option
  return (
    <View style={[styles.container, style]}>
      <View style={styles.themeRow}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme?.colors?.text || '#000000' }]}>
            Dark Mode
          </Text>
          <Animated.View 
            style={{ 
              transform: [{ rotate: rotation }, { scale: scaleValue }],
              marginHorizontal: 8
            }}
          >
            <Ionicons
              name={isDarkMode ? "moon" : "sunny"}
              size={20}
              color={theme?.colors?.text || '#000000'}
            />
          </Animated.View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggleTheme}
          trackColor={{ 
            false: Platform.OS === 'ios' ? '#e9e9eb' : '#d1d1d1', 
            true: (theme?.colors?.primary || '#007AFF') + '80' 
          }}
          thumbColor={
            Platform.OS === 'ios' 
              ? '#FFFFFF'
              : isDarkMode 
                ? theme?.colors?.primary || '#007AFF'
                : '#f4f3f4'
          }
          ios_backgroundColor="#e9e9eb"
        />
      </View>

      <View style={styles.themeRow}>
        <Text style={[styles.label, { color: theme?.colors?.text || '#000000' }]}>
          Use device theme
        </Text>
        <Switch
          value={useSystemTheme}
          onValueChange={handleSystemThemeToggle}
          trackColor={{ 
            false: Platform.OS === 'ios' ? '#e9e9eb' : '#d1d1d1', 
            true: (theme?.colors?.primary || '#007AFF') + '80' 
          }}
          thumbColor={
            Platform.OS === 'ios' 
              ? '#FFFFFF'
              : useSystemTheme 
                ? theme?.colors?.primary || '#007AFF'
                : '#f4f3f4'
          }
          ios_backgroundColor="#e9e9eb"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 16
  },
  compactButton: {
    padding: 8,
    borderRadius: 20,
  }
});

export default ThemeSwitcher; 