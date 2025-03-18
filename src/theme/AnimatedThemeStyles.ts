import { Animated } from 'react-native';
import { colors } from './colors';

export function createAnimatedStyles(animation: Animated.Value) {
  return {
    text: {
      color: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.text, colors.textDark],
      }),
    },
    background: {
      backgroundColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.background, colors.backgroundDark],
      }),
    },
    surface: {
      backgroundColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.surface, colors.surfaceDark],
      }),
    },
    border: {
      borderColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.borderDark],
      }),
    },
    shadow: {
      shadowColor: animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)'],
      }),
    },
  };
}

export function createAnimatedComponent(
  Component: React.ComponentType,
  animatedProps: string[]
) {
  return Animated.createAnimatedComponent(Component);
} 