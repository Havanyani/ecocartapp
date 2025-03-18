import { BenchmarkComparison } from '../../utils/BenchmarkComparison';

interface BenchmarkResults {
  results: {
    averageLatency: number;
    throughput: number;
    compressionRatio: number;
  };
}

describe('BenchmarkComparison', () => {
  const baselineResults: BenchmarkResults = {
    results: {
      averageLatency: 100,
      throughput: 1000,
      compressionRatio: 0.5
    }
  };

  describe('compare', () => {
    it('detects improvements correctly', () => {
      const currentResults: BenchmarkResults = {
        results: {
          averageLatency: 80, // 20% improvement
          throughput: 1200, // 20% improvement
          compressionRatio: 0.4 // 20% improvement
        }
      };

      const comparison = BenchmarkComparison.compare(baselineResults, currentResults);
      
      expect(comparison.summary.improved).toHaveLength(3);
      expect(comparison.summary.degraded).toHaveLength(0);
    });

    it('detects degradations correctly', () => {
      const currentResults: BenchmarkResults = {
        results: {
          averageLatency: 150, // 50% worse
          throughput: 800, // 20% worse
          compressionRatio: 0.7 // 40% worse
        }
      };

      const comparison = BenchmarkComparison.compare(baselineResults, currentResults);
      
      expect(comparison.summary.degraded).toHaveLength(3);
      expect(comparison.summary.improved).toHaveLength(0);
    });

    it('categorizes significance levels correctly', () => {
      const currentResults: BenchmarkResults = {
        results: {
          averageLatency: 130, // 30% worse - high
          throughput: 1050, // 5% better - low
          compressionRatio: 0.6 // 20% worse - medium
        }
      };

      const comparison = BenchmarkComparison.compare(baselineResults, currentResults);
      
      expect(comparison.latency.significance).toBe('high');
      expect(comparison.throughput.significance).toBe('low');
      expect(comparison.compression.significance).toBe('medium');
    });
  });

  describe('generateReport', () => {
    it('generates appropriate recommendations', () => {
      const comparison = BenchmarkComparison.compare(baselineResults, {
        results: {
          averageLatency: 150,
          throughput: 800,
          compressionRatio: 0.7
        }
      });

      const report = BenchmarkComparison.generateReport(comparison);
      
      expect(report.recommendations).toContain('Consider optimizing message processing');
      expect(report.recommendations).toContain('Review batch size configuration');
      expect(report.recommendations).toContain('Evaluate compression settings');
    });
  });
}); 