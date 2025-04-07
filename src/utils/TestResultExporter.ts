import { Share } from 'react-native';
import FileSystem from './cross-platform/fileSystem';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeTraces?: boolean;
  includeHistory?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  filters?: {
    status?: ('Passed' | 'Warning' | 'Failed')[];
    metrics?: {
      [key: string]: {
        min?: number;
        max?: number;
      };
    };
    components?: string[];
    search?: string;
  };
}

export interface Trace {
  component: string;
  renderCount: number;
  totalTime: number;
  avgTime: number;
}

export interface Metrics {
  memory: number;
  cpu: number;
  fps: number;
  renderTime: number;
  networkCalls: number;
  diskOperations: number;
}

export interface TestResult {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  metrics: Metrics;
  traces: Trace[];
  thresholds: Metrics;
}

export class TestResultExporter {
  private static formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  private static formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  private static async generateCSV(results: TestResult[], includeTraces: boolean): Promise<string> {
    const headers = [
      'Test Name',
      'Timestamp',
      'Duration (ms)',
      'Memory Usage (%)',
      'CPU Usage (%)',
      'FPS',
      'Render Time (ms)',
      'Network Calls',
      'Disk Operations',
      'Status',
    ];

    if (includeTraces) {
      headers.push('Component', 'Render Count', 'Total Time (ms)', 'Average Time (ms)');
    }

    const rows = results.map(result => {
      const baseRow = [
        result.name,
        `${this.formatDate(result.timestamp)} ${this.formatTime(result.timestamp)}`,
        result.duration.toFixed(2),
        result.metrics.memory.toFixed(2),
        result.metrics.cpu.toFixed(2),
        result.metrics.fps.toFixed(2),
        result.metrics.renderTime.toFixed(2),
        result.metrics.networkCalls,
        result.metrics.diskOperations,
        this.getTestStatus(result),
      ];

      if (includeTraces) {
        result.traces.forEach((trace: Trace) => {
          baseRow.push(
            trace.component,
            trace.renderCount.toString(),
            trace.totalTime.toFixed(2),
            trace.avgTime.toFixed(2)
          );
        });
      }

      return baseRow;
    });

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  private static getTestStatus(result: TestResult): string {
    const metrics = result.metrics;
    const thresholds = result.thresholds;
    
    if (Object.entries(metrics).some(([key, value]) => 
      value > (thresholds[key as keyof Metrics] || 0) * 1.2
    )) {
      return 'Failed';
    }
    
    if (Object.entries(metrics).some(([key, value]) => 
      value > (thresholds[key as keyof Metrics] || 0)
    )) {
      return 'Warning';
    }
    
    return 'Passed';
  }

  private static async saveFile(content: string, fileName: string): Promise<string> {
    const path = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(path, content);
    return path;
  }

  static async exportResults(results: TestResult[], options: ExportOptions): Promise<void> {
    try {
      let content: string;
      let fileName: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      // Filter results by date range if specified
      let filteredResults = results;
      if (options.dateRange) {
        filteredResults = results.filter(r => 
          r.timestamp >= options.dateRange!.start && 
          r.timestamp <= options.dateRange!.end
        );
      }

      switch (options.format) {
        case 'csv':
          content = await this.generateCSV(filteredResults, options.includeTraces || false);
          fileName = `performance_results_${timestamp}.csv`;
          break;

        case 'json':
          const jsonContent = {
            exportDate: new Date().toISOString(),
            totalTests: filteredResults.length,
            summary: {
              passed: filteredResults.filter(r => this.getTestStatus(r) === 'Passed').length,
              warnings: filteredResults.filter(r => this.getTestStatus(r) === 'Warning').length,
              failed: filteredResults.filter(r => this.getTestStatus(r) === 'Failed').length,
            },
            results: filteredResults.map(r => ({
              ...r,
              status: this.getTestStatus(r),
              formattedTimestamp: `${this.formatDate(r.timestamp)} ${this.formatTime(r.timestamp)}`,
            })),
          };
          content = JSON.stringify(jsonContent, null, 2);
          fileName = `performance_results_${timestamp}.json`;
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      const filePath = await this.saveFile(content, fileName);

      await Share.share({
        url: filePath,
        title: 'Performance Test Results',
        message: `Performance test results exported on ${new Date().toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error exporting results:', error);
      throw error;
    }
  }
} 