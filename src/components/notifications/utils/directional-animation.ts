import { Animated } from 'react-native';
import type {
    DirectionalPreset,
    VerticalDirection
} from '../types/animation-config';
import type {
    AnimationCallbacks,
    AnimationConfigOverride,
    AnimationTypeGuard
} from '../types/animation-utils';
import { createSpringAnimation } from './animation';

export function getDirectionalValue(
  preset: DirectionalPreset,
  direction: VerticalDirection
): number {
  return preset.values[direction];
}

export const isDirectionalPreset: AnimationTypeGuard<DirectionalPreset> = (
  preset
): preset is DirectionalPreset => {
  return 'values' in preset && preset.type === 'spring';
};

export function createDirectionalAnimation(
  value: Animated.Value,
  preset: DirectionalPreset,
  direction: VerticalDirection,
  config?: AnimationConfigOverride<DirectionalPreset>,
  callbacks?: AnimationCallbacks
): Animated.CompositeAnimation {
  const toValue = preset.values[direction];
  
  return createSpringAnimation(value, toValue, {
    ...preset,
    ...config,
    useNativeDriver: true,
  });
} 