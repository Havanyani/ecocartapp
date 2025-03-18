import { WebSocketService } from '../../services/WebSocketService';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

interface BenchmarkMetrics {
  timestamp: number;
  latency: number;
  throughput: number;
  compression: number;
  errors: number;
}

interface BenchmarkResult {
  metrics: BenchmarkMetrics[];
  summary: {
    averageLatency: number;
    averageThroughput: number;
    averageErrorRate: number;
    bestScenario: string;
    worstScenario: string;
  };
}

jest.mock('../../services/WebSocketService');
jest.mock('../../utils/WebSocketPerformance');
jest.mock('../../utils/Performance');

describe('PerformanceBenchmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (WebSocketPerformance.getMetricsSummary as jest.Mock).mockReturnValue({
      averageLatency: 100,
      averageCompressionRatio: 0.5,
      totalMetrics: { failed: 0 }
    });
  });

  describe('runBenchmark', () => {
    it('runs benchmark with default options', async () => {
      const results = await PerformanceBenchmark.runBenchmark();
      expect(results.summary.averageThroughput).toBe(100);
      expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(100);
    });

    it('respects custom batch size', async () => {
      await PerformanceBenchmark.runBenchmark();
      expect(WebSocketService.sendMessage).toHaveBeenCalledTimes(10);
    });

    it('generates messages of correct size', async () => {
      await PerformanceBenchmark.runBenchmark();
      const calls = (WebSocketService.sendMessage as jest.Mock).mock.calls;
      expect(calls[0][1].data.length).toBeGreaterThan(0);
    });
  });

  describe('benchmark summary', () => {
    const mockMetrics: BenchmarkMetrics[] = [{
      timestamp: Date.now(),
      latency: 100,
      throughput: 100,
      compression: 0.5,
      errors: 0
    }];

    it('formats metrics correctly', async () => {
      const results = await PerformanceBenchmark.runBenchmark();
      expect(results.summary.averageLatency).toBe(100);
      expect(results.summary.averageThroughput).toBe(100);
      expect(results.summary.averageErrorRate).toBe(0);
    });

    it('handles high latency cases', async () => {
      const highLatencyMetrics = [{
        ...mockMetrics[0],
        latency: 600
      }];
      const results = await PerformanceBenchmark.runBenchmark();
      expect(results.summary.worstScenario).toContain('latency');
    });
  });
}); 