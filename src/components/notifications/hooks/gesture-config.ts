import { Platform } from 'react-native';
import { GESTURE_THRESHOLDS } from '@/constants';
import type { VerticalDirection } from '@/types/animation-config';

export interface GestureConfig {
  threshold: number;
  velocityThreshold: number;
  minDistance: number;
  maxVelocity: number;
  debounceTime: number;
  allowedDirections?: VerticalDirection[];
  enableHaptics?: boolean;
  resistanceFactor?: number;
  maxGestureDuration?: number;
  minVelocity?: number;
}

export interface DebugConfig {
  enabled: boolean;
  logPerformance?: boolean;
  logGestures?: boolean;
  frameThreshold?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
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

export const PLATFORM_CONFIG = {
  ios: {
    hapticDuration: 20,
    frameThreshold: 16.67,
    animationTension: 40,
    animationFriction: 7,
  },
  android: {
    hapticDuration: 20,
    frameThreshold: 16.67,
    animationTension: 40,
    animationFriction: 7,
  },
} as const;

export const platformConfig = Platform.select(PLATFORM_CONFIG); 