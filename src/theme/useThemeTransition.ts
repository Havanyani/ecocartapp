import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from './ThemeContext';

export function useThemeTransition(duration = 300) {
  const { isDark } = useTheme();
  const animation = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isDark ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [isDark, animation, duration]);

  const interpolateColor = useCallback(
    (lightColor: string, darkColor: string) =>
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [lightColor, darkColor],
      }),
    [animation]
  );

  return { animation, interpolateColor };
} 