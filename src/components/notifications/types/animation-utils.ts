import type { Animated } from 'react-native';
import type { AnimationPresetConfig } from './animation-config';

// Type guard utilities
export type AnimationTypeGuard<T extends AnimationPresetConfig> = 
  (preset: AnimationPresetConfig) => preset is T;

// Animation value utilities
export type AnimatedValueMap<T extends string> = {
  [K in T]: Animated.Value;
};

export type AnimationState = {
  isAnimating: boolean;
  direction?: 'in' | 'out';
  progress: number;
};

// Animation callback utilities
export type AnimationCallback = () => void;
export type AnimationErrorCallback = (error: Error) => void;

export interface AnimationCallbacks {
  onStart?: AnimationCallback;
  onComplete?: AnimationCallback;
  onError?: AnimationErrorCallback;
}

// Animation configuration utilities
export type AnimationConfigOverride<T extends AnimationPresetConfig> = Partial<
  Omit<T, 'type' | 'from' | 'to'>
>; 