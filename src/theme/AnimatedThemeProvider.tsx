import React from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { useThemeTransition } from './useThemeTransition';

interface AnimatedThemeProps {
  children: React.ReactNode;
  style?: Animated.WithAnimatedValue<ViewStyle>;
}

export function AnimatedThemeProvider({ children, style }: AnimatedThemeProps) {
  const { isDark, colors } = useTheme();
  const { interpolateColor } = useThemeTransition();

  const animatedStyle = {
    ...style,
    backgroundColor: interpolateColor(colors.background, colors.backgroundDark),
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 