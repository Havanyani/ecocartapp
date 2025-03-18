import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { AnimationPresets } from '@/types/animation-config';
import type {
  AnimatedValueMap,
  AnimationCallbacks,
  AnimationState
} from '../types/animation-utils';
import { createPresetAnimation } from '@/utils/animation';

interface UseAnimationProps {
  initialValues: Record<string, number>;
  callbacks?: AnimationCallbacks;
}

export function useAnimation({ initialValues, callbacks }: UseAnimationProps) {
  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
  });

  const values = useRef<AnimatedValueMap<keyof typeof initialValues>>(
    Object.entries(initialValues).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: new Animated.Value(value),
    }), {} as AnimatedValueMap<keyof typeof initialValues>)
  ).current;

  const animate = useCallback((
    preset: AnimationPresets,
    key: keyof typeof values,
    config?: Parameters<typeof createPresetAnimation>[2]
  ) => {
    setState(prev => ({ ...prev, isAnimating: true }));
    callbacks?.onStart?.();

    createPresetAnimation(values[key], preset, config).start(result => {
      setState(prev => ({ ...prev, isAnimating: false }));
      
      if (result.finished) {
        callbacks?.onComplete?.();
      } else {
        callbacks?.onError?.(new Error('Animation interrupted'));
      }
    });
  }, [values, callbacks]);

  return {
    values,
    state,
    animate,
  };
} 