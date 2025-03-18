import type { GestureState } from 'react-native-gesture-handler';
import { GESTURE_THRESHOLDS } from '@/constants';
import type { GestureDistance, GestureVelocity } from '@/types';

export function getGestureVelocity(velocityY: number): GestureVelocity {
  return {
    x: 0,
    y: velocityY,
  };
}

export function getGestureDistance(translationY: number): GestureDistance {
  return {
    x: 0,
    y: translationY,
  };
}

export function shouldDismissGesture(
  velocity: GestureVelocity,
  distance: GestureDistance
): boolean {
  return (
    Math.abs(velocity.y) > GESTURE_THRESHOLDS.SWIPE_VELOCITY ||
    Math.abs(distance.y) > GESTURE_THRESHOLDS.SWIPE_DISTANCE
  );
}

export function getDismissDirection(distance: GestureDistance): -1 | 1 {
  return distance.y > 0 ? 
    GESTURE_THRESHOLDS.SWIPE_DIRECTION.DOWN : 
    GESTURE_THRESHOLDS.SWIPE_DIRECTION.UP;
}

export function isGestureEnd(state: GestureState): boolean {
  return state === GestureState.END;
} 