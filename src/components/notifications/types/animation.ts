import type { Animated, ViewStyle } from 'react-native';

// Direction types
export type AnimationDirection = -1 | 1;

// Animation configs
export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
  useNativeDriver: boolean;
}

export interface TimingConfig {
  duration: number;
  useNativeDriver: boolean;
}

// Animation values
export interface AnimatedValues {
  opacity: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
}

// Animation results
export interface EndResult {
  finished: boolean;
}

export type EndCallback = (result: EndResult) => void;

// Style types
export interface AnimatedViewStyle {
  backgroundColor: string;
  paddingTop: number;
  opacity: Animated.Value;
  transform: [
    { translateY: Animated.Value },
    { scale: Animated.Value }
  ];
}

export type AnimatedStyleArray = [ViewStyle, AnimatedViewStyle]; 