import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Vibration } from 'react-native';
import { GestureEvent, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler';
import { GESTURE_THRESHOLDS } from '@/constants';
import type { VerticalDirection } from '@/types/animation-config';
import type { AnimatedValueMap, AnimationCallbacks } from '@/types/animation-utils';
import type {
  GestureContext,
  GestureMetrics,
  GestureState,
  GestureStateChangeHandler,
  PerformanceMetrics
} from '../types/gesture';
import {
  createDismissAnimation,
  createResetAnimation
} from '../utils/animation';
import {
  getDismissDirection,
  getGestureDistance,
  getGestureVelocity,
  shouldDismissGesture
} from '../utils/gesture';
import type { DebugConfig, GestureConfig } from './gesture-config';

interface DebugInfo {
  metrics: PerformanceMetrics;
  lastGesture: GestureMetrics;
  config: GestureConfig;
}

interface GestureError extends Error {
  code: string;
  metadata?: Record<string, unknown>;
}

const createGestureError = (message: string, code: string, metadata?: Record<string, unknown>): GestureError => {
  const error = new Error(message) as GestureError;
  error.code = code;
  error.metadata = metadata;
  return error;
};

interface UseGestureAnimationProps {
  values: AnimatedValueMap<'translateY'>;
  onDismiss?: () => void;
  config?: Partial<GestureConfig>;
  callbacks?: AnimationCallbacks;
  enabled?: boolean;
  debug?: DebugConfig;
  onGestureStateChange?: GestureStateChangeHandler;
}

const DEFAULT_CONFIG: GestureConfig = {
  threshold: GESTURE_THRESHOLDS.SWIPE_DISTANCE,
  velocityThreshold: GESTURE_THRESHOLDS.SWIPE_VELOCITY,
  minDistance: 10,
  maxVelocity: 1000,
  debounceTime: 32,
  allowedDirections: ['up', 'down'],
  enableHaptics: true,
  resistanceFactor: 0.5,
  maxGestureDuration: 1000,
  minVelocity: 50,
};

const PLATFORM_CONFIG = {
  ios: {
    hapticDuration: 10,
    frameThreshold: 16.67, // 60fps
  },
  android: {
    hapticDuration: 20,
    frameThreshold: 33.33, // 30fps
  },
};

const platformConfig = Platform.select(PLATFORM_CONFIG);

function applyResistance(value: number, factor: number): number {
  return value * (1 - Math.min(Math.abs(value) / 1000, 0.8) * factor);
}

// Add velocity tracking types
interface VelocityTracker {
  samples: Array<{
    velocity: number;
    timestamp: number;
  }>;
  maxSamples: number;
  decayRate: number;
}

// Add momentum config
interface MomentumConfig {
  enabled: boolean;
  minVelocity: number;
  friction: number;
  bounciness: number;
}

const DEFAULT_MOMENTUM_CONFIG: MomentumConfig = {
  enabled: true,
  minVelocity: 0.1,
  friction: 6,
  bounciness: 1,
};

// Add spring physics types
interface SpringPhysics {
  tension: number;
  friction: number;
  mass: number;
  velocity: number;
  position: number;
}

interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
  restPosition: number;
  restVelocity: number;
  overshootClamping: boolean;
}

const DEFAULT_SPRING_CONFIG: SpringConfig = {
  tension: 180,
  friction: 12,
  mass: 1,
  restPosition: 0,
  restVelocity: 0.001,
  overshootClamping: false,
};

export function useGestureAnimation({
  values,
  onDismiss,
  config = {},
  callbacks,
  enabled = true,
  debug = { enabled: false },
  onGestureStateChange,
}: UseGestureAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const gestureConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const previousTranslation = useRef(0);
  
  const gestureContext = useRef<GestureContext>({
    startTime: 0,
    lastFrameTime: 0,
    frameCount: 0,
    averageFrameTime: 0,
  }).current;

  const gestureState = useRef<GestureState>({
    active: false,
    distance: 0,
    velocity: 0,
    direction: 'up',
    duration: 0,
    fps: 0,
    lastUpdate: Date.now(),
    progress: 0,
  }).current;

  const performanceMetrics = useRef<PerformanceMetrics>({
    averageFrameTime: 0,
    droppedFrames: 0,
    totalFrames: 0,
    gestureCount: 0,
    dismissCount: 0,
  }).current;

  const previousGestureState = useRef<GestureState>({ ...gestureState });

  const isDirectionAllowed = useCallback((direction: VerticalDirection): boolean => {
    return gestureConfig.allowedDirections?.includes(direction) ?? true;
  }, [gestureConfig.allowedDirections]);

  const updateProgress = useCallback((distance: number) => {
    gestureState.progress = Math.min(
      Math.abs(distance) / gestureConfig.threshold,
      1
    );
  }, [gestureConfig.threshold]);

  const updateGestureMetrics = useCallback((
    now: number,
    translationY: number,
    velocityY: number,
    direction: VerticalDirection
  ): GestureMetrics => {
    const frameDelta = now - gestureContext.lastFrameTime;
    gestureContext.frameCount++;
    gestureContext.lastFrameTime = now;
    gestureContext.averageFrameTime = (now - gestureContext.startTime) / gestureContext.frameCount;

    return {
      velocity: Math.min(Math.abs(velocityY), gestureConfig.maxVelocity) * Math.sign(velocityY),
      distance: translationY,
      direction,
      duration: now - gestureContext.startTime,
      fps: 1000 / gestureContext.averageFrameTime,
    };
  }, [gestureConfig.maxVelocity]);

  const shouldSkipFrame = useCallback((now: number): boolean => {
    return (now - gestureContext.lastFrameTime) < (platformConfig?.frameThreshold ?? 16.67);
  }, []);

  const logPerformance = useCallback(() => {
    if (!debug.enabled || !debug.logPerformance) return;

    console.log('Gesture Performance:', {
      fps: Math.round(1000 / performanceMetrics.averageFrameTime),
      droppedFrames: performanceMetrics.droppedFrames,
      frameDropRate: `${Math.round((performanceMetrics.droppedFrames / performanceMetrics.totalFrames) * 100)}%`,
      dismissRate: `${Math.round((performanceMetrics.dismissCount / performanceMetrics.gestureCount) * 100)}%`,
    });
  }, [debug]);

  const updatePerformanceMetrics = useCallback((now: number) => {
    const frameDelta = now - gestureContext.lastFrameTime;
    performanceMetrics.totalFrames++;
    
    if (frameDelta > (platformConfig?.frameThreshold ?? 16.67)) {
      performanceMetrics.droppedFrames++;
    }

    performanceMetrics.averageFrameTime = (
      performanceMetrics.averageFrameTime * (performanceMetrics.totalFrames - 1) + 
      frameDelta
    ) / performanceMetrics.totalFrames;
  }, []);

  const notifyGestureStateChange = useCallback((
    current: GestureState,
    timestamp: number
  ) => {
    if (!onGestureStateChange) return;

    try {
      onGestureStateChange({
        previous: { ...previousGestureState.current },
        current: { ...current },
        timestamp,
      });
      previousGestureState.current = { ...current };
    } catch (error) {
      console.error('Error in gesture state change handler:', error);
    }
  }, [onGestureStateChange]);

  const updateGestureState = useCallback((
    updates: Partial<GestureState>,
    timestamp: number
  ) => {
    Object.assign(gestureState, updates);
    notifyGestureStateChange(gestureState, timestamp);
  }, [gestureState, notifyGestureStateChange]);

  const cleanup = useCallback(() => {
    gestureState.active = false;
    gestureState.progress = 0;
    gestureContext.lastFrameTime = 0;
    logPerformance();
  }, [logPerformance]);

  const handleGestureError = useCallback((error: GestureError) => {
    console.error('Gesture Error:', {
      message: error.message,
      code: error.code,
      metadata: error.metadata,
    });
    
    cleanup();
    callbacks?.onError?.(error);
  }, [cleanup, callbacks]);

  const velocityTracker = useRef<VelocityTracker>({
    samples: [],
    maxSamples: 5,
    decayRate: 0.95,
  }).current;

  const getSmoothedVelocity = useCallback((currentVelocity: number, now: number): number => {
    // Add new sample
    velocityTracker.samples.push({ velocity: currentVelocity, timestamp: now });
    
    // Remove old samples
    while (velocityTracker.samples.length > velocityTracker.maxSamples) {
      velocityTracker.samples.shift();
    }

    // Calculate weighted average
    let totalWeight = 0;
    const smoothedVelocity = velocityTracker.samples.reduce((acc, sample, index) => {
      const age = now - sample.timestamp;
      const weight = Math.pow(velocityTracker.decayRate, age / 16.67); // 60fps time base
      totalWeight += weight;
      return acc + sample.velocity * weight;
    }, 0);

    return smoothedVelocity / totalWeight;
  }, []);

  const createMomentumAnimation = useCallback((
    value: Animated.Value,
    velocity: number,
    config: MomentumConfig = DEFAULT_MOMENTUM_CONFIG
  ): Animated.CompositeAnimation => {
    const direction = Math.sign(velocity);
    const initialVelocity = Math.abs(velocity);
    
    return Animated.decay(value, {
      velocity: initialVelocity,
      deceleration: 0.997,
      useNativeDriver: true,
    });
  }, []);

  const springPhysics = useRef<SpringPhysics>({
    tension: DEFAULT_SPRING_CONFIG.tension,
    friction: DEFAULT_SPRING_CONFIG.friction,
    mass: DEFAULT_SPRING_CONFIG.mass,
    velocity: 0,
    position: 0,
  }).current;

  const updateSpringPhysics = useCallback((
    dt: number,
    targetPosition: number = 0
  ): void => {
    const dx = targetPosition - springPhysics.position;
    const springForce = springPhysics.tension * dx;
    const dampingForce = -springPhysics.friction * springPhysics.velocity;
    const force = springForce + dampingForce;
    const acceleration = force / springPhysics.mass;
    
    springPhysics.velocity += acceleration * dt;
    springPhysics.position += springPhysics.velocity * dt;
  }, []);

  const createSpringAnimation = useCallback((
    value: Animated.Value,
    targetPosition: number,
    config: Partial<SpringConfig> = {}
  ): Animated.CompositeAnimation => {
    const springConfig = { ...DEFAULT_SPRING_CONFIG, ...config };
    
    return Animated.spring(value, {
      toValue: targetPosition,
      stiffness: springConfig.tension,
      damping: springConfig.friction,
      mass: springConfig.mass,
      velocity: springPhysics.velocity,
      overshootClamping: springConfig.overshootClamping,
      restDisplacementThreshold: springConfig.restPosition,
      restSpeedThreshold: springConfig.restVelocity,
      useNativeDriver: true,
    });
  }, []);

  const handleGestureEvent = useCallback((event: GestureEvent<PanGestureHandlerEventPayload>) => {
    if (!enabled || isAnimating) return;

    try {
      const { state, translationY, velocityY } = event.nativeEvent;
      const now = Date.now();
      const dt = (now - gestureContext.lastFrameTime) / 1000; // Convert to seconds
      const direction = velocityY > 0 ? 'down' : 'up';
      const smoothedVelocity = getSmoothedVelocity(velocityY, now);

      if (state === State.BEGAN) {
        performanceMetrics.gestureCount++;
        gestureContext.startTime = now;
        gestureContext.lastFrameTime = now;
        gestureContext.frameCount = 0;
        updateGestureState({
          active: true,
          progress: 0,
          velocity: 0,
          distance: 0,
        }, now);
      } else if (state === State.ACTIVE) {
        // Update spring physics during gesture
        springPhysics.position = translationY;
        springPhysics.velocity = smoothedVelocity;
        updateSpringPhysics(dt);

        updatePerformanceMetrics(now);
        if (shouldSkipFrame(now)) return;
        if (Math.abs(translationY) < gestureConfig.minDistance) return;

        if (!isDirectionAllowed(direction)) {
          const resistedTranslation = applyResistance(translationY, gestureConfig.resistanceFactor!);
          values.translateY.setValue(resistedTranslation);
          return;
        }

        const metrics = updateGestureMetrics(now, translationY, smoothedVelocity, direction);
        updateGestureState({
          ...metrics,
          active: true,
          lastUpdate: now,
        }, now);

        updateProgress(translationY);

        if (gestureConfig.enableHaptics && 
            gestureState.progress >= 1 && 
            gestureState.fps > 30) {
          Vibration.vibrate(platformConfig?.hapticDuration ?? 20);
        }

        Animated.event(
          [{ nativeEvent: { translationY: values.translateY } }],
          { useNativeDriver: true }
        )(event);

        callbacks?.onStart?.();
      } else if (state === State.END) {
        if (Math.abs(smoothedVelocity) > (gestureConfig.minVelocity ?? DEFAULT_CONFIG.minVelocity)) {
          // Use spring physics for natural deceleration
          createSpringAnimation(
            values.translateY,
            0,
            {
              initialVelocity: smoothedVelocity,
              tension: (springPhysics?.tension ?? 180) * (1 + Math.abs(smoothedVelocity) / 1000),
              overshootClamping: true,
            }
          ).start(({ finished }) => {
            if (finished) {
              handleGestureEnd(now);
            }
          });
        } else {
          handleGestureEnd(now);
        }
        if (debug.enabled && debug.logGestures) {
          console.log('Gesture Completed:', {
            metrics: gestureState,
            performance: {
              duration: now - gestureContext.startTime,
              fps: Math.round(1000 / gestureContext.averageFrameTime),
            },
          });
        }
      }
    } catch (error) {
      handleGestureError(createGestureError(
        'Error handling gesture event',
        'GESTURE_EVENT_ERROR',
        { event }
      ));
    }
  }, [values, onDismiss, gestureConfig, enabled, callbacks, isAnimating, updateProgress, isDirectionAllowed, updateGestureMetrics, shouldSkipFrame, updatePerformanceMetrics, updateGestureState, notifyGestureStateChange, getSmoothedVelocity, createSpringAnimation]);

  const handleGestureEnd = useCallback((now: number) => {
    if (!gestureState.active) return;
    
    const timeSinceLastUpdate = now - gestureState.lastUpdate;
    if (timeSinceLastUpdate > (gestureConfig?.debounceTime ?? DEFAULT_CONFIG.debounceTime)) return;

    gestureState.active = false;
    setIsAnimating(true);

    const velocity = getGestureVelocity(gestureState.velocity);
    const distance = getGestureDistance(gestureState.distance);

    if (shouldDismissGesture(velocity, distance) && 
        isDirectionAllowed(gestureState.direction)) {
      const direction = getDismissDirection(distance);
      handleDismissAnimation(direction);
    } else {
      handleResetAnimation();
    }
  }, [values, onDismiss, gestureConfig, enabled, callbacks, isAnimating, isDirectionAllowed]);

  const handleDismissAnimation = useCallback((direction: VerticalDirection) => {
    performanceMetrics.dismissCount++;
    createDismissAnimation(values.translateY, direction).start(result => {
      setIsAnimating(false);
      if (result.finished) {
        onDismiss?.();
        callbacks?.onComplete?.();
        logPerformance();
      } else {
        callbacks?.onError?.(new Error('Gesture animation interrupted'));
      }
    });
  }, [values, onDismiss, callbacks, setIsAnimating, logPerformance]);

  const handleResetAnimation = useCallback(() => {
    createResetAnimation(values.translateY).start(() => {
      setIsAnimating(false);
    });
  }, [values, setIsAnimating]);

  // Add safety timeouts
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  const safeSetAnimating = useCallback((value: boolean) => {
    setIsAnimating(value);
    if (value) {
      // Safety timeout to ensure animation state is reset
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        cleanup();
      }, gestureConfig.maxGestureDuration);
    }
  }, [gestureConfig.maxGestureDuration, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Add error boundary
  if (!values.translateY) {
    console.error('translateY value is required');
    return {
      handleGestureEvent: () => {},
      gestureState,
      isAnimating: false,
    };
  }

  return {
    handleGestureEvent,
    gestureState,
    isAnimating,
    metrics: debug.enabled ? performanceMetrics : undefined,
    cleanup,
  };
} 