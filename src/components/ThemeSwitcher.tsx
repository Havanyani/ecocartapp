import { useTheme } from '@/theme';
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
  theme: {
    colors: {
      background: string;
      text: string;
      primary: string;
      // Add other properties as needed
    };
    dark: boolean;
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

  // Get theme from unified theme system
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const isDarkMode = theme.dark;
  
  // ThemeSwitcher now only stores preferences, doesn't actually change the theme
  // since theme is controlled at the application level
  
  // Load theme preferences on mount
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Load saved theme preferences
  const loadThemePreferences = async () => {
    try {
      const savedPreferences = await SafeStorage.getItem(THEME_STORAGE_KEY);
      if (savedPreferences) {
        const { useSystem } = JSON.parse(savedPreferences);
        setUseSystemTheme(useSystem);
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

  // Handle theme toggle animation
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
      
      // Note: The actual theme change is now handled at the app level
      // We're just logging a message here for demonstration
      console.log('Theme toggle clicked - theme should change at app level');
    } catch (error) {
      console.error('Error in theme toggle:', error);
    }
  };

  // Handle system theme toggle
  const handleSystemThemeToggle = (value: boolean) => {
    try {
      setUseSystemTheme(value);
      saveThemePreferences(isDarkMode, value);
      console.log('System theme toggle: ' + value);
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
            color={theme.colors.text}
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
          <Text style={[styles.label, { color: theme.colors.text }]}>
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
              color={theme.colors.text}
            />
          </Animated.View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggleTheme}
          trackColor={{ 
            false: Platform.OS === 'ios' ? '#e9e9eb' : '#d1d1d1', 
            true: (theme.colors.primary) + '80' 
          }}
          thumbColor={
            Platform.OS === 'ios' 
              ? '#FFFFFF'
              : isDarkMode 
                ? theme.colors.primary
                : '#f4f3f4'
          }
          ios_backgroundColor="#e9e9eb"
        />
      </View>

      <View style={styles.themeRow}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Use device theme
        </Text>
        <Switch
          value={useSystemTheme}
          onValueChange={handleSystemThemeToggle}
          trackColor={{ 
            false: Platform.OS === 'ios' ? '#e9e9eb' : '#d1d1d1', 
            true: (theme.colors.primary) + '80' 
          }}
          thumbColor={
            Platform.OS === 'ios' 
              ? '#FFFFFF'
              : useSystemTheme 
                ? theme.colors.primary
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