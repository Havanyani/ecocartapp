import { AnimatableProps, AnimationConfig } from '@/types/animation';
import { safelyRunAnimation, withAnimationErrorHandling } from '@/utils/AnimationErrorHandler';
import { AnimationMonitor } from '@/utils/AnimationPerformanceMonitor';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { ThemedText } from '../ThemedText';

interface AnimatedCardProps extends AnimatableProps, ViewProps {
  title: string;
  content?: string;
  onPress?: () => void;
  elevation?: number;
}

/**
 * AnimatedCard - A reusable card component with built-in animation capabilities
 * and error handling to prevent crashes.
 */
export function AnimatedCard({
  title,
  content,
  onPress,
  elevation = 2,
  initialAnimation,
  animationId,
  onAnimationComplete,
  disableAnimation = false,
  style,
  ...props
}: AnimatedCardProps) {
  // Animation values
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  
  // Generate an animation ID for performance tracking
  const animId = animationId || AnimationMonitor.createAnimationId('AnimatedCard', 'entrance');

  // Set up animations
  useEffect(() => {
    if (disableAnimation) {
      // Set animation values to their final state without animating
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
      translateYAnim.setValue(0);
      return;
    }
    
    // Create and run entrance animation safely
    const entranceAnimation = safelyRunAnimation(() => {
      return Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    }, 
    // Fallback animation if something fails
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
    'AnimatedCard');

    // Track the animation for performance monitoring
    const cleanupFn = AnimationMonitor.trackAnimation(animId, 300, true);
    
    // Wrap with error handling
    const safeAnimation = withAnimationErrorHandling(entranceAnimation, 'AnimatedCard');
    
    // Start the animation
    safeAnimation.start((result) => {
      if (onAnimationComplete) {
        onAnimationComplete(result);
      }
      cleanupFn();
    });

    // Cleanup on unmount
    return () => {
      cleanupFn();
    };
  }, [disableAnimation, opacityAnim, scaleAnim, translateYAnim, animId, onAnimationComplete]);

  // Handle custom animations if provided
  useEffect(() => {
    if (initialAnimation && !disableAnimation) {
      applyCustomAnimation(initialAnimation);
    }
  }, [initialAnimation, disableAnimation]);

  // Apply a custom animation configuration
  const applyCustomAnimation = (config: AnimationConfig) => {
    try {
      switch (config.type) {
        case 'fade':
          opacityAnim.setValue(config.from);
          Animated.timing(opacityAnim, {
            toValue: config.to,
            duration: config.duration,
            useNativeDriver: config.useNativeDriver ?? true,
            easing: config.easing,
          }).start();
          break;
        case 'scale':
          scaleAnim.setValue(config.from);
          Animated.timing(scaleAnim, {
            toValue: config.to,
            duration: config.duration,
            useNativeDriver: config.useNativeDriver ?? true,
            easing: config.easing,
          }).start();
          break;
        // Additional animation types can be implemented here
      }
    } catch (error) {
      console.error('Error applying custom animation:', error);
    }
  };

  // Create animated styles
  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim }
    ]
  };

  // Wrap the card content in an error boundary
  return (
    <ErrorBoundary componentName="AnimatedCard">
      <Animated.View
        style={[styles.container, { elevation }, animatedStyle, style]}
        {...props}
      >
        <TouchableOpacity
          activeOpacity={onPress ? 0.7 : 1}
          onPress={onPress}
          style={styles.touchable}
        >
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {content && <ThemedText style={styles.text}>{content}</ThemedText>}
            {props.children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: 'white',
    margin: 8,
    overflow: 'hidden',
    // Modern boxShadow instead of deprecated shadow* properties
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)'
  },
  touchable: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  }
});

export default AnimatedCard; 