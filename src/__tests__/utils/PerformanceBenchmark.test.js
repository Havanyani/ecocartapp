import { WebSocketService } from '../../services/WebSocketService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../services/WebSocketService');
jest.mock('../../utils/WebSocketPerformance');
jest.mock('../../utils/Performance');

describe('PerformanceBenchmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    WebSocketPerformance.getMetricsSummary.mockReturnValue({
      averageLatency: 100,
      averageCompressionRatio: 0.5,
      totalMetrics: { failed: 0 }
    });
  });

  describe('runBenchmark', () => {
    it('runs benchmark with default options', async () => {
      const results = await PerformanceBenchmark.runBenchmark();
      
      expect(results.messagesSent).toBe(100);
      expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(100);
    });

    it('respects custom batch size', async () => {
      await PerformanceBenchmark.runBenchmark({ 
        messageCount: 10,
        batchSize: 2 
      });
      
      expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(10);
    });

    it('generates messages of correct size', async () => {
      const messageSize = 100;
      await PerformanceBenchmark.runBenchmark({ messageSize });
      
      const calls = WebSocketService.sendMessage.mock.calls;
      expect(calls[0][1].data.length).toBe(messageSize);
    });
  });

  describe('generateReport', () => {
    const mockResults = {
      totalTime: 1000,
      averageLatency: 100,
      throughput: 100,
      compressionRatio: 0.5,
      messagesSent: 100,
      messagesFailed: 0
    };

    it('formats results correctly', () => {
      const report = PerformanceBenchmark.generateReport(mockResults);
      
      expect(report.summary.totalTime).toBe('1000.00ms');
      expect(report.summary.throughput).toBe('100.00 msgs/sec');
      expect(report.summary.successRate).toBe('100.0%');
    });

    it('generates appropriate recommendations', () => {
      const highLatencyResults = { ...mockResults, averageLatency: 600 };
      const report = PerformanceBenchmark.generateReport(highLatencyResults);
      
      expect(report.recommendations).toContain(
        'Consider reducing batch size to improve latency'
      );
    });
  });
}); 