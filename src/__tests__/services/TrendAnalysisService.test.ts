import { TrendAnalysisService } from '../../services/TrendAnalysisService';

interface TestMetrics {
  messageLatency: number[];
  processingTime: Array<{ duration: number }>;
  compressionRatio: number[];
}

describe('TrendAnalysisService', () => {
  const generateTestData = (baseValue: number, trend: 'increasing' | 'decreasing' | 'stable', count: number): number[] => {
    return Array.from({ length: count }, (_, i) => {
      const trendValue = trend === 'increasing' ? i : trend === 'decreasing' ? -i : 0;
      return baseValue + trendValue + (Math.random() - 0.5);
    });
  };

  describe('analyzeTrends', () => {
    it('detects increasing trends', () => {
      const metrics: TestMetrics = {
        messageLatency: generateTestData(100, 'increasing', 20),
        processingTime: generateTestData(50, 'increasing', 20).map(duration => ({ duration })),
        compressionRatio: generateTestData(0.5, 'stable', 20)
      };

      const trends = TrendAnalysisService.analyzeTrends(metrics);
      expect(trends.latency.direction).toBe('increasing');
    });

    it('detects anomalies', () => {
      const normalData = Array(19).fill(100);
      const metrics: TestMetrics = {
        messageLatency: [...normalData, 1000], // Spike at the end
        processingTime: normalData.map(duration => ({ duration })),
        compressionRatio: Array(20).fill(0.5)
      };

      const trends = TrendAnalysisService.analyzeTrends(metrics);
      expect(trends.anomalies).toHaveLength(1);
      expect(trends.anomalies[0].type).toBe('latency');
    });

    it('calculates volatility correctly', () => {
      const stableData = Array(20).fill(100).map(x => x + (Math.random() - 0.5));
      const volatileData = Array(20).fill(100).map(x => x + (Math.random() - 0.5) * 50);

      const stableTrends = TrendAnalysisService.analyzeTrends({
        messageLatency: stableData,
        processingTime: stableData.map(duration => ({ duration })),
        compressionRatio: stableData.map(x => x / 100)
      });

      const volatileTrends = TrendAnalysisService.analyzeTrends({
        messageLatency: volatileData,
        processingTime: volatileData.map(duration => ({ duration })),
        compressionRatio: volatileData.map(x => x / 100)
      });

      expect(stableTrends.latency.isStable).toBe(true);
      expect(volatileTrends.latency.isStable).toBe(false);
    });
  });
}); 