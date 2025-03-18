import { InteractionManager } from 'react-native';
import { PerformanceMonitor } from './PerformanceMonitoring';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMetrics {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private interactionHandles: Set<number> = new Set();

  startMetric(name: string, metadata?: Record<string, unknown>) {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endMetric(name: string) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  async trackInteraction<T>(name: string, interaction: () => Promise<T>): Promise<T> {
    const handle = InteractionManager.createInteractionHandle();
    this.interactionHandles.add(handle);
    this.startMetric(name);

    try {
      const result = await interaction();
      return result;
    } finally {
      this.endMetric(name);
      InteractionManager.clearInteractionHandle(handle);
      this.interactionHandles.delete(handle);
    }
  }

  getMetricsSummary() {
    const summary: Record<string, number> = {};
    this.metrics.forEach((metric) => {
      if (metric.duration) {
        summary[metric.name] = metric.duration;
      }
    });
    return summary;
  }

  clearMetrics() {
    this.metrics.clear();
  }

  static trackLatency(startTime: number): void {
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    PerformanceMonitor.captureMetric({
      latency,
      timestamp: endTime
    });
  }

  static trackThroughput(messageCount: number): void {
    PerformanceMonitor.captureMetric({
      throughput: messageCount,
      timestamp: Date.now()
    });
  }

  static trackCompression(originalSize: number, compressedSize: number): void {
    const ratio = compressedSize / originalSize;
    PerformanceMonitor.captureMetric({
      compressionRatio: ratio,
      timestamp: Date.now()
    });
  }
}

export const performanceMetrics = new PerformanceMetrics(); 