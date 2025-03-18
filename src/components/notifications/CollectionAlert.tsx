import {
  ANIMATION_CONFIG,
  COLORS,
  PERFORMANCE_MARKS,
  QUEUE_CONFIG,
  TIMING
} from '@components/notifications/constants';
import { ErrorFallback } from '@components/notifications/ErrorFallback';
import { IconButton } from '@components/notifications/IconButton';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { LayoutChangeEvent, LayoutRectangle, ViewStyle } from 'react-native';
import { Animated, Text, useColorScheme, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GESTURE_ANIMATION_CONFIG } from './constants/animation';
import { useAnimationPreset } from './hooks/useAnimationPreset';
import { baseStyles, messageStyles } from './styles';
import type {
  CollectionAlertProps as AlertProps,
  AnimatedStyleArray,
  AnimatedValues,
  EndResult,
  PanGestureEvent,
  PanGestureStateEvent
} from './types';
import { cleanupAnimatedValues, createAnimation, getIcon, getQueueState } from './utils';
import { alertCollisionManager } from './utils/alert-collision';
import {
  getDismissDirection,
  getGestureDistance,
  getGestureVelocity,
  isGestureEnd,
  shouldDismissGesture
} from './utils/gesture';

export function showAlert(props: AlertProps): string {
  const id = Math.random().toString(36).substr(2, 9);
  const alert = { ...props, id };
  
  const { queue } = getQueueState();
  queue.push(alert);
  if (queue.length > QUEUE_CONFIG.maxAlerts) {
    queue.shift();
  }
  
  return id;
}

// Add type for the component's props
interface CollectionAlertComponentProps extends AlertProps {
  id: string;
  animationConfig?: {
    fadeIn?: { duration?: number; tension?: number; friction?: number; mass?: number; velocity?: number; bounciness?: number };
    fadeOut?: { duration?: number; tension?: number; friction?: number; mass?: number; velocity?: number; bounciness?: number };
    scaleIn?: { duration?: number; tension?: number; friction?: number; mass?: number; velocity?: number; bounciness?: number };
    scaleOut?: { duration?: number; tension?: number; friction?: number; mass?: number; velocity?: number; bounciness?: number };
  };
}

export function CollectionAlert({
  message,
  type = 'info',
  onDismiss,
  duration = TIMING.duration.default * 10,
  testID,
  animationDuration = TIMING.duration.default,
  id,
  animationConfig,
}: CollectionAlertComponentProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isVisible, setIsVisible] = React.useState(true);
  
  const animationValues = React.useRef<AnimatedValues>({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(0),
    scale: new Animated.Value(0.9),
  }).current;

  const { opacity, translateY, scale } = animationValues;
  const layoutRef = useRef<LayoutRectangle | null>(null);

  const fadeInPreset = useAnimationPreset({
    preset: 'FADE_IN',
    options: animationConfig?.fadeIn,
  });

  const fadeOutPreset = useAnimationPreset({
    preset: 'FADE_OUT',
    options: animationConfig?.fadeOut,
  });

  const scaleInPreset = useAnimationPreset({
    preset: 'SCALE_IN',
    options: animationConfig?.scaleIn,
  });

  const scaleOutPreset = useAnimationPreset({
    preset: 'SCALE_OUT',
    options: animationConfig?.scaleOut,
  });

  // Animation setup and cleanup
  React.useEffect(() => {
    performance.mark(PERFORMANCE_MARKS.MOUNT);
    
    createAnimation(opacity, 1, fadeInPreset).start();
    createAnimation(scale, 1, scaleInPreset).start(() => {
      performance.mark(PERFORMANCE_MARKS.ANIMATION_END);
      performance.measure(
        'alert-animation',
        PERFORMANCE_MARKS.ANIMATION_START,
        PERFORMANCE_MARKS.ANIMATION_END
      );
    });

    return () => {
      performance.clearMarks();
      performance.clearMeasures();
      cleanupAnimatedValues(animationValues);
    };
  }, [fadeInPreset, scaleInPreset]);

  // Dismiss handlers
  const dismiss = React.useCallback(() => {
    Animated.parallel([
      createAnimation(opacity, 0, fadeOutPreset),
      createAnimation(scale, 0.9, scaleOutPreset),
    ]).start((result: EndResult) => {
      if (result.finished) {
        setIsVisible(false);
        onDismiss?.();
      }
    });
  }, [onDismiss, fadeOutPreset, scaleOutPreset]);

  const handleDismiss = React.useCallback((): void => {
    dismiss();
    const { queue } = getQueueState();
    queue.filter(alert => alert.id !== id);
  }, [dismiss, id]);

  const debouncedDismiss = React.useMemo(
    () => debounce(handleDismiss, TIMING.delay.short),
    [handleDismiss]
  );

  // Auto-dismiss
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  // Gesture handling
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  ) as unknown as (event: PanGestureEvent) => void;

  // Add collision handling
  useEffect(() => {
    if (!layoutRef.current) return;

    alertCollisionManager.addAlert({
      id,
      layout: layoutRef.current,
      translateY: 0,
      velocity: 0,
    });

    return () => {
      alertCollisionManager.removeAlert(id);
    };
  }, [id]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    layoutRef.current = event.nativeEvent.layout;
  }, []);

  // Update gesture handling
  const handleGestureStateChange = useCallback((event: PanGestureStateEvent): void => {
    if (isGestureEnd(event.nativeEvent.state)) {
      const velocity = getGestureVelocity(event.nativeEvent.velocityY);
      const distance = getGestureDistance(event.nativeEvent.translationY);
      
      // Update collision manager with current position and velocity
      alertCollisionManager.updateAlertPosition(id, distance, velocity);
      
      // Get collision adjustment
      const adjustment = alertCollisionManager.getCollisionAdjustment(id);
      
      if (shouldDismissGesture(velocity, distance)) {
        const direction = getDismissDirection(distance);
        createAnimation(
          translateY,
          direction * QUEUE_CONFIG.alertHeight + adjustment.y,
          GESTURE_ANIMATION_CONFIG.swipeDismiss
        ).start(handleDismiss);
      } else {
        createAnimation(
          translateY,
          adjustment.y,
          GESTURE_ANIMATION_CONFIG.snapBack
        ).start();
      }
    }
  }, [handleDismiss, translateY, id]);

  // Styles
  const alertColor = React.useMemo(() => {
    const theme = isDark ? 'dark' : 'light';
    return COLORS[theme][type];
  }, [isDark, type]);

  // Type the animated style
  const animatedStyle = React.useMemo((): AnimatedStyleArray => ([
    baseStyles.container as ViewStyle,
    {
      backgroundColor: alertColor,
      paddingTop: Math.max(insets.top, 8),
      opacity,
      transform: [
        { translateY },
        { scale }
      ],
    },
  ]), [alertColor, insets.top, opacity, translateY, scale]);

  if (!isVisible) return null;

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setIsVisible(true)}
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        minDist={ANIMATION_CONFIG.gesture.minDistance}
        activeOffsetY={ANIMATION_CONFIG.gesture.activeOffsetY}
      >
        <Animated.View 
          onLayout={handleLayout}
          style={animatedStyle}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${type} alert: ${message}`}
          accessibilityHint="Swipe up or down to dismiss"
        >
          <View style={baseStyles.content}>
            <IconButton 
              name={getIcon(type)} 
              testID={`${testID}-icon`}
            />
            <Text 
              style={messageStyles.text}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {message}
            </Text>
            {onDismiss && (
              <IconButton
                name="close"
                onPress={handleDismiss}
                testID={`${testID}-close`}
              />
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </ErrorBoundary>
  );
} 