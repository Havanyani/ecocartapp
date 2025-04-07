import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

// Define route priorities (1: highest, 3: lowest)
interface RouteConfig {
  priority: 1 | 2 | 3;
  dependencies?: string[];
  preloadCondition?: () => boolean;
}

// Define critical routes with their configurations
const CRITICAL_ROUTES: Record<string, RouteConfig> = {
  '/': { priority: 1 },
  '/materials': { priority: 1 },
  '/collections': { priority: 1 },
  '/community': { priority: 2 },
  '/profile': { priority: 2 },
  '/auth/login': { priority: 1 },
  '/auth/signup': { priority: 2 },
};

// Define route groups with their configurations
const ROUTE_GROUPS: Record<string, { routes: string[], config: RouteConfig }> = {
  auth: {
    routes: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'],
    config: { priority: 1 }
  },
  tabs: {
    routes: ['/', '/materials', '/collections', '/community', '/profile'],
    config: { priority: 1 }
  },
  modals: {
    routes: ['/ar-scan', '/material-details', '/collection-details'],
    config: { priority: 3 }
  },
};

// Define adjacent routes
const ADJACENT_ROUTES: Record<string, string[]> = {
  '/materials': ['/material-details', '/ar-scan'],
  '/collections': ['/collection-details'],
  '/profile': ['/settings', '/edit-profile']
};

// Cache for preloaded routes
const preloadedRoutes = new Set<string>();
const preloadQueue = new Set<string>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

  const preloadAdjacentRoutes = useCallback(async (currentRoute: string) => {
    const adjacentRoutes = ADJACENT_ROUTES[currentRoute] || [];
    await Promise.all(adjacentRoutes.map(route => preloadRoute(route)));
  }, [preloadRoute]);

  return {
    preloadRoute,
    preloadCriticalRoutes,
    preloadAdjacentRoutes,
    preloadedRoutes
  };
}

// Route transition optimization with preloading
export function useRouteTransition() {
  const router = useRouter();
  const { preloadRoute } = useRoutePreloading();

  // Optimized navigation with transition and preloading
  const navigateWithTransition = async (route: string, params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const fullRoute = `${route}${queryString}`;
    
    // Preload the route before navigation
    await preloadRoute(route);
    
    // Navigate with transition
    router.push(fullRoute);
  };

  // Replace current route with transition and preloading
  const replaceWithTransition = async (route: string, params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const fullRoute = `${route}${queryString}`;
    
    // Preload the route before navigation
    await preloadRoute(route);
    
    // Replace with transition
    router.replace(fullRoute);
  };

  // Go back with transition
  const goBackWithTransition = () => {
    router.back();
  };

  return {
    navigateWithTransition,
    replaceWithTransition,
    goBackWithTransition,
  };
} 