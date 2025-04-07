/**
 * Card.native.tsx
 * 
 * Native-specific implementation of the Card component.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  
  // Create shadow based on level
  const getShadow = () => {
    // Shadow configurations for different levels
    const shadowConfigs = {
      1: { offsetY: 1, opacity: 0.1, radius: 2, elevation: 1 },
      2: { offsetY: 2, opacity: 0.15, radius: 4, elevation: 2 },
      3: { offsetY: 3, opacity: 0.2, radius: 8, elevation: 4 },
      4: { offsetY: 4, opacity: 0.25, radius: 12, elevation: 6 },
      5: { offsetY: 6, opacity: 0.3, radius: 16, elevation: 8 },
    };
    
    return createShadow(shadowConfigs[shadowLevel]);
  };
  
  const containerStyles = [
    styles.container,
    {
      borderRadius,
      backgroundColor: theme.colors.card,
      ...(padded && { padding: 16 }),
      ...getShadow(),
    },
    style,
  ];
  
  // For interactive cards, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={containerStyles}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  // For non-interactive cards, use View
  return (
    <View
      style={containerStyles}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
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