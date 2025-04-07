import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

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
          router.push(route);
          resolve();
        });
      });
    }

    navigationState.current.isNavigating = true;
    navigationState.current.lastNavigationTime = Date.now();

    try {
      router.push(route);
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