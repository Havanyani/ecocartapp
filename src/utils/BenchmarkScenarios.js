import { PerformanceMonitor } from './PerformanceMonitoring';
import { PerformanceMonitor } from './PerformanceMonitoring';

export class BenchmarkScenarios {
  static scenarios = {
    quickTest: {
      messageCount: 10,
      messageSize: 512,
      batchSize: 5,
      compression: true
    },
    stressTest: {
      messageCount: 1000,
      messageSize: 2048,
      batchSize: 50,
      compression: true
    },
    latencyTest: {
      messageCount: 100,
      messageSize: 128,
      batchSize: 1,
      compression: false
    },
    compressionTest: {
      messageCount: 100,
      messageSize: 8192,
      batchSize: 10,
      compression: true
    }
  };

  static async runScenario(scenarioName) {
    try {
      const config = this.scenarios[scenarioName];
      if (!config) {
        throw new Error(`Unknown scenario: ${scenarioName}`);
      }

      const startTime = performance.now();
      const results = await PerformanceBenchmark.runBenchmark(config);
      const duration = performance.now() - startTime;

      PerformanceMonitor.addBreadcrumb('benchmark', 
        `Scenario ${scenarioName} completed in ${duration}ms`);

      return {
        scenario: scenarioName,
        config,
        results,
        duration
      };
    } catch (error) {
      PerformanceMonitor.captureError(error);
      throw error;
    }
  }

  static async runAllScenarios() {
    const results = {};
    for (const scenario of Object.keys(this.scenarios)) {
      results[scenario] = await this.runScenario(scenario);
    }
    return results;
  }
} 