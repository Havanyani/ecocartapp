import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function ThemedView(props: ViewProps): JSX.Element {
  const { theme } = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.colors.background }, props.style]} />;
} 