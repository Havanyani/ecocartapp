/**
 * Animation Type Definitions
 * 
 * This file contains TypeScript interfaces and types for animations in the EcoCart app.
 * These types help ensure type safety when working with animations throughout the app.
 */

import { Animated, ViewStyle } from 'react-native';

/**
 * Animation types supported in the app
 */
export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'sequence'
  | 'parallel'
  | 'spring'
  | 'custom';

// Base animation configuration
export interface BaseAnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

// Specific animation configurations
export interface FadeAnimationConfig extends BaseAnimationConfig {
  type: 'fade';
  toValue: number;
}

export interface SlideAnimationConfig extends BaseAnimationConfig {
  type: 'slide';
  toValue: number;
  direction: 'horizontal' | 'vertical';
}

export interface ScaleAnimationConfig extends BaseAnimationConfig {
  type: 'scale';
  toValue: number;
}

export interface RotateAnimationConfig extends BaseAnimationConfig {
  type: 'rotate';
  toValue: number;
  direction: 'clockwise' | 'counterclockwise';
}

export interface SpringAnimationConfig extends BaseAnimationConfig {
  type: 'spring';
  toValue: number;
  friction?: number;
  tension?: number;
  speed?: number;
  bounciness?: number;
}

export interface BounceAnimationConfig extends BaseAnimationConfig {
  type: 'bounce';
  toValue: number;
  bounces?: number;
}

/**
 * Union type for all animation configurations
 */
export type AnimationConfig = 
  | FadeAnimationConfig
  | SlideAnimationConfig
  | ScaleAnimationConfig
  | RotateAnimationConfig
  | SpringAnimationConfig
  | BounceAnimationConfig;

/**
 * Animation tracking information
 */
export interface AnimationTracker {
  id: string;
  startTime: number;
  isComplete: boolean;
  nativeDriver: boolean;
  duration: number;
  componentName: string;
  animationType: AnimationType;
}

/**
 * Animation performance metrics
 */
export interface AnimationPerformanceMetrics {
  id: string;
  actualDuration: number;
  expectedDuration: number;
  overTime: number;
  jsThreadBlocked: boolean;
  uiBlockDuration?: number;
}

/**
 * Animation result with completion status
 */
export interface AnimationResult {
  finished: boolean;
  value?: number;
  error?: Error;
}

/**
 * Animation callback function
 */
export type AnimationCallback = (result: AnimationResult) => void;

/**
 * Style object with animation values
 */
export interface AnimatedStyleProps extends Omit<ViewStyle, 'transform'> {
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  translateX?: Animated.Value | Animated.AnimatedInterpolation<number>;
  translateY?: Animated.Value | Animated.AnimatedInterpolation<number>;
  scale?: Animated.Value | Animated.AnimatedInterpolation<number>;
  rotate?: Animated.Value | Animated.AnimatedInterpolation<string>;
  transform?: Array<{
    translateX?: number | Animated.Value | Animated.AnimatedInterpolation<number>;
    translateY?: number | Animated.Value | Animated.AnimatedInterpolation<number>;
    scale?: number | Animated.Value | Animated.AnimatedInterpolation<number>;
    rotate?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
    perspective?: number | Animated.Value | Animated.AnimatedInterpolation<number>;
    rotateX?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
    rotateY?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
    rotateZ?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
    skewX?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
    skewY?: string | Animated.Value | Animated.AnimatedInterpolation<string>;
  }>;
}

/**
 * Interface for components that can be animated
 */
export interface Animatable {
  animate: (config: AnimationConfig) => Animated.CompositeAnimation;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

/**
 * Props for animated components
 */
export interface AnimatableProps {
  initialAnimation?: AnimationConfig;
  animationId?: string;
  onAnimationComplete?: AnimationCallback;
  disableAnimation?: boolean;
} 