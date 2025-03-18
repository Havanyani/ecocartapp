import { ALERT_PRESETS, AnimationPresetBuilder } from '@/utils/animation-presets';

const SLIDE_VALUES = {
  up: -100,
  down: 100,
} as const;

export const ANIMATION_PRESETS = {
  ...ALERT_PRESETS,
  SLIDE_UP: new AnimationPresetBuilder()
    .compose([
      ALERT_PRESETS.FADE_IN,
      new AnimationPresetBuilder()
        .withSpring({
          tension: 90,
          friction: 20,
          mass: 0.5,
        })
        .build(),
    ])
    .build(),

  SLIDE_DOWN: new AnimationPresetBuilder()
    .compose([
      ALERT_PRESETS.FADE_OUT,
      new AnimationPresetBuilder()
        .withMomentum({
          velocity: 1.5,
          friction: 0.85,
        })
        .build(),
    ])
    .build(),
} as const;

export type AnimationPreset = keyof typeof ANIMATION_PRESETS;

export interface AnimationConfig {
  preset: keyof typeof ANIMATION_PRESETS;
  options?: {
    duration?: number;
    tension?: number;
    friction?: number;
    mass?: number;
    velocity?: number;
    bounciness?: number;
  };
}

export const GESTURE_ANIMATION_CONFIG = {
  swipeDismiss: {
    preset: 'SWIPE_DISMISS',
    options: {
      velocity: 2,
      friction: 0.9,
    },
  },
  snapBack: {
    preset: 'NATURAL_SPRING',
    options: {
      tension: 180,
      friction: 12,
    },
  },
} as const; 