/**
 * NavigationLink.native.tsx
 * 
 * Native-specific implementation of the NavigationLink component.
 * Uses React Navigation's useNavigation hook for navigation on native platforms.
 */

import {
    NavigationProp,
    ParamListBase,
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { NavigationLinkProps } from './NavigationLink';

export function NavigationLink({
  to,
  children,
  params = {},
  style,
  textStyle,
  onPress,
  isActive: propIsActive,
  activeStyle,
  activeTextStyle,
  replace = false,
  accessibilityLabel,
  testID,
}: NavigationLinkProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();
  const { theme } = useTheme();
  
  // Determine if this link is for the current route
  const isActive = propIsActive !== undefined 
    ? propIsActive 
    : route.name === to;
  
  // Handle navigation
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    
    // Determine if the destination is a path (e.g., "/home") or a route name
    const isPath = to.startsWith('/');
    
    if (isPath) {
      // For path-based navigation (rare in native, but useful for consistency with web)
      const routeName = to.substring(1); // Remove leading slash
      
      if (replace) {
        navigation.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        });
      } else {
        navigation.navigate(routeName, params);
      }
    } else {
      // For name-based navigation (common in React Navigation)
      if (replace) {
        navigation.reset({
          index: 0,
          routes: [{ name: to, params }],
        });
      } else {
        navigation.navigate(to, params);
      }
    }
  };
  
  // If children is a string, wrap it in a Text component
  const content = typeof children === 'string' 
    ? (
        <Text 
          style={[
            styles.text, 
            { color: theme.colors.primary },
            textStyle,
            isActive && styles.activeText,
            isActive && { color: theme.colors.primaryDark },
            isActive && activeTextStyle,
          ]}
        >
          {children}
        </Text>
      )
    : children;
  
  return (
    <TouchableOpacity
      style={[
        styles.link,
        style,
        isActive && styles.activeLink,
        isActive && activeStyle,
      ]}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    padding: 8,
  },
  activeLink: {
    // Default active style
  },
  text: {
    fontSize: 16,
  },
  activeText: {
    fontWeight: 'bold',
  },
}); 