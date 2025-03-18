import { Easing, InteractionManager } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface AnimationConfig {
  duration: number;
  easing: (t: number) => number;
  useNativeDriver: boolean;
}

class AnimationOptimizer {
  private static instance: AnimationOptimizer;
  private config: AnimationConfig;
  private static readonly DEFAULT_CONFIG: AnimationConfig = {
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  };

  private constructor(config: Partial<AnimationConfig> = {}) {
    this.config = {
      ...AnimationOptimizer.DEFAULT_CONFIG,
      ...config,
    };
  }

  static getInstance(): AnimationOptimizer {
    if (!AnimationOptimizer.instance) {
      AnimationOptimizer.instance = new AnimationOptimizer();
    }
    return AnimationOptimizer.instance;
  }

  createSpringAnimation(
    value: Animated.SharedValue<number>,
    toValue: number,
    config: Partial<Animated.WithSpringConfig> = {}
  ): void {
    value.value = withSpring(toValue, {
      damping: 15,
      stiffness: 100,
      mass: 1,
      ...config,
    });
  }

  createTimingAnimation(
    value: Animated.SharedValue<number>,
    toValue: number,
    config: Partial<Animated.WithTimingConfig> = {}
  ): void {
    value.value = withTiming(toValue, {
      duration: this.config.duration,
      easing: this.config.easing,
      ...config,
    });
  }

  createSequenceAnimation(
    value: Animated.SharedValue<number>,
    sequence: Array<{ toValue: number; duration: number }>
  ): void {
    const animations = sequence.map(({ toValue, duration }) =>
      withTiming(toValue, {
        duration,
        easing: this.config.easing,
      })
    );

    value.value = withSequence(...animations);
  }

  createDelayedAnimation(
    value: Animated.SharedValue<number>,
    toValue: number,
    delay: number,
    config: Partial<Animated.WithTimingConfig> = {}
  ): void {
    value.value = withDelay(
      delay,
      withTiming(toValue, {
        duration: this.config.duration,
        easing: this.config.easing,
        ...config,
      })
    );
  }
}

// Export singleton instance
export const animationOptimizer = AnimationOptimizer.getInstance();

// Custom hook for optimized animations
export function useOptimizedAnimation<T extends number>(
  initialValue: T,
  config: Partial<AnimationConfig> = {}
): {
  value: Animated.SharedValue<T>;
  animate: (toValue: T) => void;
  animateSpring: (toValue: T, springConfig?: Partial<Animated.WithSpringConfig>) => void;
  animateSequence: (sequence: Array<{ toValue: T; duration: number }>) => void;
  animateDelayed: (toValue: T, delay: number) => void;
} {
  const value = useSharedValue<T>(initialValue);

  const animate = (toValue: T) => {
    animationOptimizer.createTimingAnimation(value, toValue, config);
  };

  const animateSpring = (toValue: T, springConfig?: Partial<Animated.WithSpringConfig>) => {
    animationOptimizer.createSpringAnimation(value, toValue, springConfig);
  };

  const animateSequence = (sequence: Array<{ toValue: T; duration: number }>) => {
    animationOptimizer.createSequenceAnimation(value, sequence);
  };

  const animateDelayed = (toValue: T, delay: number) => {
    animationOptimizer.createDelayedAnimation(value, toValue, delay, config);
  };

  return {
    value,
    animate,
    animateSpring,
    animateSequence,
    animateDelayed,
  };
}

// Utility function to create optimized animated styles
export function createOptimizedAnimatedStyle<T extends object>(
  style: T
): Animated.AnimatedStyleProp<T> {
  return useAnimatedStyle(() => {
    'worklet';
    return style;
  });
}

// Utility function to run animations after interactions
export async function runAnimationAfterInteractions(
  animation: () => void
): Promise<void> {
  await InteractionManager.runAfterInteractions();
  animation();
} 