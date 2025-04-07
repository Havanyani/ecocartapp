# Performance Optimizations Documentation

This document covers performance optimization techniques for navigation in EcoCart using Expo Router.

## Overview

EcoCart implements various performance optimization techniques to ensure smooth navigation and optimal app performance.

## Route Preloading

### 1. Smart Route Preloading

```typescript
// utils/routePreloading.ts
import { useRouter } from 'expo-router';

interface RouteConfig {
  priority: 1 | 2 | 3;
  dependencies?: string[];
  preloadCondition?: () => boolean;
}

const CRITICAL_ROUTES: Record<string, RouteConfig> = {
  '/': { priority: 1 },
  '/materials': { priority: 1 },
  '/collections': { priority: 1 },
  '/community': { priority: 2 },
  '/profile': { priority: 2 },
  '/auth/login': { priority: 1 },
  '/auth/signup': { priority: 2 },
};

export function useRoutePreloading() {
  const router = useRouter();
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  const preloadRoute = useCallback(async (route: string) => {
    if (preloadedRoutes.has(route)) return;

    try {
      await router.push(route);
      await router.back();
      setPreloadedRoutes(prev => new Set(prev).add(route));
    } catch (error) {
      console.error(`Failed to preload route: ${route}`, error);
    }
  }, [router, preloadedRoutes]);

  const preloadCriticalRoutes = useCallback(async () => {
    const routes = Object.entries(CRITICAL_ROUTES)
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([route]) => route);

    for (const route of routes) {
      await preloadRoute(route);
    }
  }, [preloadRoute]);

  return {
    preloadRoute,
    preloadCriticalRoutes,
    preloadedRoutes
  };
}
```

### 2. Adjacent Route Preloading

```typescript
// utils/adjacentRoutePreloading.ts
import { useRouter } from 'expo-router';

const ADJACENT_ROUTES: Record<string, string[]> = {
  '/materials': ['/material-details', '/ar-scan'],
  '/collections': ['/collection-details'],
  '/profile': ['/settings', '/edit-profile']
};

export function useAdjacentRoutePreloading() {
  const router = useRouter();
  const { preloadRoute } = useRoutePreloading();

  const preloadAdjacentRoutes = useCallback(async (currentRoute: string) => {
    const adjacentRoutes = ADJACENT_ROUTES[currentRoute] || [];
    await Promise.all(adjacentRoutes.map(route => preloadRoute(route)));
  }, [preloadRoute]);

  return { preloadAdjacentRoutes };
}
```

## Screen Optimization

### 1. Lazy Loading

```typescript
// components/LazyScreen.tsx
import { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LazyScreenProps {
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

// Usage in route
export default function MaterialDetailsScreen() {
  return (
    <LazyScreen
      importFn={() => import('@/screens/materials/MaterialDetailsScreen')}
    />
  );
}
```

### 2. Screen Caching

```typescript
// hooks/useScreenCache.ts
import { useCallback, useRef } from 'react';

export function useScreenCache<T>() {
  const cache = useRef<Map<string, T>>(new Map());

  const getCachedData = useCallback((key: string) => {
    return cache.current.get(key);
  }, []);

  const setCachedData = useCallback((key: string, data: T) => {
    cache.current.set(key, data);
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
}

// Usage in screen
export default function MaterialListScreen() {
  const { getCachedData, setCachedData } = useScreenCache<Material[]>();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const cachedData = getCachedData(id as string);
    if (cachedData) {
      setMaterials(cachedData);
    } else {
      loadMaterials(id as string).then(data => {
        setCachedData(id as string, data);
        setMaterials(data);
      });
    }
  }, [id]);
}
```

## Navigation Optimization

### 1. Navigation State Management

```typescript
// hooks/useNavigationState.ts
import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';

export function useNavigationState() {
  const router = useRouter();
  const navigationState = useRef({
    isNavigating: false,
    lastNavigationTime: 0,
    navigationQueue: [] as Array<() => void>
  });

  const navigate = useCallback(async (route: string) => {
    if (navigationState.current.isNavigating) {
      return new Promise<void>((resolve) => {
        navigationState.current.navigationQueue.push(() => {
          router.push(route).then(resolve);
        });
      });
    }

    navigationState.current.isNavigating = true;
    navigationState.current.lastNavigationTime = Date.now();

    try {
      await router.push(route);
    } finally {
      navigationState.current.isNavigating = false;
      const nextNavigation = navigationState.current.navigationQueue.shift();
      if (nextNavigation) {
        nextNavigation();
      }
    }
  }, [router]);

  return { navigate };
}
```

### 2. Transition Optimization

```typescript
// hooks/useTransitionOptimization.ts
import { useCallback, useEffect } from 'react';
import { Animated } from 'react-native';

export function useTransitionOptimization() {
  const transitionAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback((toValue: number) => {
    Animated.timing(transitionAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [transitionAnim]);

  useEffect(() => {
    animateTransition(1);
    return () => animateTransition(0);
  }, [animateTransition]);

  return {
    transitionAnim
  };
}

// Usage in screen
export default function MaterialDetailsScreen() {
  const { transitionAnim } = useTransitionOptimization();

  return (
    <Animated.View style={{
      opacity: transitionAnim,
      transform: [{
        translateY: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }]
    }}>
      {/* Screen content */}
    </Animated.View>
  );
}
```

## Memory Management

### 1. Screen Cleanup

```typescript
// hooks/useScreenCleanup.ts
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function useScreenCleanup(cleanupFn: () => void) {
  const router = useRouter();

  useEffect(() => {
    const subscription = router.addListener('beforeRemove', () => {
      cleanupFn();
    });

    return () => {
      subscription.remove();
      cleanupFn();
    };
  }, [cleanupFn]);
}

// Usage in screen
export default function ARScanScreen() {
  useScreenCleanup(() => {
    // Cleanup AR resources
    cleanupARResources();
  });

  return (
    <View>
      {/* AR scanning content */}
    </View>
  );
}
```

### 2. Resource Management

```typescript
// hooks/useResourceManagement.ts
import { useCallback, useRef } from 'react';

export function useResourceManagement() {
  const resources = useRef<Set<{ dispose: () => void }>>(new Set());

  const registerResource = useCallback((resource: { dispose: () => void }) => {
    resources.current.add(resource);
  }, []);

  const disposeResources = useCallback(() => {
    resources.current.forEach(resource => resource.dispose());
    resources.current.clear();
  }, []);

  return {
    registerResource,
    disposeResources
  };
}

// Usage in component
export function ARComponent() {
  const { registerResource, disposeResources } = useResourceManagement();

  useEffect(() => {
    const arSession = createARSession();
    registerResource(arSession);

    return () => {
      disposeResources();
    };
  }, []);
}
```

## Best Practices

1. **Route Preloading**
   - Preload critical routes on app start
   - Preload adjacent routes based on user behavior
   - Implement proper error handling

2. **Screen Optimization**
   - Use lazy loading for non-critical screens
   - Implement proper caching strategies
   - Handle loading states gracefully

3. **Navigation Optimization**
   - Manage navigation state efficiently
   - Optimize transitions
   - Handle navigation errors

4. **Memory Management**
   - Clean up resources properly
   - Handle component unmounting
   - Implement proper caching

## Common Issues and Solutions

1. **Performance Issues**
   - Monitor navigation performance
   - Implement proper caching
   - Optimize resource usage

2. **Memory Leaks**
   - Clean up resources properly
   - Handle component unmounting
   - Implement proper caching

3. **Navigation Lag**
   - Preload critical routes
   - Optimize transitions
   - Handle navigation state 