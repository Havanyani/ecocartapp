import type { EasingFunction } from 'react-native';

export type AnimationType = 'spring' | 'timing';
export type AnimationDirection = VerticalDirection;
export type AnimationEffect = 'fade' | 'scale' | 'slide';
export type VerticalDirection = 'up' | 'down';

export interface BaseAnimationPreset {
  type: AnimationType;
  from: number;
  to: number;
  useNativeDriver: boolean;
}

export interface SpringPreset extends BaseAnimationPreset {
  type: 'spring';
  damping: number;
  stiffness: number;
  mass: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

export interface TimingPreset extends BaseAnimationPreset {
  type: 'timing';
  duration: number;
  easing?: EasingFunction;
  delay?: number;
}

export interface DirectionalValues {
  up: number;
  down: number;
}

export type AnimationPresetKey = 
  | `${Uppercase<AnimationEffect>}_${Uppercase<AnimationDirection>}`
  | `${Uppercase<AnimationEffect>}_${Uppercase<VerticalDirection>}`;

export interface DirectionalPreset extends BaseAnimationPreset {
  type: 'spring';
  values: DirectionalValues;
  damping: number;
  stiffness: number;
  mass: number;
}

export type AnimationPresetConfig = 
  | SpringPreset 
  | TimingPreset 
  | DirectionalPreset;

export interface AnimationPresets {
  [K in AnimationPresetKey]: AnimationPresetConfig;
} 