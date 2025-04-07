# Performance Testing and Monitoring Guide

This guide outlines the testing and monitoring strategies for ensuring optimal performance across the EcoCart app.

## Table of Contents

1. [Performance Testing](#performance-testing)
2. [Monitoring Setup](#monitoring-setup)
3. [Benchmarking](#benchmarking)
4. [Metrics Collection](#metrics-collection)

## Performance Testing

### Unit Testing Performance Components

```typescript
// __tests__/components/OptimizedImage.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { OptimizedImage } from '@/components/OptimizedImage';

describe('OptimizedImage', () => {
  it('loads image with placeholder', () => {
    const { getByTestId } = render(
      <OptimizedImage
        source="test.jpg"
        testID="optimized-image"
      />
    );
    expect(getByTestId('optimized-image')).toBeTruthy();
  });

  it('handles load errors gracefully', () => {
    const onError = jest.fn();
    const { getByTestId } = render(
      <OptimizedImage
        source="invalid.jpg"
        onError={onError}
        testID="optimized-image"
      />
    );
    fireEvent.error(getByTestId('optimized-image'));
    expect(onError).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/PerformanceMonitor.test.tsx
import { render, act } from '@testing-library/react-native';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

jest.mock('@/hooks/usePerformanceMonitor');

describe('PerformanceMonitor Integration', () => {
  it('displays performance metrics', () => {
    const mockMetrics = [
      { name: 'FPS', value: 60 },
      { name: 'Memory', value: 100 }
    ];
    (usePerformanceMonitor as jest.Mock).mockReturnValue({
      metrics: mockMetrics
    });

    const { getByText } = render(<PerformanceMonitor />);
    expect(getByText('FPS: 60')).toBeTruthy();
  });
});
```

### E2E Testing

```typescript
// __tests__/e2e/performance.test.ts
import { device, element, by } from 'detox';

describe('Performance E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('maintains performance during navigation', async () => {
    // Navigate to different screens
    await element(by.id('home-tab')).tap();
    await element(by.id('profile-tab')).tap();
    
    // Verify performance metrics
    const fps = await element(by.id('fps-counter')).getText();
    expect(parseInt(fps)).toBeGreaterThan(55);
  });
});
```

## Monitoring Setup

### Web Monitoring

1. **Core Web Vitals Setup**
```typescript
// src/monitoring/web-vitals.ts
import { getCLS, getFID, getLCP } from 'web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}

export function initWebVitals() {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getLCP(reportWebVitals);
}
```

2. **Performance Observer**
```typescript
// src/monitoring/performance-observer.ts
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Process performance entry
    console.log(entry);
  }
});

observer.observe({ entryTypes: ['navigation', 'resource'] });
```

### Mobile Monitoring

1. **Frame Rate Monitoring**
```typescript
// src/monitoring/frame-rate.ts
import { NativeEventEmitter } from 'react-native';

const frameEmitter = new NativeEventEmitter();
let lastFrameTime = Date.now();

frameEmitter.addListener('frame', () => {
  const currentTime = Date.now();
  const frameDuration = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  
  // Calculate FPS
  const fps = 1000 / frameDuration;
  // Report FPS
});
```

2. **Memory Usage Tracking**
```typescript
// src/monitoring/memory.ts
import { NativeModules } from 'react-native';

export function trackMemoryUsage() {
  const { MemoryModule } = NativeModules;
  return MemoryModule.getMemoryUsage();
}
```

## Benchmarking

### Performance Benchmarks

```typescript
// src/benchmarks/performance.ts
export const benchmarks = {
  imageLoad: async (imageUrl: string) => {
    const start = performance.now();
    await loadImage(imageUrl);
    const end = performance.now();
    return end - start;
  },
  
  screenRender: async (component: React.ComponentType) => {
    const start = performance.now();
    render(<component />);
    const end = performance.now();
    return end - start;
  }
};
```

### Load Testing

```typescript
// src/benchmarks/load-test.ts
export async function runLoadTest() {
  const results = [];
  
  for (let i = 0; i < 100; i++) {
    const start = performance.now();
    await simulateUserInteraction();
    const end = performance.now();
    results.push(end - start);
  }
  
  return {
    average: results.reduce((a, b) => a + b) / results.length,
    max: Math.max(...results),
    min: Math.min(...results)
  };
}
```

## Metrics Collection

### Performance Metrics

```typescript
// src/monitoring/metrics.ts
interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
}

export function collectMetrics(): PerformanceMetrics {
  return {
    fps: getCurrentFPS(),
    memory: getMemoryUsage(),
    loadTime: getLoadTime(),
    renderTime: getRenderTime()
  };
}
```

### Analytics Integration

```typescript
// src/monitoring/analytics.ts
export function reportMetrics(metrics: PerformanceMetrics) {
  analytics.track('performance_metrics', {
    ...metrics,
    timestamp: Date.now(),
    platform: Platform.OS
  });
}
```

## Best Practices

1. **Testing**
   - Run performance tests regularly
   - Test on multiple devices
   - Include edge cases
   - Monitor test results over time

2. **Monitoring**
   - Set up alerts for performance regressions
   - Monitor real user metrics
   - Track performance trends
   - Document performance issues

3. **Benchmarking**
   - Establish baseline metrics
   - Run benchmarks before releases
   - Compare results across platforms
   - Document benchmark results

4. **Metrics Collection**
   - Collect relevant metrics
   - Store historical data
   - Analyze trends
   - Set performance budgets

## Tools and Resources

1. **Testing Tools**
   - Jest for unit testing
   - Detox for E2E testing
   - React Native Performance Monitor
   - Chrome DevTools

2. **Monitoring Tools**
   - Sentry for error tracking
   - Firebase Performance Monitoring
   - Custom performance dashboard
   - Analytics platform

3. **Benchmarking Tools**
   - Lighthouse for web
   - React Native Benchmark
   - Custom benchmark suite
   - Performance profiling tools

4. **Documentation**
   - Performance testing guide
   - Monitoring setup guide
   - Benchmarking procedures
   - Metrics documentation 