import { PerformanceMonitor } from './PerformanceMonitoring';

interface BenchmarkResults {
  averageLatency: number;
  throughput: number;
  compressionRatio: number;
}

interface BenchmarkData {
  results: BenchmarkResults;
}

interface MetricComparison {
  baseline: number;
  current: number;
  percentChange: number;
  isImprovement: boolean;
  significance: 'high' | 'medium' | 'low';
}

interface MetricSummary {
  metric: string;
  change: number;
}

interface ComparisonSummary {
  improved: MetricSummary[];
  degraded: MetricSummary[];
  unchanged: MetricSummary[];
}

interface ComparisonResult {
  latency: MetricComparison;
  throughput: MetricComparison;
  compression: MetricComparison;
  summary: ComparisonSummary;
}

interface ComparisonReport {
  summary: string;
  improvements: string[];
  degradations: string[];
  recommendations: string[];
}

type PreferredDirection = 'higher' | 'lower';

export class BenchmarkComparison {
  static compare(baseline: BenchmarkData, current: BenchmarkData): ComparisonResult {
    try {
      const comparison: ComparisonResult = {
        latency: this._compareMetric(
          baseline.results.averageLatency,
          current.results.averageLatency,
          'lower'
        ),
        throughput: this._compareMetric(
          baseline.results.throughput,
          current.results.throughput,
          'higher'
        ),
        compression: this._compareMetric(
          baseline.results.compressionRatio,
          current.results.compressionRatio,
          'lower'
        ),
        summary: {
          improved: [],
          degraded: [],
          unchanged: []
        }
      };

      // Categorize changes
      (Object.entries(comparison) as [string, MetricComparison][]).forEach(([metric, data]) => {
        if (metric === 'summary') return;
        
        const metricSummary: MetricSummary = {
          metric,
          change: data.percentChange
        };

        if (data.percentChange > 10) {
          comparison.summary.degraded.push(metricSummary);
        } else if (data.percentChange < -10) {
          comparison.summary.improved.push({
            ...metricSummary,
            change: Math.abs(data.percentChange)
          });
        } else {
          comparison.summary.unchanged.push(metricSummary);
        }
      });

      return comparison;
    } catch (error: unknown) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private static _compareMetric(
    baseline: number,
    current: number,
    preferredDirection: PreferredDirection
  ): MetricComparison {
    const percentChange = ((current - baseline) / baseline) * 100;
    const isImprovement = preferredDirection === 'lower' ? 
      percentChange < 0 : percentChange > 0;

    return {
      baseline,
      current,
      percentChange,
      isImprovement,
      significance: this._calculateSignificance(percentChange)
    };
  }

  private static _calculateSignificance(percentChange: number): MetricComparison['significance'] {
    const absChange = Math.abs(percentChange);
    if (absChange > 25) return 'high';
    if (absChange > 10) return 'medium';
    return 'low';
  }

  static generateReport(comparison: ComparisonResult): ComparisonReport {
    const report: ComparisonReport = {
      summary: `Found ${comparison.summary.improved.length} improvements and ${comparison.summary.degraded.length} degradations`,
      improvements: comparison.summary.improved.map(item => 
        `${item.metric}: improved by ${item.change.toFixed(1)}%`
      ),
      degradations: comparison.summary.degraded.map(item =>
        `${item.metric}: degraded by ${item.change.toFixed(1)}%`
      ),
      recommendations: []
    };

    // Generate recommendations
    if (comparison.latency.percentChange > 10) {
      report.recommendations.push('Consider optimizing message processing');
    }
    if (comparison.throughput.percentChange < -10) {
      report.recommendations.push('Review batch size configuration');
    }
    if (comparison.compression.percentChange > 10) {
      report.recommendations.push('Evaluate compression settings');
    }

    return report;
  }
} 