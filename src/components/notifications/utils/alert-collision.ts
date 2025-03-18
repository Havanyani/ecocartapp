import type { LayoutRectangle } from 'react-native';
import { QUEUE_CONFIG } from '@/constants';
import type { Vector2D } from '@/types/physics';
import { CollisionSystem } from './collision';

interface AlertCollisionBox {
  id: string;
  layout: LayoutRectangle;
  translateY: number;
  velocity: number;
}

export class AlertCollisionManager {
  private collisionSystem: CollisionSystem;
  private alertBoxes: Map<string, AlertCollisionBox>;
  private animationFrameId: number | null = null;

  constructor() {
    this.collisionSystem = new CollisionSystem();
    this.alertBoxes = new Map();
  }

  addAlert(alert: AlertCollisionBox): void {
    this.alertBoxes.set(alert.id, alert);
    
    this.collisionSystem.addBox({
      id: alert.id,
      position: {
        x: alert.layout.x,
        y: alert.layout.y + alert.translateY,
      },
      size: {
        x: alert.layout.width,
        y: alert.layout.height,
      },
      velocity: {
        x: 0,
        y: alert.velocity,
      },
    });

    this.startCollisionLoop();
  }

  removeAlert(id: string): void {
    this.alertBoxes.delete(id);
    this.collisionSystem.removeBox(id);

    if (this.alertBoxes.size === 0) {
      this.stopCollisionLoop();
    }
  }

  updateAlertPosition(id: string, translateY: number, velocity: number): void {
    const alert = this.alertBoxes.get(id);
    if (!alert) return;

    alert.translateY = translateY;
    alert.velocity = velocity;

    this.collisionSystem.addBox({
      id,
      position: {
        x: alert.layout.x,
        y: alert.layout.y + translateY,
      },
      size: {
        x: alert.layout.width,
        y: alert.layout.height,
      },
      velocity: {
        x: 0,
        y: velocity,
      },
    });
  }

  private startCollisionLoop(): void {
    if (this.animationFrameId !== null) return;

    let lastTime = performance.now();
    const animate = () => {
      const currentTime = performance.now();
      const dt = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      this.collisionSystem.update(dt);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private stopCollisionLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getCollisionAdjustment(id: string): Vector2D {
    const boxes = Array.from(this.alertBoxes.values());
    const currentBox = boxes.find(box => box.id === id);
    if (!currentBox) return { x: 0, y: 0 };

    const adjustment: Vector2D = { x: 0, y: 0 };
    
    boxes.forEach(box => {
      if (box.id === id) return;

      const verticalDistance = (box.layout.y + box.translateY) - 
                             (currentBox.layout.y + currentBox.translateY);
      
      if (Math.abs(verticalDistance) < QUEUE_CONFIG.stackSpacing) {
        // When alerts overlap (distance = 0), push the current alert up
        const direction = verticalDistance === 0 ? 1 : Math.sign(verticalDistance);
        adjustment.y += direction * (QUEUE_CONFIG.stackSpacing - Math.abs(verticalDistance));
      }
    });

    return adjustment;
  }

  cleanup(): void {
    this.stopCollisionLoop();
    this.alertBoxes.clear();
  }
}

// Create a singleton instance
export const alertCollisionManager = new AlertCollisionManager(); 