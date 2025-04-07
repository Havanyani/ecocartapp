import { useEffect } from 'react';
import { useScreenCache } from './useScreenCache';

export function useScreenCleanup(screenKey: string) {
  const { clear } = useScreenCache();

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear, screenKey]);
} 