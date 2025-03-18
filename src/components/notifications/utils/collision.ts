import type { Vector2D } from '@/types/physics';

interface CollisionBox {
  position: Vector2D;
  size: Vector2D;
  velocity: Vector2D;
  id: string;
}

interface CollisionResult {
  hasCollision: boolean;
  normal?: Vector2D;
  penetration?: number;
  point?: Vector2D;
  time?: number;
}

interface CollisionManifold {
  a: CollisionBox;
  b: CollisionBox;
  normal: Vector2D;
  penetration: number;
  contacts: Vector2D[];
}

export class CollisionSystem {
  private boxes: Map<string, CollisionBox> = new Map();
  private collisionPairs: Set<string> = new Set();

  addBox(box: CollisionBox): void {
    this.boxes.set(box.id, box);
  }

  removeBox(id: string): void {
    this.boxes.delete(id);
    // Clean up collision pairs
    this.collisionPairs.forEach(pair => {
      if (pair.includes(id)) {
        this.collisionPairs.delete(pair);
      }
    });
  }

  private detectCollision(a: CollisionBox, b: CollisionBox): CollisionResult {
    // AABB collision detection
    const overlapX = Math.min(
      a.position.x + a.size.x - b.position.x,
      b.position.x + b.size.x - a.position.x
    );
    const overlapY = Math.min(
      a.position.y + a.size.y - b.position.y,
      b.position.y + b.size.y - a.position.y
    );

    if (overlapX < 0 || overlapY < 0) {
      return { hasCollision: false };
    }

    // Calculate collision normal
    const normal = {
      x: overlapX < overlapY ? Math.sign(b.position.x - a.position.x) : 0,
      y: overlapY < overlapX ? Math.sign(b.position.y - a.position.y) : 0,
    };

    return {
      hasCollision: true,
      normal,
      penetration: Math.min(overlapX, overlapY),
      point: {
        x: a.position.x + (a.size.x / 2),
        y: a.position.y + (a.size.y / 2),
      },
    };
  }

  private resolveCollision(manifold: CollisionManifold): void {
    const { a, b, normal, penetration } = manifold;
    const restitution = 0.5; // Bounciness factor
    const percent = 0.2; // Penetration resolution percentage

    // Calculate relative velocity
    const rv = {
      x: b.velocity.x - a.velocity.x,
      y: b.velocity.y - a.velocity.y,
    };

    // Calculate impulse scalar
    const velAlongNormal = rv.x * normal.x + rv.y * normal.y;
    if (velAlongNormal > 0) return;

    const j = -(1 + restitution) * velAlongNormal;
    const impulse = {
      x: j * normal.x,
      y: j * normal.y,
    };

    // Apply impulse
    a.velocity.x -= impulse.x;
    a.velocity.y -= impulse.y;
    b.velocity.x += impulse.x;
    b.velocity.y += impulse.y;

    // Positional correction
    const correction = {
      x: normal.x * penetration * percent,
      y: normal.y * penetration * percent,
    };

    a.position.x -= correction.x;
    a.position.y -= correction.y;
    b.position.x += correction.x;
    b.position.y += correction.y;
  }

  update(dt: number): void {
    // Broad phase - generate potential collision pairs
    const pairs: [CollisionBox, CollisionBox][] = [];
    const boxes = Array.from(this.boxes.values());

    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        pairs.push([boxes[i], boxes[j]]);
      }
    }

    // Narrow phase - detailed collision detection and resolution
    pairs.forEach(([a, b]) => {
      const result = this.detectCollision(a, b);
      if (result.hasCollision && result.normal && result.penetration) {
        const manifold: CollisionManifold = {
          a,
          b,
          normal: result.normal,
          penetration: result.penetration,
          contacts: result.point ? [result.point] : [],
        };
        this.resolveCollision(manifold);
      }
    });
  }
} 