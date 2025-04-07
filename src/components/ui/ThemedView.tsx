import { useTheme } from '@/theme';
import React from 'react';
import { View, ViewProps } from 'react-native';

export function ThemedView(props: ViewProps): JSX.Element {
  const theme = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.theme.colors.background }, props.style]} />;
} 