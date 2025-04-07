import { useCallback, useEffect, useRef } from 'react';
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