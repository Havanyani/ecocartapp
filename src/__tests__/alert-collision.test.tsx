import { QUEUE_CONFIG } from '../components/notifications/constants';
import { AlertCollisionManager } from '../components/notifications/utils/alert-collision';

describe('Alert Collision Management', () => {
  let collisionManager: AlertCollisionManager;

  beforeEach(() => {
    collisionManager = new AlertCollisionManager();
  });

  afterEach(() => {
    collisionManager.cleanup();
  });

  describe('Alert Spacing', () => {
    it('should maintain minimum spacing between alerts', () => {
      // Add two alerts close to each other
      collisionManager.addAlert({
        id: 'alert1',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      collisionManager.addAlert({
        id: 'alert2',
        layout: { x: 0, y: 5, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      // Check adjustment maintains minimum spacing
      const adjustment = collisionManager.getCollisionAdjustment('alert2');
      expect(Math.abs(adjustment.y)).toBe(QUEUE_CONFIG.stackSpacing - 5);
    });

    it('should handle multiple alerts stacking', () => {
      // Add alerts with clear overlap
      collisionManager.addAlert({
        id: 'alert0',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      // Add second alert with complete overlap
      collisionManager.addAlert({
        id: 'alert1',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0, // Same translateY to force overlap
        velocity: 0
      });

      // Verify adjustment
      const adjustment2 = collisionManager.getCollisionAdjustment('alert1');
      console.log('Alert positions:', {
        alert0: { y: 0, translateY: 0 },
        alert1: { y: 0, translateY: 0 }
      });
      console.log('Adjustment calculated:', adjustment2);
      expect(adjustment2.y).toBe(QUEUE_CONFIG.stackSpacing); // Should push up by full spacing
    });
  });

  describe('Position Updates', () => {
    it('should update alert positions correctly', () => {
      collisionManager.addAlert({
        id: 'alert1',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      // Move alert down
      collisionManager.updateAlertPosition('alert1', 50, 1);
      
      const adjustment = collisionManager.getCollisionAdjustment('alert1');
      expect(adjustment.y).toBe(0); // No adjustment needed when alone
    });
  });

  describe('Alert Removal', () => {
    it('should handle alert removal properly', () => {
      collisionManager.addAlert({
        id: 'alert1',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      collisionManager.removeAlert('alert1');
      
      const adjustment = collisionManager.getCollisionAdjustment('alert1');
      expect(adjustment).toEqual({ x: 0, y: 0 }); // Default when alert not found
    });
  });

  describe('Animation Frame Management', () => {
    it('should start and stop collision loop correctly', () => {
      const requestSpy = jest.spyOn(window, 'requestAnimationFrame');
      const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');

      collisionManager.addAlert({
        id: 'alert1',
        layout: { x: 0, y: 0, width: 300, height: QUEUE_CONFIG.alertHeight },
        translateY: 0,
        velocity: 0
      });

      expect(requestSpy).toHaveBeenCalled();

      collisionManager.removeAlert('alert1');
      expect(cancelSpy).toHaveBeenCalled();

      requestSpy.mockRestore();
      cancelSpy.mockRestore();
    });

    it('should handle rapid add/remove operations', () => {
      for (let i = 0; i < 10; i++) {
        collisionManager.addAlert({
          id: `alert${i}`,
          layout: { x: 0, y: i * 10, width: 300, height: QUEUE_CONFIG.alertHeight },
          translateY: 0,
          velocity: 0
        });
        collisionManager.removeAlert(`alert${i}`);
      }

      // Should not throw or leak animation frames
      expect(collisionManager.getCollisionAdjustment('alert0')).toEqual({ x: 0, y: 0 });
    });
  });
}); 