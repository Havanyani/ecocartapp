/**
 * AnimationErrorHandler.ts
 * 
 * Provides utilities for handling animation errors safely in React Native applications.
 * This helps prevent crashes and UI freezes due to animation failures.
 */

import { Animated } from 'react-native';

/**
 * Safely wraps an animation function to prevent crashes if the animation fails.
 * 
 * @param animationFn The animation function to run
 * @param fallbackValue A fallback animation value to use if the animation fails
 * @param componentName The name of the component for error reporting
 * @returns The result of the animation function or a fallback animation
 */
export function safelyRunAnimation<T>(
  animationFn: () => T,
  fallbackValue: T,
  componentName: string
): T {
  try {
    return animationFn();
  } catch (error) {
    console.error(`Animation error in ${componentName}:`, error);
    return fallbackValue;
  }
}

/**
 * Creates a safe animation sequence that won't crash the app if one step fails.
 * 
 * @param animations Array of animation functions to run in sequence
 * @param componentName The name of the component for error reporting
 * @returns A function that safely runs the animation sequence
 */
export function createSafeAnimationSequence(
  animations: Array<() => Animated.CompositeAnimation>,
  componentName: string
): () => Animated.CompositeAnimation {
  return () => {
    // Create a composite animation that will run even if some steps fail
    const sequence = Animated.sequence(
      animations.map((animFn) => {
        try {
          return animFn();
        } catch (error) {
          console.error(`Animation sequence error in ${componentName}:`, error);
          // Return a dummy animation that does nothing but won't break the sequence
          return Animated.timing(new Animated.Value(0), { toValue: 0, duration: 1, useNativeDriver: true });
        }
      })
    );
    
    return sequence;
  };
}

/**
 * Provides a fallback animation value object when an animation fails.
 * 
 * @param initialValue The initial value for the fallback animation
 * @returns An Animated.Value with the initial value
 */
export function createFallbackAnimationValue(initialValue: number = 0): Animated.Value {
  return new Animated.Value(initialValue);
}

/**
 * A higher-order function that wraps animation start/stop methods with error handling.
 * 
 * @param animation The animation object to wrap with error handling
 * @param componentName The name of the component for error reporting
 * @returns An animation object with the same API but with error handling
 */
export function withAnimationErrorHandling(
  animation: Animated.CompositeAnimation,
  componentName: string
): Animated.CompositeAnimation {
  return {
    start: (callback?: Animated.EndCallback) => {
      try {
        animation.start((result) => {
          if (callback) {
            try {
              callback(result);
            } catch (callbackError) {
              console.error(`Animation callback error in ${componentName}:`, callbackError);
            }
          }
        });
      } catch (error) {
        console.error(`Animation start error in ${componentName}:`, error);
        // Call the callback with a failure result
        if (callback) {
          callback({ finished: false });
        }
      }
    },
    stop: () => {
      try {
        animation.stop();
      } catch (error) {
        console.error(`Animation stop error in ${componentName}:`, error);
      }
    },
    reset: () => {
      try {
        animation.reset();
      } catch (error) {
        console.error(`Animation reset error in ${componentName}:`, error);
      }
    }
  };
} 