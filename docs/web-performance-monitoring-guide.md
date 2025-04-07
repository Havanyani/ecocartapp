# Web Performance Monitoring Guide

## Overview

The EcoCart Web Performance Monitoring System provides comprehensive tracking and visualization of web-specific performance metrics, including Core Web Vitals, navigation timing, and user interactions. This system is designed to help optimize the web version of our application for better user experience.

## Components

The system consists of the following components:

1. **WebPerformanceMonitor** - Core class for tracking web-specific metrics
2. **WebPerformanceDashboard** - UI component for visualizing performance data
3. **useWebVitals** - Hook for accessing performance data in React components
4. **WebPerformanceService** - Service for integrating with React Navigation

## Core Web Vitals

The system tracks the following Core Web Vitals:

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| LCP (Largest Contentful Paint) | Time until the largest content element is rendered | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | Time from first user interaction to response | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | Visual stability measure | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB (Time To First Byte) | Time until the first byte of response | < 800ms | 800ms - 1800ms | > 1800ms |
| FCP (First Contentful Paint) | Time until the first content is rendered | < 1.8s | 1.8s - 3.0s | > 3.0s |

## Implementation

### 1. WebPerformanceMonitor

The `WebPerformanceMonitor` class is a web-specific implementation for tracking performance metrics. It uses the [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) and [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) to capture metrics.

```typescript
// Example of getting Web Vitals data
import { WebPerformanceMonitor } from '@/utils/performance/WebPerformanceMonitor.web';

// Get all collected Web Vitals
const webVitals = WebPerformanceMonitor.getWebVitals();

// Generate a complete performance report
const report = WebPerformanceMonitor.generateReport();
```

### 2. WebPerformanceDashboard

The `WebPerformanceDashboard` component visualizes the collected performance metrics in a user-friendly dashboard.

```tsx
import { WebPerformanceDashboard } from '@/components/performance/WebPerformanceDashboard';

function MyComponent() {
  return (
    <WebPerformanceDashboard refreshInterval={30000} />
  );
}
```

### 3. useWebVitals Hook

The `useWebVitals` hook provides a convenient way to access Web Vitals data in React components.

```tsx
import { useWebVitals } from '@/components/performance/hooks/useWebVitals';

function MyComponent() {
  const { data, isLoading, error, refresh } = useWebVitals();
  
  return (
    <View>
      <Text>Performance Score: {data.performanceScore}</Text>
      {data.webVitals.map(vital => (
        <Text key={vital.name}>
          {vital.name}: {vital.value.toFixed(2)}ms ({vital.rating})
        </Text>
      ))}
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

### 4. WebPerformanceService

The `WebPerformanceService` integrates with React Navigation to track route changes and their impact on performance.

```typescript
// Example of integrating with React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { webPerformanceService } from '@/services/WebPerformanceService.web';

function App() {
  const navigationRef = React.useRef(null);
  
  useEffect(() => {
    if (navigationRef.current) {
      webPerformanceService.registerNavigationContainer(navigationRef.current);
    }
    
    return () => {
      webPerformanceService.cleanup();
    };
  }, []);
  
  return (
    <NavigationContainer ref={navigationRef}>
      {/* App content */}
    </NavigationContainer>
  );
}
```

## Viewing Performance Metrics

You can view the performance metrics in the Performance Monitor screen of the application. Navigate to the "Performance" section in the app and select the "Web Vitals" tab to see the dashboard.

## Custom Performance Measurements

You can create custom performance measurements using the `markStart` and `markEnd` methods:

```typescript
import { WebPerformanceMonitor } from '@/utils/performance/WebPerformanceMonitor.web';

// Start measuring a custom operation
WebPerformanceMonitor.markStart('my_custom_operation');

// Perform your operation
// ...

// End measuring and record the duration
WebPerformanceMonitor.markEnd('my_custom_operation');
```

## Best Practices

1. **Minimize JavaScript execution time** - Keep your bundle size small and optimize code execution
2. **Optimize images** - Use modern formats like WebP and appropriate sizes
3. **Implement lazy loading** - Only load resources when needed
4. **Avoid layout shifts** - Set dimensions for images and media elements
5. **Optimize server response time** - Implement caching and optimize API responses

## Troubleshooting

If you encounter issues with the performance monitoring system:

1. Check the browser console for errors
2. Ensure that the `WebPerformanceMonitor` is properly initialized
3. Verify that the `WebPerformanceService` is registered with the navigation container
4. Test on different browsers to identify browser-specific issues

## References

- [Web Vitals](https://web.dev/vitals/)
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [React Navigation](https://reactnavigation.org/docs/navigation-container/) 