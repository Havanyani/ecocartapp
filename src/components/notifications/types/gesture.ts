import type { GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import type { VerticalDirection } from './animation-config';

export type PanGestureEvent = GestureEvent<PanGestureHandlerEventPayload>;
export type PanGestureStateEvent = PanGestureEvent;

export interface GestureVelocity {
  x: number;
  y: number;
}

export interface GestureDistance {
  x: number;
  y: number;
}

// Gesture State Types
export interface GestureContext {
  startTime: number;
  lastFrameTime: number;
  frameCount: number;
  averageFrameTime: number;
}

export interface GestureMetrics {
  velocity: number;
  distance: number;
  direction: VerticalDirection;
  duration: number;
  fps: number;
}

export interface GestureState extends GestureMetrics {
  active: boolean;
  lastUpdate: number;
  progress: number;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  averageFrameTime: number;
  droppedFrames: number;
  totalFrames: number;
  gestureCount: number;
  dismissCount: number;
}

// Debug Types
export interface GestureDebugInfo {
  metrics: PerformanceMetrics;
  lastGesture: GestureMetrics;
  config: import('../hooks/gesture-config').GestureConfig;
}

// Utility Types
export type GestureStateKey = keyof GestureState;
export type GestureMetricKey = keyof GestureMetrics;

export type GestureStateUpdate = Partial<GestureState>;
export type GestureMetricsUpdate = Partial<GestureMetrics>;

export interface GestureStateChangeEvent {
  previous: GestureState;
  current: GestureState;
  timestamp: number;
}

export type GestureStateChangeHandler = (event: GestureStateChangeEvent) => void;

// Type Guards
export function isGestureMetrics(value: unknown): value is GestureMetrics {
  return (
    typeof value === 'object' &&
    value !== null &&
    'velocity' in value &&
    'distance' in value &&
    'direction' in value &&
    'duration' in value &&
    'fps' in value
  );
}

export function isGestureState(value: unknown): value is GestureState {
  return (
    isGestureMetrics(value) &&
    'active' in value &&
    'lastUpdate' in value &&
    'progress' in value
  );
} 