import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance');

describe('WebSocketPerformance', () => {
  beforeEach(() => {
    // Reset metrics using public methods
    WebSocketPerformance.resetMetrics();
  });

  describe('message latency tracking', () => {
    it('tracks message latency correctly', () => {
      const messageId = '123';
      const startTime = 1000;
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 150);

      WebSocketPerformance.trackMessageLatency(messageId, 150);
      const summary = WebSocketPerformance.getMetricsSummary();
      expect(summary.averageLatency).toBe(150);
    });
  });

  describe('compression tracking', () => {
    it('calculates compression ratio correctly', () => {
      WebSocketPerformance.trackCompression(1000, 400);
      const summary = WebSocketPerformance.getMetricsSummary();
      expect(summary.averageCompressionRatio).toBe(0.4);
    });
  });

  describe('metrics summary', () => {
    it('provides accurate metrics summary', () => {
      WebSocketPerformance.trackProcessingTime('compress', 100);
      WebSocketPerformance.trackProcessingTime('encrypt', 50);
      WebSocketPerformance.trackBatch(5);

      const summary = WebSocketPerformance.getMetricsSummary();
      expect(summary.averageProcessingTime).toBe(75);
      expect(summary.averageBatchSize).toBe(5);
    });
  });

  describe('metrics trimming', () => {
    it('trims metrics when exceeding max size', () => {
      const MAX_METRICS = 1000;
      const extraMetrics = 100;

      // Add more than MAX_METRICS entries
      for (let i = 0; i < MAX_METRICS + extraMetrics; i++) {
        WebSocketPerformance.trackBatch(i);
      }

      const summary = WebSocketPerformance.getMetricsSummary();
      expect(summary.totalMetrics).toBe(MAX_METRICS);
    });
  });
}); 