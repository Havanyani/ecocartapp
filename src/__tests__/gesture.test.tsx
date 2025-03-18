import { ANIMATION_CONFIG } from '../components/notifications/constants';
import {
  getDismissDirection,
  getGestureDistance,
  getGestureVelocity,
  isGestureEnd,
  shouldDismissGesture
} from '../components/notifications/utils/gesture';

describe('Gesture Utilities', () => {
  describe('Gesture State Detection', () => {
    it('should correctly identify end state', () => {
      const END_STATE = 5;
      const ACTIVE_STATE = 4;
      
      expect(isGestureEnd(END_STATE)).toBe(true);
      expect(isGestureEnd(ACTIVE_STATE)).toBe(false);
    });

    it('should handle invalid states', () => {
      expect(isGestureEnd(undefined)).toBe(false);
      expect(isGestureEnd(null)).toBe(false);
      expect(isGestureEnd(-1)).toBe(false);
    });
  });

  describe('Gesture Measurements', () => {
    it('should calculate correct gesture distance', () => {
      expect(getGestureDistance(100)).toBe(100);
      expect(getGestureDistance(-100)).toBe(-100);
      expect(getGestureDistance(0)).toBe(0);
    });

    it('should normalize gesture velocity', () => {
      const slowVelocity = getGestureVelocity(100);
      const fastVelocity = getGestureVelocity(1000);
      const negativeVelocity = getGestureVelocity(-500);

      expect(slowVelocity).toBeLessThan(fastVelocity);
      expect(negativeVelocity).toBeLessThan(0);
      expect(getGestureVelocity(0)).toBe(0);
    });

    it('should clamp extreme velocities', () => {
      const maxVelocity = getGestureVelocity(10000);
      const minVelocity = getGestureVelocity(-10000);

      expect(maxVelocity).toBeLessThan(ANIMATION_CONFIG.gesture.maxVelocity);
      expect(minVelocity).toBeGreaterThan(-ANIMATION_CONFIG.gesture.maxVelocity);
    });
  });

  describe('Dismissal Logic', () => {
    it('should determine correct dismiss direction', () => {
      expect(getDismissDirection(100)).toBe(1); // Down
      expect(getDismissDirection(-100)).toBe(-1); // Up
      expect(getDismissDirection(0)).toBe(1); // Default down
    });

    it('should decide dismissal based on velocity and distance', () => {
      // Should dismiss with high velocity
      expect(shouldDismissGesture(500, 10)).toBe(true);
      
      // Should dismiss with sufficient distance
      expect(shouldDismissGesture(10, 100)).toBe(true);
      
      // Should not dismiss with low velocity and distance
      expect(shouldDismissGesture(10, 10)).toBe(false);
    });

    it('should respect minimum gesture thresholds', () => {
      const minDistance = ANIMATION_CONFIG.gesture.minDistance;
      const minVelocity = ANIMATION_CONFIG.gesture.minVelocity;

      expect(shouldDismissGesture(
        minVelocity - 1,
        minDistance - 1
      )).toBe(false);

      expect(shouldDismissGesture(
        minVelocity + 1,
        minDistance + 1
      )).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      expect(getGestureDistance(0)).toBe(0);
      expect(getGestureVelocity(0)).toBe(0);
      expect(shouldDismissGesture(0, 0)).toBe(false);
    });

    it('should handle NaN and invalid inputs', () => {
      expect(getGestureDistance(NaN)).toBe(0);
      expect(getGestureVelocity(NaN)).toBe(0);
      expect(shouldDismissGesture(NaN, NaN)).toBe(false);
    });

    it('should handle floating point values', () => {
      expect(getGestureDistance(10.5)).toBeCloseTo(10.5);
      expect(getGestureVelocity(10.5)).toBeCloseTo(10.5);
    });
  });

  describe('Performance', () => {
    it('should handle rapid gesture updates', () => {
      const velocities = Array.from({ length: 1000 }, (_, i) => i);
      const distances = Array.from({ length: 1000 }, (_, i) => i);

      // Should not cause significant delay
      const start = performance.now();
      
      velocities.forEach((v, i) => {
        shouldDismissGesture(v, distances[i]);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('Gesture Configuration', () => {
    it('should respect gesture configuration', () => {
      const { minDistance, minVelocity } = ANIMATION_CONFIG.gesture;

      // Just below thresholds
      expect(shouldDismissGesture(
        minVelocity * 0.9,
        minDistance * 0.9
      )).toBe(false);

      // Just above thresholds
      expect(shouldDismissGesture(
        minVelocity * 1.1,
        minDistance * 1.1
      )).toBe(true);
    });
  });
});