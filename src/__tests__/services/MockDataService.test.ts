import { MockDataService } from '@/services/MockDataService';

describe('MockDataService', () => {
  let mockDataService: MockDataService;

  beforeEach(() => {
    mockDataService = new MockDataService();
  });

  describe('User Generation', () => {
    it('should generate valid mock user data', () => {
      const user = mockDataService.generateMockUser();

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user.address).toHaveProperty('coordinates');
      expect(user.credits).toHaveProperty('available');
      expect(user.environmentalImpact).toHaveProperty('plasticCollected');
    });

    it('should generate realistic credit values', () => {
      const user = mockDataService.generateMockUser();

      expect(user.credits.available).toBeGreaterThanOrEqual(0);
      expect(user.credits.pending).toBeGreaterThanOrEqual(0);
      expect(user.credits.lifetimeEarned).toBeGreaterThan(user.credits.available);
    });
  });

  describe('Order Generation', () => {
    it('should generate valid mock order data', () => {
      const order = mockDataService.generateMockOrder();

      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
      expect(order.items.length).toBeGreaterThan(0);
      expect(order.totalAmount).toBeGreaterThan(0);
    });

    it('should include plastic collection details', () => {
      const order = mockDataService.generateMockOrder();

      expect(order.plasticCollection).toHaveProperty('estimatedWeight');
      expect(order.plasticCollection).toHaveProperty('earnedCredits');
      expect(order.plasticCollection.environmentalImpact).toBeDefined();
    });
  });

  describe('Plastic Collection Generation', () => {
    it('should generate valid mock plastic collection data', () => {
      const collection = mockDataService.generateMockPlasticCollection();

      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('status');
      expect(collection).toHaveProperty('scheduledTime');
      expect(collection.estimatedWeight).toBeGreaterThan(0);
    });

    it('should calculate realistic environmental impact', () => {
      const collection = mockDataService.generateMockPlasticCollection();

      expect(collection.environmentalImpact.plasticCollected).toBeGreaterThan(0);
      expect(collection.environmentalImpact.co2Reduced).toBeGreaterThan(0);
      expect(collection.environmentalImpact.treesEquivalent).toBeGreaterThan(0);
    });
  });

  describe('Delivery Route Generation', () => {
    it('should generate valid mock delivery route data', () => {
      const route = mockDataService.generateMockDeliveryRoute();

      expect(route).toHaveProperty('id');
      expect(route).toHaveProperty('deliveryPersonId');
      expect(route.stops.length).toBeGreaterThanOrEqual(3);
      expect(route.metrics).toBeDefined();
    });

    it('should include both delivery and pickup stops', () => {
      const route = mockDataService.generateMockDeliveryRoute();
      const hasDelivery = route.stops.some(stop => stop.type === 'delivery');
      const hasPickup = route.stops.some(stop => stop.type === 'pickup');

      expect(hasDelivery).toBeTruthy();
      expect(hasPickup).toBeTruthy();
    });

    it('should calculate realistic route metrics', () => {
      const route = mockDataService.generateMockDeliveryRoute();

      expect(route.metrics.totalDistance).toBeGreaterThan(0);
      expect(route.metrics.estimatedDuration).toBeGreaterThan(0);
      expect(route.metrics.co2Savings).toBeGreaterThan(0);
    });
  });
}); 