# Performance Optimization Developer Guide

This guide provides practical steps to implement performance optimizations in the EcoCart app.

## Table of Contents

1. [Introduction](#introduction)
2. [Performance Audit](#performance-audit)
3. [Startup Optimization](#startup-optimization)
4. [Image Optimization](#image-optimization)
5. [Code Splitting](#code-splitting)
6. [UI Rendering Optimization](#ui-rendering-optimization)
7. [Network Optimization](#network-optimization)
8. [Performance Testing](#performance-testing)
9. [Monitoring and Analytics](#monitoring-and-analytics)
10. [Troubleshooting](#troubleshooting)

## Introduction

Performance optimization is critical for delivering a smooth user experience. This guide covers practical techniques to implement in your EcoCart development workflow.

## Performance Audit

Before implementing optimizations, conduct a performance audit:

1. **Measure Current Performance**
   ```bash
   # Install Expo DevTools
   npx expo-cli install expo-dev-tools
   
   # Run performance profiling
   npx react-native start --experimental-debugger
   ```

2. **Identify Bottlenecks**
   - Use React DevTools Profiler
   - Look for components with long render times
   - Check for memory leaks
   - Identify network bottlenecks

3. **Set Performance Targets**
   - App startup under 2 seconds
   - 60fps scrolling and animations
   - First Contentful Paint under 1.5 seconds
   - Time To Interactive under 3 seconds

## Startup Optimization

### 1. Implement App Initialization Wrapper

```tsx
// In your App.tsx
import AppInitializationWrapper from '@/components/AppInitializationWrapper';

export default function App() {
  return (
    <AppInitializationWrapper>
      <MainApp />
    </AppInitializationWrapper>
  );
}
```

### 2. Configure Splash Screen

```js
// In app.config.js
export default {
  expo: {
    // ... other config
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    // Add hooks for splash screen management
    hooks: {
      postPublish: [
        {
          file: 'expo-splash-screen',
          config: {
            preventAutoHide: true
          }
        }
      ]
    }
  }
};
```

### 3. Implement Asset Preloading

```tsx
// In AppInitializer.ts
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

async function loadFonts() {
  await Font.loadAsync({
    'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });
}

async function preloadImages() {
  const images = [
    require('@/assets/images/logo.png'),
    require('@/assets/icons/home.png'),
  ];
  
  await Promise.all(images.map(image => Asset.fromModule(image).downloadAsync()));
}
```

### 4. Implement Progressive App Loading

```tsx
// In AppLoadingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';

const AppLoadingScreen = ({ progress, message, isFinished }) => {
  const opacity = useSharedValue(1);
  
  React.useEffect(() => {
    if (isFinished) {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isFinished]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ActivityIndicator size="large" color="#06C167" />
      <Text style={styles.message}>{message}</Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Styles implementation
});
```

## Image Optimization

### 1. Use OptimizedImage Component

```tsx
// Usage example
import OptimizedImage from '@/components/OptimizedImage';

function ProductCard({ product }) {
  return (
    <View style={styles.card}>
      <OptimizedImage 
        source={{ uri: product.imageUrl }}
        placeholder={require('@/assets/images/placeholder.png')}
        blurhash={product.imageBlurHash}
        contentFit="cover"
        style={styles.productImage}
        lazyLoad={true}
      />
      <Text>{product.name}</Text>
    </View>
  );
}
```

### 2. Configure Image Caching

```tsx
// In your app initialization
import { configureImageCaching } from '@/utils/performance/imageOptimizations';

// Call during app initialization
configureImageCaching({
  memorySize: 50, // MB for memory cache
  diskSize: 200,  // MB for disk cache
  ttl: 24 * 60 * 60 * 1000, // 24 hours in ms
});
```

### 3. Generate Blurhash Values

Set up a pre-build script to generate blurhash values for your images:

```js
// scripts/generate-blurhashes.js
const { encode } = require('blurhash');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const path = require('path');

// Implementation details...
// This script would scan image assets and generate blurhash values
```

## Code Splitting

### 1. Use LazyScreen for Route-based Code Splitting

```tsx
// In your navigator file
import createLazyScreen from '@/components/LazyScreen';

const ProfileScreen = createLazyScreen(
  'ProfileScreen',
  () => import('@/screens/profile/ProfileScreen'),
  { preload: false }
);

const SettingsScreen = createLazyScreen(
  'SettingsScreen',
  () => import('@/screens/settings/SettingsScreen'),
  { preload: false }
);

// In navigator
<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
  <Stack.Screen name="Settings" component={SettingsScreen} />
</Stack.Navigator>
```

### 2. Implement Preloading Strategy

```tsx
// In a component where you might navigate to other screens
import BundleSplitter from '@/utils/performance/BundleSplitter';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  
  // Preload Profile screen when user hovers or starts interacting with profile button
  const handleProfileButtonHover = () => {
    BundleSplitter.preloadComponent('ProfileScreen');
  };
  
  // Navigate and ensure screen is loaded
  const navigateToProfile = async () => {
    await BundleSplitter.preloadComponent('ProfileScreen');
    navigation.navigate('Profile');
  };
  
  return (
    // Component implementation
  );
}
```

## UI Rendering Optimization

### 1. Use Virtualized Lists

```tsx
import { FlatList } from 'react-native';

function ProductList({ products }) {
  const renderItem = ({ item }) => (
    <ProductCard product={item} />
  );
  
  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: 120, // height of item
        offset: 120 * index,
        index,
      })}
    />
  );
}
```

### 2. Implement Component Memoization

```tsx
import React from 'react';

const ProductCard = React.memo(function ProductCard({ product }) {
  return (
    // Component implementation
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price;
});
```

### 3. Optimize Re-renders

```tsx
import { useCallback, useMemo } from 'react';

function ShoppingCart({ items, onUpdateQuantity }) {
  // Memoize derived data
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);
  
  // Memoize callbacks
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    onUpdateQuantity(itemId, newQuantity);
  }, [onUpdateQuantity]);
  
  return (
    // Component implementation
  );
}
```

## Network Optimization

### 1. Implement Request Caching

```tsx
// In API service
import { createApiWithCache } from '@/utils/api/createApiWithCache';

const api = createApiWithCache({
  baseURL: 'https://api.ecocart.com',
  cacheTTL: 5 * 60 * 1000, // 5 minutes in ms
  excludePaths: ['/auth', '/checkout'],
});

// Usage
const fetchProducts = async () => {
  const result = await api.get('/products', { useCachedResponse: true });
  return result.data;
};
```

### 2. Implement Offline Support

```tsx
// In a data service file
import { NetInfo } from '@react-native-community/netinfo';
import { storeOfflineAction, processOfflineQueue } from '@/utils/offlineSync';

const submitOrder = async (order) => {
  const isConnected = await NetInfo.fetch().then(state => state.isConnected);
  
  if (!isConnected) {
    // Store for later processing
    await storeOfflineAction({
      type: 'SUBMIT_ORDER',
      payload: order,
      timestamp: Date.now()
    });
    return { success: true, isOffline: true };
  }
  
  // Normal processing
  try {
    const response = await api.post('/orders', order);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Process queue when connection restored
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processOfflineQueue();
  }
});
```

## Performance Testing

### 1. Write Unit Tests with Performance Assertions

```tsx
// In OptimizedImage.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import OptimizedImage from '@/components/OptimizedImage';
import { measurePerformance } from '@/utils/testing/performanceUtils';

describe('OptimizedImage', () => {
  it('renders placeholder while loading image', async () => {
    const { getByTestId } = render(
      <OptimizedImage
        source={{ uri: 'https://example.com/test.jpg' }}
        placeholder={require('@/assets/images/placeholder.png')}
        testID="test-image"
      />
    );
    
    // Verify placeholder is shown
    expect(getByTestId('test-image-placeholder')).toBeTruthy();
    
    // Wait for image to load
    await waitFor(() => {
      expect(getByTestId('test-image-loaded')).toBeTruthy();
    });
  });
  
  it('loads within acceptable time', async () => {
    const { result, duration } = await measurePerformance(() => {
      render(
        <OptimizedImage
          source={{ uri: 'https://example.com/test.jpg' }}
          testID="test-image"
        />
      );
    });
    
    expect(duration).toBeLessThan(50); // Render should take less than 50ms
    expect(result.getByTestId('test-image')).toBeTruthy();
  });
});
```

### 2. Implement E2E Tests for Critical Flows

```typescript
// In appInitialization.e2e.ts
import { device, element, by } from 'detox';

describe('App Initialization', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('initializes within acceptable time', async () => {
    // Wait for app to initialize and measure time
    const startTime = Date.now();
    await element(by.id('home-screen')).waitForDisplayed({ timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    // Verify initialization time is acceptable
    if (loadTime > 5000) {
      throw new Error(`App initialization took too long: ${loadTime}ms`);
    }
  });
  
  it('handles initialization in offline mode', async () => {
    // Test app initialization in offline mode
    await device.launchApp({
      newInstance: true, 
      launchArgs: { isOfflineMode: 'true' }
    });
    
    // Verify app loads in offline mode
    await element(by.id('offline-indicator')).waitForDisplayed({ timeout: 5000 });
    await element(by.id('home-screen')).waitForDisplayed({ timeout: 5000 });
  });
});
```

### 3. Set Up Performance Monitoring

```tsx
// In PerformanceMonitor.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

export const PerformanceMonitor = ({ visible = __DEV__ }) => {
  const { metrics, startTracking, stopTracking } = usePerformanceMetrics();
  
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);
  
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>FPS: {metrics.fps.toFixed(1)}</Text>
      <Text style={styles.label}>Memory: {metrics.memory}MB</Text>
      <Text style={styles.label}>CPU: {metrics.cpu}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Style implementation
});
```

## Monitoring and Analytics

### 1. Implement Performance Tracking

```tsx
// In PerformanceTracking.ts
import * as Sentry from '@sentry/react-native';

export function trackOperation(name, operation) {
  const startTime = performance.now();
  try {
    return operation();
  } finally {
    const duration = performance.now() - startTime;
    
    // Log to analytics
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Operation ${name} took ${duration}ms`,
      level: duration > 100 ? 'warning' : 'info',
    });
    
    // Store for local analysis
    savePerformanceMetric(name, duration);
  }
}

export async function trackAsyncOperation(name, operation) {
  const startTime = performance.now();
  try {
    return await operation();
  } finally {
    const duration = performance.now() - startTime;
    
    // Log to analytics
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Async operation ${name} took ${duration}ms`,
      level: duration > 500 ? 'warning' : 'info',
    });
    
    // Store for local analysis
    savePerformanceMetric(name, duration);
  }
}
```

### 2. Set Up Automated Performance Alerts

```tsx
// In PerformanceAlerts.ts
import { Alert } from 'react-native';

// Define performance thresholds
const PERFORMANCE_THRESHOLDS = {
  renderTime: 16, // ms (1 frame @ 60fps)
  apiCallTime: 300, // ms
  imageLoadTime: 200, // ms
  startupTime: 2000, // ms
};

export function checkPerformance(metric, value) {
  const threshold = PERFORMANCE_THRESHOLDS[metric];
  
  if (threshold && value > threshold) {
    // Only alert in development
    if (__DEV__) {
      Alert.alert(
        'Performance Warning',
        `${metric} took ${value}ms, which exceeds the threshold of ${threshold}ms.`,
        [{ text: 'OK' }]
      );
    }
    
    // Log for analytics in production
    logPerformanceWarning(metric, value, threshold);
  }
}
```

## Troubleshooting

### Common Performance Issues

1. **Slow App Startup**
   - Check initialization sequence
   - Verify asset preloading
   - Measure splash screen duration

2. **UI Jank**
   - Look for heavy operations on the main thread
   - Check for missed frames in animations
   - Verify virtualized list configuration

3. **Memory Leaks**
   - Check for component unmount cleanup
   - Verify large object disposal
   - Test prolonged app usage

4. **Slow API Responses**
   - Implement request caching
   - Use optimistic UI updates
   - Add offline support

5. **Image Loading Issues**
   - Verify placeholder usage
   - Check image dimensions
   - Implement progressive loading

### Performance Debugging Tools

1. **React Native Debugger**
   ```bash
   # Install
   brew install --cask react-native-debugger
   
   # Use with Expo
   npx expo start --dev-client
   ```

2. **Flipper**
   ```bash
   # Install
   brew install --cask flipper
   
   # Configure in app
   // Add Flipper configuration to your app
   ```

3. **Expo DevTools**
   ```bash
   # Use with Expo
   npx expo start --dev-client
   ```

## Next Steps

After implementing these optimizations:

1. Conduct regular performance audits
2. Set up continuous performance monitoring
3. Establish performance budgets for new features
4. Review and update optimization strategies as the app evolves

For more information, refer to:
- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Expo Optimization Documentation](https://docs.expo.dev/guides/optimizing-updates/)
- [EcoCart Performance Components README](../src/components/performance/README.md) 