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