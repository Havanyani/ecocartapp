export interface SpringPhysics {
  tension: number;
  friction: number;
  mass: number;
  velocity: number;
  position: number;
}

export interface VelocityTracker {
  samples: Array<{
    velocity: number;
    timestamp: number;
  }>;
  maxSamples: number;
  decayRate: number;
}

export interface PhysicsConfig {
  spring: SpringConfig;
  momentum: MomentumConfig;
  velocity: {
    maxSamples: number;
    decayRate: number;
    sampleInterval: number;
  };
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  spring: {
    tension: 180,
    friction: 12,
    mass: 1,
    restPosition: 0,
    restVelocity: 0.001,
    overshootClamping: false,
  },
  momentum: {
    enabled: true,
    minVelocity: 0.1,
    friction: 6,
    bounciness: 1,
  },
  velocity: {
    maxSamples: 5,
    decayRate: 0.95,
    sampleInterval: 16.67, // 60fps
  },
}; 