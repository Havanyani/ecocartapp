import { Animated } from 'react-native';
import { ANIMATION_CONFIG, QUEUE_CONFIG } from '@/constants';
import { ANIMATION_PRESETS } from '@/constants/animation';
import type {
  AnimatedValues,
  EndCallback,
  SpringConfig,
  TimingConfig
} from '../types';
import type {
  AnimationPreset,
  VerticalDirection
} from '../types/animation-config';
import {
  createDirectionalAnimation,
  isDirectionalPreset
} from './directional-animation';
import { createAlertError, handleAnimationError } from './error';

export function createSpringAnimation(
  value: Animated.Value,
  toValue: number,
  config: SpringConfig
): Animated.CompositeAnimation {
  return Animated.spring(value, {
    toValue,
    ...config,
  });
}

export function createTimingAnimation(
  value: Animated.Value,
  toValue: number,
  config: TimingConfig
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    ...config,
  });
}

export function cleanupAnimatedValues(values: AnimatedValues): void {
  const animatedValues = Object.values(values);
  animatedValues.forEach(value => {
    value.stopAnimation();
    value.removeAllListeners();
  });
}

export function createParallelAnimation(
  animations: Animated.CompositeAnimation[],
  callback?: EndCallback
): void {
  try {
    Animated.parallel(animations).start(result => {
      if (!result.finished) {
        handleAnimationError(createAlertError('Animation interrupted', 'ANIMATION_INTERRUPTED'));
      }
      callback?.(result);
    });
  } catch (error) {
    handleAnimationError(createAlertError(error.message, 'ANIMATION_ERROR'));
  }
}

export function createDismissAnimation(
  translateY: Animated.Value,
  direction: VerticalDirection,
  config = ANIMATION_CONFIG.spring
): Animated.CompositeAnimation {
  return createSpringAnimation(
    translateY,
    direction === 'down' ? QUEUE_CONFIG.alertHeight : -QUEUE_CONFIG.alertHeight,
    config
  );
}

export function createResetAnimation(
  value: Animated.Value,
  config = ANIMATION_CONFIG.spring
): Animated.CompositeAnimation {
  return createSpringAnimation(value, 0, config);
}

export function createFadeAnimation(
  opacity: Animated.Value,
  toValue: 0 | 1,
  duration: number
): Animated.CompositeAnimation {
  return createTimingAnimation(opacity, toValue, {
    duration,
    useNativeDriver: true
  });
}

export function createPresetAnimation(
  value: Animated.Value,
  preset: AnimationPreset,
  config?: Partial<SpringConfig & TimingConfig>,
  direction?: VerticalDirection
): Animated.CompositeAnimation {
  try {
    const animationPreset = ANIMATION_PRESETS[preset];

    if (isDirectionalPreset(animationPreset) && direction) {
      return createDirectionalAnimation(value, animationPreset, direction);
    }

    const baseConfig = {
      useNativeDriver: true,
      ...(animationPreset.type === 'spring' ? ANIMATION_CONFIG.spring : {}),
      ...config,
    };

    return animationPreset.type === 'spring'
      ? createSpringAnimation(value, animationPreset.to, baseConfig as SpringConfig)
      : createTimingAnimation(value, animationPreset.to, baseConfig as TimingConfig);
  } catch (error) {
    handleAnimationError(createAlertError(`Failed to create ${preset} animation`, 'ANIMATION_PRESET_ERROR'));
    return createResetAnimation(value);
  }
} 