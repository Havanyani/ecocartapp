import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  style?: any;
}

export function ThemedText({ style, ...props }: ThemedTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        styles.text,
        {
          color: theme.colors.text.primary,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
}); 