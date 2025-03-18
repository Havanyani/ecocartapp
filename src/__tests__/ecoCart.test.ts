import { EcoCartAnalytics } from '../services/EcoCartAnalytics';

interface TestMetrics {
  plasticCollection: {
    weight: number;
    type: string;
    timestamp: string;
    customerId: string;
    deliveryPersonnelId: string;
    linkedToGroceryOrder: boolean;
    creditAwarded: number;
  };
  groceryDelivery: {
    orderId: string;
    deliveryTime: string;
    hasPlasticPickup: boolean;
    ecoFriendlyPackaging: boolean;
    route: {
      optimizationScore: number;
      distance: number;
      duration: number;
    };
  };
  customerEngagement: {
    userId: string;
    pickupSchedules: Array<{
      date: string;
      completed: boolean;
      weight?: number;
    }>;
    creditUsage: Array<{
      amount: number;
      date: string;
      orderId: string;
    }>;
    feedback: Array<{
      rating: number;
      comment?: string;
      date: string;
    }>;
  };
}

describe('EcoCartAnalytics', () => {
  const mockMetrics: TestMetrics[] = [
    {
      plasticCollection: {
        weight: 5.2,
        type: 'PET',
        timestamp: '2024-03-20T09:00:00Z',
        customerId: 'user123',
        deliveryPersonnelId: 'delivery456',
        linkedToGroceryOrder: true,
        creditAwarded: 52
      },
      groceryDelivery: {
        orderId: 'order789',
        deliveryTime: '2024-03-20T09:30:00Z',
        hasPlasticPickup: true,
        ecoFriendlyPackaging: true,
        route: {
          optimizationScore: 0.85,
          distance: 12.5,
          duration: 30
        }
      },
      customerEngagement: {
        userId: 'user123',
        pickupSchedules: [
          { date: '2024-03-20', completed: true, weight: 5.2 }
        ],
        creditUsage: [
          { amount: 25, date: '2024-03-19', orderId: 'order789' }
        ],
        feedback: [
          { rating: 5, comment: 'Great service!', date: '2024-03-20' }
        ]
      }
    }
  ];

  describe('analyzeComprehensiveMetrics', () => {
    it('analyzes plastic collection metrics', async () => {
      const analysis = await EcoCartAnalytics.analyzeComprehensiveMetrics(
        mockMetrics,
        { start: new Date('2024-03-01'), end: new Date('2024-03-31') }
      );

      expect(analysis.plasticCollection.volumeMetrics.totalWeight).toBe(5.2);
      expect(analysis.plasticCollection.volumeMetrics.averagePerPickup).toBe(5.2);
      expect(analysis.plasticCollection.volumeMetrics.typeDistribution['PET']).toBe(1);
    });

    it('analyzes delivery efficiency', async () => {
      const analysis = await EcoCartAnalytics.analyzeComprehensiveMetrics(
        mockMetrics,
        { start: new Date('2024-03-01'), end: new Date('2024-03-31') }
      );

      expect(analysis.deliveryEfficiency.routeOptimization.averageOptimizationScore).toBe(0.85);
      expect(analysis.deliveryEfficiency.routeOptimization.distanceSaved).toBeGreaterThan(0);
      expect(analysis.deliveryEfficiency.timeEfficiency).toBeGreaterThan(0);
    });

    it('analyzes customer behavior', async () => {
      const analysis = await EcoCartAnalytics.analyzeComprehensiveMetrics(
        mockMetrics,
        { start: new Date('2024-03-01'), end: new Date('2024-03-31') }
      );

      expect(analysis.customerBehavior.participationPatterns['2024-03-20']).toBe(1);
      expect(analysis.customerBehavior.creditUtilization['2024-03-19']).toBe(25);
      expect(analysis.customerBehavior.feedbackAnalysis.averageRating).toBe(5);
    });

    it('analyzes environmental impact', async () => {
      const analysis = await EcoCartAnalytics.analyzeComprehensiveMetrics(
        mockMetrics,
        { start: new Date('2024-03-01'), end: new Date('2024-03-31') }
      );

      expect(analysis.environmentalImpact.plasticDiversion).toBeGreaterThan(0);
      expect(analysis.environmentalImpact.carbonFootprint).toBeGreaterThan(0);
      expect(analysis.environmentalImpact.recyclingEfficiency).toBeGreaterThan(0);
    });

    it('generates actionable insights', async () => {
      const analysis = await EcoCartAnalytics.analyzeComprehensiveMetrics(
        mockMetrics,
        { start: new Date('2024-03-01'), end: new Date('2024-03-31') }
      );

      expect(analysis.recommendations.immediateActions).toBeInstanceOf(Array);
      expect(analysis.recommendations.shortTermOptimizations).toBeInstanceOf(Array);
      expect(analysis.recommendations.longTermStrategies).toBeInstanceOf(Array);
    });
  });
}); 