import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LazyScreenProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export function LazyScreen({ component, fallback }: LazyScreenProps) {
  const { theme } = useTheme();
  const LazyComponent = lazy(component);

  const defaultFallback = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent />
    </Suspense>
  );
} 