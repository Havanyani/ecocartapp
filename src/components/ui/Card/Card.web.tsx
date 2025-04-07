/**
 * Card.web.tsx
 * 
 * Web-specific implementation of the Card component.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { createShadow } from '../../../utils/styleUtils';
import type { CardProps } from './Card';

export function Card({
  children,
  style,
  onPress,
  shadowLevel = 2,
  borderRadius = 8,
  padded = true,
  testID,
  accessibilityLabel,
}: CardProps) {
  const { theme } = useTheme();
  
  // Web-specific states for interactions
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  // Create shadow based on level and interaction states
  const getShadow = () => {
    // Increase shadow on hover for interactive cards
    const hoverEffect = isHovered && onPress ? 1 : 0;
    // Reduce shadow when pressed
    const pressEffect = isPressed ? -1 : 0;
    
    // Calculate effective shadow level with limits
    const effectiveShadow = Math.max(1, Math.min(5, shadowLevel + hoverEffect + pressEffect));
    
    // Shadow configurations for different levels
    const shadowConfigs = {
      1: { offsetY: 1, opacity: 0.1, radius: 2, elevation: 1 },
      2: { offsetY: 2, opacity: 0.15, radius: 4, elevation: 2 },
      3: { offsetY: 3, opacity: 0.2, radius: 8, elevation: 4 },
      4: { offsetY: 4, opacity: 0.25, radius: 12, elevation: 6 },
      5: { offsetY: 6, opacity: 0.3, radius: 16, elevation: 8 },
    };
    
    return createShadow(shadowConfigs[effectiveShadow]);
  };
  
  const containerStyles = [
    styles.container,
    {
      borderRadius,
      backgroundColor: theme.colors.card,
      ...(padded && { padding: 16 }),
      ...getShadow(),
    },
    // Web-specific styles
    {
      cursor: onPress ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      // Scale effect when pressed
      transform: isPressed && onPress ? [{ scale: 0.98 }] : [],
    },
    style,
  ];
  
  // For interactive cards, wrap in Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={containerStyles}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        // Web-specific accessibility props
        tabIndex={0}
      >
        {children}
      </Pressable>
    );
  }
  
  // For non-interactive cards, use View
  return (
    <View
      style={containerStyles}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="none"
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
}); 