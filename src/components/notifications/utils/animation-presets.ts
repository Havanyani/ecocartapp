import type { AnimationFactoryConfig } from './animation-factory';

interface PresetOptions {
  duration?: number;
  tension?: number;
  friction?: number;
  mass?: number;
  velocity?: number;
  bounciness?: number;
}

export class AnimationPresetBuilder {
  private animations: AnimationFactoryConfig[] = [];

  compose(animations: AnimationFactoryConfig[]) {
    this.animations = animations;
    return this;
  }

  withSpring(config: PresetOptions) {
    this.animations.push({
      type: 'spring',
      duration: config.duration ?? 300,
      physics: {
        tension: config.tension ?? 180,
        friction: config.friction ?? 12,
        mass: config.mass ?? 1,
      },
    });
    return this;
  }

  withBounce(options: PresetOptions = {}): this {
    this.animations.push({
      type: 'bounce',
      duration: options.duration ?? 300,
      bounces: Math.round(options.bounciness ?? 3),
      decay: options.friction ?? 0.7,
    });
    return this;
  }

  withElastic(options: PresetOptions = {}): this {
    this.animations.push({
      type: 'elastic',
      duration: options.duration ?? 400,
      amplitude: options.tension ?? 1,
      frequency: options.friction ?? 3,
      decay: options.mass ?? 0.5,
    });
    return this;
  }

  withMomentum(options: PresetOptions = {}): this {
    this.animations.push({
      type: 'momentum',
      duration: options.duration ?? 500,
      initialVelocity: options.velocity ?? 1,
      friction: options.friction ?? 0.95,
    });
    return this;
  }

  build(): AnimationFactoryConfig {
    if (this.animations.length === 0) {
      throw new Error('Animation type must be specified');
    }
    return {
      type: 'composite',
      duration: Math.max(...this.animations.map(c => c.duration)),
      animations: this.animations,
      weights: this.animations.map(() => 1 / this.animations.length)
    };
  }
}

// Define preset collections
export const ALERT_PRESETS = {
  FADE_IN: new AnimationPresetBuilder()
    .withSpring({
      duration: 300,
      tension: 120,
      friction: 14,
    })
    .build(),

  FADE_OUT: new AnimationPresetBuilder()
    .withMomentum({
      duration: 200,
      velocity: 1,
      friction: 0.92,
    })
    .build(),

  SCALE_IN: new AnimationPresetBuilder()
    .withElastic({
      duration: 400,
      tension: 0.8,
      friction: 2.5,
      mass: 0.6,
    })
    .build(),

  SCALE_OUT: new AnimationPresetBuilder()
    .withSpring({
      duration: 250,
      tension: 150,
      friction: 10,
    })
    .build(),

  SWIPE_DISMISS: new AnimationPresetBuilder()
    .compose([
      new AnimationPresetBuilder()
        .withMomentum({ velocity: 2, friction: 0.9 })
        .build(),
      new AnimationPresetBuilder()
        .withSpring({ tension: 180, friction: 12 })
        .build(),
    ])
    .build(),
};

// Create custom preset helpers
export function createCustomPreset(
  type: AnimationFactoryConfig['type'],
  options: PresetOptions
): AnimationFactoryConfig {
  const builder = new AnimationPresetBuilder();
  switch (type) {
    case 'spring':
      return builder.withSpring(options).build();
    case 'bounce':
      return builder.withBounce(options).build();
    case 'elastic':
      return builder.withElastic(options).build();
    case 'momentum':
      return builder.withMomentum(options).build();
    default:
      throw new Error(`Unknown animation type: ${type}`);
  }
}

export function createCompositePreset(
  configs: Array<{ type: AnimationFactoryConfig['type']; options: PresetOptions }>,
  weights?: number[]
): AnimationFactoryConfig {
  const animations = configs.map(({ type, options }) => 
    createCustomPreset(type, options)
  );
  return new AnimationPresetBuilder().compose(animations).build();
} 