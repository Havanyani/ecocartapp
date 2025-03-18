import { WebSocketService } from '@/services/WebSocketService';
import { PerformanceMonitor } from './PerformanceMonitoring';
import { PerformanceMonitor } from './PerformanceMonitoring';

export class PerformanceBenchmark {
  static async runBenchmark(options = {}) {
    const {
      messageCount = 100,
      messageSize = 1024,
      batchSize = 10,
      compression = true
    } = options;

    const results = {
      totalTime: 0,
      averageLatency: 0,
      throughput: 0,
      compressionRatio: 0,
      messagesSent: 0,
      messagesFailed: 0
    };

    try {
      const startTime = performance.now();
      const messages = this.generateTestMessages(messageCount, messageSize);
      
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await this.sendBatch(batch, compression);
      }

      results.totalTime = performance.now() - startTime;
      const metrics = WebSocketPerformance.getMetricsSummary();
      
      results.averageLatency = metrics.averageLatency;
      results.throughput = (messageCount / results.totalTime) * 1000;
      results.compressionRatio = metrics.averageCompressionRatio;
      results.messagesSent = messageCount;
      results.messagesFailed = metrics.totalMetrics.failed;

      return results;
    } catch (error) {
      PerformanceMonitor.captureError(error);
      throw error;
    }
  }

  private static generateTestMessages(count, size) {
    return Array.from({ length: count }, (_, i) => ({
      type: 'BENCHMARK',
      payload: {
        id: `test-${i}`,
        data: 'A'.repeat(size)
      }
    }));
  }

  private static async sendBatch(messages, useCompression) {
    try {
      for (const message of messages) {
        await WebSocketService.sendMessage(message.type, message.payload);
      }
    } catch (error) {
      PerformanceMonitor.captureError(error);
      throw error;
    }
  }

  static generateReport(results) {
    return {
      summary: {
        totalTime: `${results.totalTime.toFixed(2)}ms`,
        averageLatency: `${results.averageLatency.toFixed(2)}ms`,
        throughput: `${results.throughput.toFixed(2)} msgs/sec`,
        compressionRatio: `${(results.compressionRatio * 100).toFixed(1)}%`,
        successRate: `${((results.messagesSent - results.messagesFailed) / results.messagesSent * 100).toFixed(1)}%`
      },
      recommendations: this.generateRecommendations(results)
    };
  }

  private static generateRecommendations(results) {
    const recommendations = [];

    if (results.averageLatency > 500) {
      recommendations.push('Consider reducing batch size to improve latency');
    }
    if (results.compressionRatio > 0.8) {
      recommendations.push('Compression efficiency is low, consider adjusting compression settings');
    }
    if (results.throughput < 50) {
      recommendations.push('Low throughput detected, consider increasing batch size');
    }

    return recommendations;
  }

  static async measureScreenLoad(screenName) {
    const transaction = PerformanceMonitor.startTrace(`screen_load_${screenName}`);
    
    return {
      start: () => {
        transaction.start();
      },
      end: () => {
        transaction.finish();
      }
    };
  }

  static async measureOperation(name, operation) {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      PerformanceMonitor.addBreadcrumb('performance', 
        `Operation ${name} completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      PerformanceMonitor.captureError(error, {
        operation: name,
        duration: performance.now() - startTime
      });
      throw error;
    }
  }

  static getMetrics() {
    return {
      memory: performance.memory,
      timeOrigin: performance.timeOrigin,
      navigation: performance.getEntriesByType('navigation'),
      resources: performance.getEntriesByType('resource')
    };
  }
} 