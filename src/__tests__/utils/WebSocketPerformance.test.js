import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/Performance');

describe('WebSocketPerformance', () => {
  beforeEach(() => {
    // Reset metrics
    WebSocketPerformance.metrics = {
      messageLatency: [],
      connectionLatency: [],
      processingTime: [],
      compressionRatio: [],
      batchSize: []
    };
  });

  describe('message latency tracking', () => {
    it('tracks message latency correctly', () => {
      const messageId = '123';
      const startTime = 1000;
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(startTime + 150);

      const start = WebSocketPerformance.startMessageLatency(messageId);
      WebSocketPerformance.endMessageLatency(messageId, start);

      expect(WebSocketPerformance.metrics.messageLatency).toHaveLength(1);
      expect(WebSocketPerformance.metrics.messageLatency[0]).toBe(150);
    });
  });

  describe('compression tracking', () => {
    it('calculates compression ratio correctly', () => {
      WebSocketPerformance.trackCompressionRatio(1000, 400);
      expect(WebSocketPerformance.metrics.compressionRatio[0]).toBe(0.4);
    });
  });

  describe('metrics summary', () => {
    it('provides accurate metrics summary', () => {
      WebSocketPerformance.trackProcessingTime('compress', 100);
      WebSocketPerformance.trackProcessingTime('encrypt', 50);
      WebSocketPerformance.trackBatchSize(5);

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
        WebSocketPerformance.trackBatchSize(i);
      }

      expect(WebSocketPerformance.metrics.batchSize).toHaveLength(MAX_METRICS);
      expect(WebSocketPerformance.metrics.batchSize[0]).toBe(extraMetrics);
    });
  });
}); 