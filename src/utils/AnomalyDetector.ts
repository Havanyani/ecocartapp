import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import { calculateOutlierBounds, calculateZScore, movingAverage } from './math';

interface AnomalyConfig {
  sensitivityThreshold: number;  // Z-score threshold for anomaly detection
  windowSize: number;            // Window size for moving averages
  minDataPoints: number;         // Minimum data points required for detection
  seasonalityPeriod?: number;    // Optional period for seasonal adjustments
}

interface AnomalyResult {
  metric: keyof Metrics;
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  type: 'spike' | 'trend' | 'seasonal' | 'pattern';
  confidence: number;
  context?: {
    historicalMean: number;
    historicalStdDev: number;
    seasonalityFactor?: number;
    trendFactor?: number;
  };
}

export class AnomalyDetector {
  private static readonly DEFAULT_CONFIG: AnomalyConfig = {
    sensitivityThreshold: 2.5,
    windowSize: 10,
    minDataPoints: 30,
  };

  private static calculateSeasonality(
    data: number[],
    period: number
  ): { seasonal: number[]; factors: number[] } {
    const factors: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);
    
    // Calculate average values for each position in the cycle
    data.forEach((value, index) => {
      const position = index % period;
      factors[position] += value;
      counts[position]++;
    });

    // Calculate seasonal factors
    const seasonalFactors = factors.map((sum, i) => sum / counts[i]);
    const avgFactor = seasonalFactors.reduce((a, b) => a + b) / period;
    
    // Normalize factors
    const normalizedFactors = seasonalFactors.map(f => f / avgFactor);
    
    // Apply seasonal adjustment
    const seasonal = data.map((value, index) => value / normalizedFactors[index % period]);

    return { seasonal, factors: normalizedFactors };
  }

  private static detectTrend(
    data: number[],
    windowSize: number
  ): { values: number[]; trend: 'increasing' | 'decreasing' | 'stable' } {
    const ma = movingAverage(data, windowSize);
    const slope = (ma[ma.length - 1] - ma[0]) / ma.length;
    
    const trend = Math.abs(slope) < 0.01 ? 'stable' 
      : slope > 0 ? 'increasing'
      : 'decreasing';

    return { values: ma, trend };
  }

  private static calculateSeverity(zScore: number): 'low' | 'medium' | 'high' {
    const absScore = Math.abs(zScore);
    if (absScore > 4) return 'high';
    if (absScore > 3) return 'medium';
    return 'low';
  }

  private static detectPatterns(data: number[]): {
    hasPattern: boolean;
    patternLength?: number;
    confidence: number;
  } {
    const autocorr = this.calculateAutocorrelation(data);
    const peaks = this.findPeaks(autocorr);
    
    if (peaks.length < 2) return { hasPattern: false, confidence: 0 };
    
    const patternLength = peaks[1] - peaks[0];
    const confidence = autocorr[peaks[1]];

    return {
      hasPattern: confidence > 0.7,
      patternLength,
      confidence,
    };
  }

  private static calculateAutocorrelation(data: number[]): number[] {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    
    const autocorr: number[] = [];
    for (let lag = 0; lag < Math.floor(data.length / 2); lag++) {
      let sum = 0;
      for (let i = 0; i < data.length - lag; i++) {
        sum += (data[i] - mean) * (data[i + lag] - mean);
      }
      autocorr[lag] = sum / (data.length * variance);
    }
    
    return autocorr;
  }

  private static findPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  static detectAnomalies(
    data: ExtendedProfileResult[],
    config: Partial<AnomalyConfig> = {}
  ): AnomalyResult[] {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const anomalies: AnomalyResult[] = [];

    if (data.length < finalConfig.minDataPoints) {
      return anomalies;
    }

    const metrics = Object.keys(data[0].metrics) as Array<keyof Metrics>;

    for (const metric of metrics) {
      const values = data.map(d => d.metrics[metric]);
      const timestamps = data.map(d => d.timestamp);

      // Detect and adjust for seasonality
      const seasonality = finalConfig.seasonalityPeriod
        ? this.calculateSeasonality(values, finalConfig.seasonalityPeriod)
        : { seasonal: values, factors: [] };

      // Detect trend
      const trend = this.detectTrend(seasonality.seasonal, finalConfig.windowSize);

      // Calculate moving statistics
      const ma = movingAverage(seasonality.seasonal, finalConfig.windowSize);
      const { lower, upper } = calculateOutlierBounds(ma);

      // Detect patterns
      const patterns = this.detectPatterns(seasonality.seasonal);

      // Analyze each point
      for (let i = finalConfig.windowSize; i < values.length; i++) {
        const value = values[i];
        const expectedValue = ma[i];
        const zScore = calculateZScore(value, expectedValue, upper - lower);

        if (Math.abs(zScore) > finalConfig.sensitivityThreshold) {
          let anomalyType: AnomalyResult['type'] = 'spike';
          let confidence = Math.min(Math.abs(zScore) / 10, 0.99);

          // Determine anomaly type
          if (patterns.hasPattern && i % patterns.patternLength! === 0) {
            anomalyType = 'pattern';
            confidence = patterns.confidence;
          } else if (seasonality.factors.length > 0 && 
                    Math.abs(seasonality.factors[i % seasonality.factors.length] - 1) > 0.2) {
            anomalyType = 'seasonal';
            confidence = Math.abs(seasonality.factors[i % seasonality.factors.length] - 1);
          } else if (trend.trend !== 'stable') {
            anomalyType = 'trend';
            confidence = Math.abs(trend.values[i] - trend.values[i - 1]) / trend.values[i - 1];
          }

          anomalies.push({
            metric,
            timestamp: timestamps[i],
            value,
            expectedValue,
            deviation: value - expectedValue,
            severity: this.calculateSeverity(zScore),
            type: anomalyType,
            confidence,
            context: {
              historicalMean: ma[i],
              historicalStdDev: (upper - lower) / 2,
              seasonalityFactor: seasonality.factors[i % seasonality.factors.length],
              trendFactor: (trend.values[i] - trend.values[i - 1]) / trend.values[i - 1],
            },
          });
        }
      }
    }

    return anomalies;
  }
} 