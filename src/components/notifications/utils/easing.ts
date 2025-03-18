import type { Vector2D } from '@/types/physics';

// Basic easing types
export type EasingFunction = (t: number) => number;
export type Vector2DEasingFunction = (t: number) => Vector2D;

interface SpringEasingConfig {
  mass: number;
  tension: number;
  friction: number;
  initialVelocity?: number;
}

// Physics-based spring easing
export function createSpringEasing(config: SpringEasingConfig): EasingFunction {
  const { mass, tension, friction, initialVelocity = 0 } = config;
  
  return (t: number): number => {
    // Solve spring differential equation: mx'' + cx' + kx = 0
    const c = friction;
    const k = tension;
    
    // Calculate damping ratio
    const dampingRatio = c / (2 * Math.sqrt(k * mass));
    
    if (dampingRatio < 1) {
      // Underdamped case
      const omega = Math.sqrt(k / mass);
      const omega_d = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
      
      return 1 - Math.exp(-dampingRatio * omega * t) * (
        Math.cos(omega_d * t) + 
        (dampingRatio * omega / omega_d) * Math.sin(omega_d * t)
      );
    } else if (dampingRatio === 1) {
      // Critically damped case
      const omega = Math.sqrt(k / mass);
      return 1 - (1 + omega * t) * Math.exp(-omega * t);
    } else {
      // Overdamped case
      const omega = Math.sqrt(k / mass);
      const s1 = -omega * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const s2 = -omega * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      return 1 - (s1 * Math.exp(s2 * t) - s2 * Math.exp(s1 * t)) / (s1 - s2);
    }
  };
}

// Bounce easing with physics
export function createBounceEasing(bounces: number = 3, decay: number = 0.7): EasingFunction {
  return (t: number): number => {
    let result = 0;
    let amplitude = 1;
    const frequency = Math.PI * 2;
    
    for (let i = 0; i < bounces; i++) {
      const phase = frequency * Math.pow(2, i);
      result += amplitude * Math.abs(Math.sin(phase * t));
      amplitude *= decay;
    }
    
    return 1 - result;
  };
}

// Elastic easing with physics
export function createElasticEasing(
  amplitude: number = 1,
  frequency: number = 3,
  decay: number = 0.5
): EasingFunction {
  return (t: number): number => {
    if (t === 0 || t === 1) return t;
    
    const decay_factor = Math.exp(-decay * t);
    const phase = frequency * Math.PI * 2 * t;
    
    return 1 - decay_factor * amplitude * Math.cos(phase);
  };
}

// Momentum-based easing
export function createMomentumEasing(
  initialVelocity: number = 1,
  friction: number = 0.95
): EasingFunction {
  return (t: number): number => {
    let velocity = initialVelocity;
    let position = 0;
    
    for (let i = 0; i < t * 60; i++) {
      position += velocity;
      velocity *= friction;
    }
    
    return Math.min(1, position);
  };
}

// Composite easing function
export function composeEasing(
  easings: EasingFunction[],
  weights: number[]
): EasingFunction {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  return (t: number): number => {
    return easings.reduce((sum, easing, i) => {
      return sum + (easing(t) * weights[i] / totalWeight);
    }, 0);
  };
} 