/**
 * LazyScreen.tsx
 * 
 * Backward compatibility wrapper for the platform-specific LazyScreen component.
 * This ensures existing code using this component continues to work.
 */

import { Suspense, lazy } from 'react';
import { ActivityIndicator, View } from 'react-native';

export interface LazyScreenProps {
  importFn: () => Promise<{ default: React.ComponentType }>;
  fallback?: React.ReactNode;
}

export function LazyScreen({ importFn, fallback }: LazyScreenProps) {
  const LazyComponent = lazy(importFn);

  return (
    <Suspense fallback={fallback || (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )}>
      <LazyComponent />
    </Suspense>
  );
} 