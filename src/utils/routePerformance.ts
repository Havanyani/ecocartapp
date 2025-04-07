import ErrorLoggingService from '@/services/ErrorLoggingService';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

interface RouteMetrics {
  route: string;
  loadTime: number;
  transitionTime: number;
  timestamp: number;
}

class RoutePerformanceMonitor {
  private static instance: RoutePerformanceMonitor;
  private routeMetrics: RouteMetrics[] = [];
  private navigationStartTime: number = 0;
  private readonly MAX_METRICS = 100;

  private constructor() {}

  static getInstance(): RoutePerformanceMonitor {
    if (!RoutePerformanceMonitor.instance) {
      RoutePerformanceMonitor.instance = new RoutePerformanceMonitor();
    }
    return RoutePerformanceMonitor.instance;
  }

  startNavigation() {
    this.navigationStartTime = performance.now();
  }

  endNavigation(route: string) {
    const endTime = performance.now();
    const transitionTime = endTime - this.navigationStartTime;

    const metric: RouteMetrics = {
      route,
      loadTime: transitionTime,
      transitionTime,
      timestamp: Date.now(),
    };

    this.routeMetrics.push(metric);

    // Keep only the most recent metrics
    if (this.routeMetrics.length > this.MAX_METRICS) {
      this.routeMetrics = this.routeMetrics.slice(-this.MAX_METRICS);
    }

    // Log slow transitions
    if (transitionTime > 1000) {
      ErrorLoggingService.logError(
        new Error(`Slow route transition detected: ${route}`),
        {
          route,
          transitionTime,
          component: 'RoutePerformanceMonitor',
        }
      );
    }
  }

  getMetrics(): RouteMetrics[] {
    return this.routeMetrics;
  }

  getAverageTransitionTime(): number {
    if (this.routeMetrics.length === 0) return 0;
    const total = this.routeMetrics.reduce((sum, metric) => sum + metric.transitionTime, 0);
    return total / this.routeMetrics.length;
  }

  getSlowestRoutes(limit: number = 5): RouteMetrics[] {
    return [...this.routeMetrics]
      .sort((a, b) => b.transitionTime - a.transitionTime)
      .slice(0, limit);
  }

  clearMetrics() {
    this.routeMetrics = [];
  }
}

export function useRoutePerformance() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments.join('/');
  const previousRoute = useRef(currentRoute);
  const monitor = RoutePerformanceMonitor.getInstance();

  useEffect(() => {
    if (currentRoute !== previousRoute.current) {
      monitor.endNavigation(currentRoute);
      previousRoute.current = currentRoute;
    }
  }, [currentRoute]);

  const startNavigation = () => {
    monitor.startNavigation();
  };

  const getMetrics = () => {
    return monitor.getMetrics();
  };

  const getAverageTransitionTime = () => {
    return monitor.getAverageTransitionTime();
  };

  const getSlowestRoutes = (limit?: number) => {
    return monitor.getSlowestRoutes(limit);
  };

  const clearMetrics = () => {
    monitor.clearMetrics();
  };

  return {
    startNavigation,
    getMetrics,
    getAverageTransitionTime,
    getSlowestRoutes,
    clearMetrics,
  };
} 