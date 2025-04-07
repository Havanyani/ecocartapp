import { getFontSize, getLineHeight, useTheme } from '@/theme';
import { getSafeTheme } from '@/utils/webFallbacks';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'caption';
}

export function Text({ variant = 'body', style, ...props }: TextProps) {
  // Get theme with fallback helper
  const themeResult = useTheme();
  const theme = getSafeTheme(themeResult);

  const styles = StyleSheet.create({
    base: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily,
    },
    h1: {
      fontSize: getFontSize(theme, 'h1'),
      lineHeight: getLineHeight(theme, 'h1'),
      fontWeight: 'bold',
    },
    h2: {
      fontSize: getFontSize(theme, 'h2'),
      lineHeight: getLineHeight(theme, 'h2'),
      fontWeight: 'bold',
    },
    h3: {
      fontSize: getFontSize(theme, 'h3'),
      lineHeight: getLineHeight(theme, 'h3'),
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: getFontSize(theme, 'subtitle'),
      lineHeight: getLineHeight(theme, 'subtitle'),
      fontWeight: '600',
    },
    body: {
      fontSize: getFontSize(theme, 'body'),
      lineHeight: getLineHeight(theme, 'body'),
    },
    caption: {
      fontSize: getFontSize(theme, 'caption'),
      lineHeight: getLineHeight(theme, 'caption'),
      color: theme.colors.textSecondary,
    },
  });

  return (
    <RNText
      style={[styles.base, styles[variant], style]}
      {...props}
    />
  );
} 