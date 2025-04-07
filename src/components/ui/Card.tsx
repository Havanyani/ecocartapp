import { useTheme } from '@/theme';
import { createShadow } from '@/utils/styleUtils';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const themeFunc = useTheme();
  const theme = themeFunc();
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.textSecondary,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.background,
          ...createShadow({
            offsetY: 2,
            opacity: 0.1,
            radius: 8,
            elevation: 3
          }),
        };
      default:
        return {
          backgroundColor: theme.colors.background,
        };
    }
  };

  return (
    <View 
      style={[
        styles.card,
        getVariantStyle(),
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
}); 