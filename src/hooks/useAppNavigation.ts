import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import type { AuthStackParamList, ModalStackParamList, TabsParamList } from '../types/navigation';

type NavigateOptions = {
  replace?: boolean;
};

export function useAppNavigation() {
  const router = useRouter();

  const navigate = useCallback(<
    T extends keyof (AuthStackParamList & TabsParamList & ModalStackParamList)
  >(
    route: T,
    params?: (AuthStackParamList & TabsParamList & ModalStackParamList)[T],
    options?: NavigateOptions
  ) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const fullRoute = `${route}${queryString}`;

    if (options?.replace) {
      router.replace(fullRoute);
    } else {
      router.push(fullRoute);
    }
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    navigate,
    goBack,
  };
} 