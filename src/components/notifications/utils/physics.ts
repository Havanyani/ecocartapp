import type {
    SpringPhysics,
    VelocityTracker
} from '../types/animation-physics';
import { DEFAULT_PHYSICS_CONFIG } from '@/types/animation-physics';
import type {
    MultiAxisPhysics,
    PhysicsConstraints,
    PhysicsVector,
    Vector2D
} from '../types/physics';

// Add physics constants
const GRAVITY = 9.81; // m/s^2
const SCREEN_TO_PHYSICS_SCALE = 0.001; // Convert screen points to meters
const MIN_VELOCITY_THRESHOLD = 0.01;

// Add boundary types
interface PhysicsBoundary {
  min: number;
  max: number;
  bounce?: number;
  friction?: number;
}

// Add interpolation types
interface InterpolationConfig {
  tension: number;
  clamp?: boolean;
  epsilon?: number;
}

const DEFAULT_BOUNDARY: PhysicsBoundary = {
  min: -Number.MAX_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  bounce: 0.5,
  friction: 0.8,
};

const DEFAULT_INTERPOLATION: InterpolationConfig = {
  tension: 1,
  clamp: false,
  epsilon: 0.001,
};

interface PhysicsState {
  position: number;
  velocity: number;
  acceleration: number;
  timestamp: number;
}

export function createPhysicsState(
  initialPosition: number = 0,
  initialVelocity: number = 0
): PhysicsState {
  return {
    position: initialPosition,
    velocity: initialVelocity,
    acceleration: 0,
    timestamp: Date.now(),
  };
}

export function handleBoundaryCollision(
  physics: SpringPhysics,
  boundary: PhysicsBoundary = DEFAULT_BOUNDARY
): void {
  if (physics.position < boundary.min) {
    physics.position = boundary.min;
    physics.velocity *= -boundary.bounce! * boundary.friction!;
  } else if (physics.position > boundary.max) {
    physics.position = boundary.max;
    physics.velocity *= -boundary.bounce! * boundary.friction!;
  }
}

export function interpolateSpring(
  current: number,
  target: number,
  velocity: number,
  config: InterpolationConfig = DEFAULT_INTERPOLATION
): number {
  const diff = target - current;
  const absDiff = Math.abs(diff);

  if (absDiff < config.epsilon!) {
    return target;
  }

  // Tension affects how quickly we move toward the target
  const step = diff * config.tension;
  const result = current + step + velocity;

  if (config.clamp) {
    if (target > current) {
      return Math.min(result, target);
    } else {
      return Math.max(result, target);
    }
  }

  return result;
}

export function updateSpringPhysics(
  physics: SpringPhysics,
  dt: number,
  targetPosition: number = 0,
  damping: number = DEFAULT_PHYSICS_CONFIG.spring.friction,
  boundary?: PhysicsBoundary
): void {
  // Convert screen coordinates to physics world
  const scaledPosition = physics.position * SCREEN_TO_PHYSICS_SCALE;
  const scaledTarget = targetPosition * SCREEN_TO_PHYSICS_SCALE;
  
  const dx = scaledTarget - scaledPosition;
  const springForce = physics.tension * dx;
  const dampingForce = -damping * physics.velocity;
  const gravityForce = 0; // Can be enabled for gravity effects
  
  const totalForce = springForce + dampingForce + gravityForce;
  const acceleration = totalForce / physics.mass;
  
  // Verlet integration for better stability
  const prevVelocity = physics.velocity;
  physics.velocity += acceleration * dt;
  physics.position += (prevVelocity + physics.velocity) * 0.5 * dt;

  // Convert back to screen coordinates
  physics.position /= SCREEN_TO_PHYSICS_SCALE;

  // Add boundary handling
  if (boundary) {
    handleBoundaryCollision(physics, boundary);
  }
}

export function getSmoothedVelocity(
  tracker: VelocityTracker,
  currentVelocity: number,
  now: number,
  config = DEFAULT_PHYSICS_CONFIG.velocity
): number {
  // Remove stale samples
  const staleTime = now - (config.sampleInterval * config.maxSamples * 2);
  tracker.samples = tracker.samples.filter(sample => sample.timestamp > staleTime);
  
  // Add new sample
  tracker.samples.push({ velocity: currentVelocity, timestamp: now });
  
  // Keep fixed window of samples
  while (tracker.samples.length > config.maxSamples) {
    tracker.samples.shift();
  }

  if (tracker.samples.length < 2) {
    return currentVelocity;
  }

  // Calculate weighted moving average
  let totalWeight = 0;
  const smoothedVelocity = tracker.samples.reduce((acc, sample, index) => {
    const age = (now - sample.timestamp) / config.sampleInterval;
    const weight = Math.pow(config.decayRate, age);
    totalWeight += weight;
    return acc + sample.velocity * weight;
  }, 0);

  return Math.abs(smoothedVelocity / totalWeight) < MIN_VELOCITY_THRESHOLD 
    ? 0 
    : smoothedVelocity / totalWeight;
}

export function predictFinalPosition(
  physics: SpringPhysics,
  velocity: number,
  position: number
): number {
  // Use energy conservation to predict resting position
  const kineticEnergy = 0.5 * physics.mass * velocity * velocity;
  const springConstant = physics.tension;
  
  // Solve quadratic equation for displacement
  const displacement = Math.sqrt(2 * kineticEnergy / springConstant);
  return position + (velocity > 0 ? displacement : -displacement);
}

export function shouldAnimateToRest(
  physics: SpringPhysics,
  velocity: number,
  position: number,
  targetPosition: number
): boolean {
  const predictedPosition = predictFinalPosition(physics, velocity, position);
  const distanceToTarget = Math.abs(predictedPosition - targetPosition);
  
  return distanceToTarget > MIN_VELOCITY_THRESHOLD;
}

export function createInterpolatedSpring(
  initialValue: number,
  config?: Partial<InterpolationConfig>
): {
  update: (target: number, velocity: number) => number;
  reset: (value: number) => void;
  getValue: () => number;
} {
  let currentValue = initialValue;
  const interpolationConfig = { ...DEFAULT_INTERPOLATION, ...config };

  return {
    update: (target: number, velocity: number) => {
      currentValue = interpolateSpring(
        currentValue,
        target,
        velocity,
        interpolationConfig
      );
      return currentValue;
    },
    reset: (value: number) => {
      currentValue = value;
    },
    getValue: () => currentValue,
  };
}

// Vector utilities
export function createVector(x: number, y: number): PhysicsVector {
  const magnitude = Math.sqrt(x * x + y * y);
  const angle = Math.atan2(y, x);
  return { x, y, magnitude, angle };
}

export function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function multiplyVector(v: Vector2D, scalar: number): Vector2D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function updateMultiAxisPhysics(
  physics: MultiAxisPhysics,
  dt: number,
  target: Vector2D,
  constraints?: PhysicsConstraints
): void {
  // Calculate forces for each axis
  const dx = target.x - physics.position.x;
  const dy = target.y - physics.position.y;

  const springForceX = physics.tension.x * dx;
  const springForceY = physics.tension.y * dy;

  const dampingForceX = -physics.friction.x * physics.velocity.x;
  const dampingForceY = -physics.friction.y * physics.velocity.y;

  // Apply constraints if provided
  if (constraints?.axes) {
    if (constraints.axes.x?.enabled) {
      const { min, max } = constraints.axes.x;
      if (physics.position.x < min || physics.position.x > max) {
        physics.velocity.x *= -0.5; // Bounce effect
      }
    }
    if (constraints.axes.y?.enabled) {
      const { min, max } = constraints.axes.y;
      if (physics.position.y < min || physics.position.y > max) {
        physics.velocity.y *= -0.5; // Bounce effect
      }
    }
  }

  // Calculate acceleration
  const accelerationX = (springForceX + dampingForceX) / physics.mass;
  const accelerationY = (springForceY + dampingForceY) / physics.mass;

  // Verlet integration for each axis
  const prevVelocityX = physics.velocity.x;
  const prevVelocityY = physics.velocity.y;

  physics.velocity.x += accelerationX * dt;
  physics.velocity.y += accelerationY * dt;

  physics.position.x += (prevVelocityX + physics.velocity.x) * 0.5 * dt;
  physics.position.y += (prevVelocityY + physics.velocity.y) * 0.5 * dt;
}

export function createMultiAxisPhysics(
  initialPosition: Vector2D = { x: 0, y: 0 },
  config = DEFAULT_PHYSICS_CONFIG
): MultiAxisPhysics {
  return {
    position: { ...initialPosition },
    velocity: { x: 0, y: 0 },
    mass: config.spring.mass,
    tension: { x: config.spring.tension, y: config.spring.tension },
    friction: { x: config.spring.friction, y: config.spring.friction },
  };
} 