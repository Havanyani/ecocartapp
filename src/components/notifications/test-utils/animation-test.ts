import type { Vector2D } from '@/types/physics';
import type { AnimationFactoryConfig } from '@/utils/animation-factory';

interface AnimationTestConfig {
  duration: number;
  fromValue: number;
  toValue: number;
  frames?: number;
}

interface GestureTestConfig {
  startPosition: Vector2D;
  endPosition: Vector2D;
  duration: number;
  frames?: number;
}

export class AnimationTestRunner {
  private time: number = 0;
  private frameCallback?: (frame: number) => void;

  mockRequestAnimationFrame(callback: (frame: number) => void): void {
    this.frameCallback = callback;
  }

  advanceTime(ms: number): void {
    this.time += ms;
    this.frameCallback?.(this.time);
  }

  runAnimation(config: AnimationTestConfig): number[] {
    const frames = config.frames || Math.floor(config.duration / 16);
    const frameTime = config.duration / frames;
    const values: number[] = [];

    for (let i = 0; i < frames; i++) {
      this.advanceTime(frameTime);
      values.push(this.frameCallback?.(this.time) ?? 0);
    }

    return values;
  }

  simulateGesture(config: GestureTestConfig): Vector2D[] {
    const frames = config.frames || Math.floor(config.duration / 16);
    const frameTime = config.duration / frames;
    const positions: Vector2D[] = [];

    for (let i = 0; i < frames; i++) {
      const progress = i / (frames - 1);
      positions.push({
        x: config.startPosition.x + (config.endPosition.x - config.startPosition.x) * progress,
        y: config.startPosition.y + (config.endPosition.y - config.startPosition.y) * progress,
      });
      this.advanceTime(frameTime);
    }

    return positions;
  }
}

// Animation test helpers
export function createAnimationTestConfig(
  preset: AnimationFactoryConfig,
  fromValue: number,
  toValue: number
): AnimationTestConfig {
  return {
    duration: preset.duration,
    fromValue,
    toValue,
    frames: Math.floor(preset.duration / 16),
  };
}

// Gesture test helpers
export function createGestureTestConfig(
  startY: number,
  endY: number,
  duration: number = 300
): GestureTestConfig {
  return {
    startPosition: { x: 0, y: startY },
    endPosition: { x: 0, y: endY },
    duration,
    frames: Math.floor(duration / 16),
  };
}

// Test assertions
export function expectSmoothAnimation(values: number[]): void {
  // Check for smooth transitions between values
  for (let i = 1; i < values.length; i++) {
    const delta = Math.abs(values[i] - values[i - 1]);
    expect(delta).toBeLessThan(50); // Adjust threshold as needed
  }
}

export function expectCompletedAnimation(values: number[], target: number): void {
  const finalValue = values[values.length - 1];
  expect(Math.abs(finalValue - target)).toBeLessThan(0.1);
}

export function expectNoJank(values: number[]): void {
  // Check for frame drops (large gaps between values)
  for (let i = 1; i < values.length; i++) {
    const frameDuration = 16.67; // 60fps
    const delta = Math.abs(values[i] - values[i - 1]);
    const velocity = delta / frameDuration;
    expect(velocity).toBeLessThan(1000); // Adjust threshold as needed
  }
} 