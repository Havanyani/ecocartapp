interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  let totalSS = 0;
  let residualSS = 0;

  for (let i = 0; i < n; i++) {
    const yPred = slope * x[i] + intercept;
    totalSS += Math.pow(y[i] - yMean, 2);
    residualSS += Math.pow(y[i] - yPred, 2);
  }

  const r2 = 1 - (residualSS / totalSS);

  return {
    slope,
    intercept,
    r2,
    predict: (x: number) => slope * x + intercept,
  };
}

export function exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
  const smoothed = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
  }

  return smoothed;
}

export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      // Not enough data points yet, use simple average
      const slice = data.slice(0, i + 1);
      result.push(slice.reduce((a, b) => a + b) / slice.length);
    } else {
      // Calculate moving average
      const slice = data.slice(i - window + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b) / window);
    }
  }

  return result;
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  return (value - mean) / stdDev;
}

export function calculatePercentile(data: number[], percentile: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper === lower) {
    return sorted[index];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateOutlierBounds(data: number[], multiplier: number = 1.5): { lower: number; upper: number } {
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;

  return {
    lower: q1 - multiplier * iqr,
    upper: q3 + multiplier * iqr,
  };
}

export function detectSeasonality(data: number[], period: number): boolean {
  if (data.length < period * 2) return false;

  const correlations: number[] = [];
  for (let i = 0; i < period; i++) {
    const series1 = data.slice(0, -period);
    const series2 = data.slice(i + 1, -period + i + 1);
    correlations.push(calculateCorrelation(series1, series2));
  }

  const maxCorrelation = Math.max(...correlations);
  return maxCorrelation > 0.7;
}

export function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b);
  const sumY = y.reduce((a, b) => a + b);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return numerator / denominator;
} 