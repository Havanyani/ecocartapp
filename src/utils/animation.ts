/**
 * animation.ts
 * 
 * Provides utilities for consistent animation configurations across the app.
 */
import { Platform } from 'react-native';

export type AnimationDriverConfig = {
  useNativeDriver: boolean;
};

/**
 * Animation configurations for different types of animations
 */
export const AnimationDrivers = {
  /**
   * For opacity/transform animations that work well with the native driver
   */
  opacity: {
    useNativeDriver: true,
  },
  
  /**
   * For layout animations that can't use the native driver 
   * (width, height, position, etc.)
   */
  layout: {
    useNativeDriver: false,
  },
  
  /**
   * For color/background animations that can't use the native driver
   */
  color: {
    useNativeDriver: false,
  },
  
  /**
   * Web-safe configuration that works across all platforms
   */
  universal: {
    // We force non-native driver for web to ensure compatibility
    useNativeDriver: Platform.OS !== 'web',
  }
};

/**
 * Durations for different animation types
 */
export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

/**
 * Returns the correct animation configuration based on the animation type
 * and platform considerations.
 * 
 * @param animationType The type of animation (opacity, layout, color, universal)
 * @returns Animation configuration with the correct driver setting
 */
export function getAnimationConfig(
  animationType: keyof typeof AnimationDrivers
): AnimationDriverConfig {
  return AnimationDrivers[animationType];
}

/**
 * Helper to ensure animations that interact with each other use consistent driver settings
 * 
 * @param animations Array of animation types that will be used together
 * @returns Animation configuration with a driver setting that works for all animations
 */
export function getConsistentAnimationConfig(
  animations: (keyof typeof AnimationDrivers)[]
): AnimationDriverConfig {
  // If any animation requires useNativeDriver: false, we need to use that for all
  const requiresJSDriver = animations.some(
    type => !AnimationDrivers[type].useNativeDriver
  );
  
  return {
    useNativeDriver: !requiresJSDriver && Platform.OS !== 'web'
  };
} 