import type { VerticalDirection } from './animation-config';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsVector extends Vector2D {
  magnitude: number;
  angle: number;
}

export type Axis = 'x' | 'y';
export type Direction2D = VerticalDirection | 'left' | 'right';

export interface MultiAxisPhysics {
  position: Vector2D;
  velocity: Vector2D;
  mass: number;
  tension: Vector2D;
  friction: Vector2D;
}

export interface AxisConstraints {
  x?: {
    min: number;
    max: number;
    enabled: boolean;
  };
  y?: {
    min: number;
    max: number;
    enabled: boolean;
  };
}

export interface PhysicsConstraints {
  axes: AxisConstraints;
  allowedDirections: Direction2D[];
  resistance: Vector2D;
} 