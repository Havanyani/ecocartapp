import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  timeRange: 'hour' | 'day' | 'week';
  metrics?: Array<keyof Metrics>;
  includeInsights?: boolean;
  includeCharts?: boolean;
  chartRefs?: { [key: string]: RefObject<any> };
}

export class PerformanceExporter {
  private static async exportAsJson(data: ExtendedProfileResult[]): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  private static async exportAsCsv(data: ExtendedProfileResult[]): Promise<string> {
    if (data.length === 0) return '';

    // Get all metric keys
    const metrics = Object.keys(data[0].metrics) as Array<keyof Metrics>;
    
    // Create header
    const header = ['timestamp', ...metrics].join(',');
    
    // Create rows
    const rows = data.map(result => {
      const values = [result.timestamp, ...metrics.map(m => result.metrics[m])];
      return values.join(',');
    });

    return [header, ...rows].join('\n');
  }

  private static async saveFile(content: string, filename: string): Promise<string> {
    const path = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, content);
    return path;
  }

  static async export(
    data: ExtendedProfileResult[],
    options: ExportOptions
  ): Promise<void> {
    try {
      let content: string;
      let filename: string;

      // Filter data based on time range
      const now = Date.now();
      const timeRangeMs = {
        hour: 3600000,
        day: 86400000,
        week: 604800000,
      }[options.timeRange];

      const filteredData = data.filter(
        result => result.timestamp >= now - timeRangeMs
      );

      // Filter metrics if specified
      const processedData = options.metrics
        ? filteredData.map(result => ({
            ...result,
            metrics: Object.fromEntries(
              Object.entries(result.metrics)
                .filter(([key]) => options.metrics!.includes(key as keyof Metrics))
            ) as Metrics,
          }))
        : filteredData;

      switch (options.format) {
        case 'json':
          content = await this.exportAsJson(processedData);
          filename = `performance_${Date.now()}.json`;
          break;
        case 'csv':
          content = await this.exportAsCsv(processedData);
          filename = `performance_${Date.now()}.csv`;
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      const filePath = await this.saveFile(content, filename);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: options.format === 'json'
            ? 'application/json'
            : 'text/csv',
          dialogTitle: 'Export Performance Data',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
} 