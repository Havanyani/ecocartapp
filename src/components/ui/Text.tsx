import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'caption';
}

export function Text({ variant = 'body', style, ...props }: TextProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    base: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily,
    },
    h1: {
      fontSize: theme.typography.fontSize.h1,
      lineHeight: theme.typography.lineHeight.h1,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: theme.typography.fontSize.h2,
      lineHeight: theme.typography.lineHeight.h2,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: theme.typography.fontSize.h3,
      lineHeight: theme.typography.lineHeight.h3,
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.subtitle,
      lineHeight: theme.typography.lineHeight.subtitle,
      fontWeight: '600',
    },
    body: {
      fontSize: theme.typography.fontSize.body,
      lineHeight: theme.typography.lineHeight.body,
    },
    caption: {
      fontSize: theme.typography.fontSize.caption,
      lineHeight: theme.typography.lineHeight.caption,
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