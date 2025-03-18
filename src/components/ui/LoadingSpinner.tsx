import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingSpinnerProps {
  testID?: string;
}

export function LoadingSpinner({ testID }: LoadingSpinnerProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 