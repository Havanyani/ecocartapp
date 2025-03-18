import { Animated } from 'react-native';
import type { SpringPhysics } from '@/types/animation-physics';
import { DEFAULT_PHYSICS_CONFIG } from '@/types/animation-physics';
import type { EasingFunction } from './easing';
import {
  composeEasing,
  createBounceEasing,
  createElasticEasing,
  createMomentumEasing,
  createSpringEasing
} from './easing';

export type AnimationType = 'spring' | 'bounce' | 'elastic' | 'momentum' | 'composite';

interface AnimationConfig {
  type: AnimationType;
  duration: number;
  useNativeDriver?: boolean;
}

interface SpringAnimationConfig extends AnimationConfig {
  type: 'spring';
  physics: SpringPhysics;
}

interface BounceAnimationConfig extends AnimationConfig {
  type: 'bounce';
  bounces: number;
  decay: number;
}

interface ElasticAnimationConfig extends AnimationConfig {
  type: 'elastic';
  amplitude: number;
  frequency: number;
  decay: number;
}

interface MomentumAnimationConfig extends AnimationConfig {
  type: 'momentum';
  initialVelocity: number;
  friction: number;
}

interface CompositeAnimationConfig extends AnimationConfig {
  type: 'composite';
  animations: Array<Omit<AnimationConfig, 'duration'>>;
  weights: number[];
}

export type AnimationFactoryConfig =
  | {
      duration?: number;
      easing?: (value: number) => number;
      delay?: number;
    }
  | SpringAnimationConfig
  | BounceAnimationConfig
  | ElasticAnimationConfig
  | MomentumAnimationConfig
  | CompositeAnimationConfig;

export function createAnimation(
  value: Animated.Value,
  toValue: number,
  config: AnimationFactoryConfig
): Animated.CompositeAnimation {
  let easing: EasingFunction;

  if ('type' in config) {
    switch (config.type) {
      case 'spring':
        easing = createSpringEasing({
          mass: config.physics.mass,
          tension: config.physics.tension,
          friction: config.physics.friction,
        });
        break;

      case 'bounce':
        easing = createBounceEasing(config.bounces, config.decay);
        break;

      case 'elastic':
        easing = createElasticEasing(
          config.amplitude,
          config.frequency,
          config.decay
        );
        break;

      case 'momentum':
        easing = createMomentumEasing(config.initialVelocity, config.friction);
        break;

      case 'composite':
        const easings = config.animations.map(anim => 
          createAnimation(new Animated.Value(0), 1, {
            ...anim,
            duration: config.duration,
          } as AnimationFactoryConfig).interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }).__getValue
        );
        easing = composeEasing(easings, config.weights);
        break;

      default:
        throw new Error(`Unknown animation type: ${config.type}`);
    }
  } else {
    easing = config.easing || (t => t);
  }

  return Animated.timing(value, {
    toValue,
    duration: config.duration,
    easing,
    useNativeDriver: config.useNativeDriver ?? true,
  });
}

// Preset configurations
export const ANIMATION_PRESETS = {
  BOUNCE_OUT: {
    type: 'bounce' as const,
    duration: 300,
    bounces: 3,
    decay: 0.7,
  },
  
  ELASTIC_IN: {
    type: 'elastic' as const,
    duration: 400,
    amplitude: 1,
    frequency: 3,
    decay: 0.5,
  },
  
  MOMENTUM_OUT: {
    type: 'momentum' as const,
    duration: 500,
    initialVelocity: 1,
    friction: 0.95,
  },

  NATURAL_SPRING: {
    type: 'spring' as const,
    duration: 300,
    physics: DEFAULT_PHYSICS_CONFIG.spring,
  },
}; 