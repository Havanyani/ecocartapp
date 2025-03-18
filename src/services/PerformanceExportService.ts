import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface ExportResult {
  content: string;
  mimeType: string;
}

export class PerformanceExportService {
  static async exportMetrics(format = 'json'): Promise<ExportResult> {
    const metrics = PerformanceMonitor.getMetrics();
    
    if (!Object.keys(metrics).length) {
      return {
        content: 'No data',
        mimeType: format === 'csv' ? 'text/csv' : 'application/json'
      };
    }

    try {
      if (format === 'csv') {
        return {
          content: this.convertToCSV(metrics),
          mimeType: 'text/csv'
        };
      }

      return {
        content: JSON.stringify(metrics, null, 2),
        mimeType: 'application/json'
      };
    } catch (error) {
      console.error('Error exporting metrics:', error);
      throw error;
    }
  }

  private static convertToCSV(data: any): string {
    const headers = this.flattenKeys(data);
    const values = headers.map(header => this.getNestedValue(data, header));

    return [
      headers.join(','),
      values.map(v => this.formatValue(v)).join(',')
    ].join('\n');
  }

  private static flattenKeys(obj: any, prefix = ''): string[] {
    return Object.keys(obj).reduce((acc: string[], key: string) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return [...acc, ...this.flattenKeys(value, newKey)];
      }
      return [...acc, newKey];
    }, []);
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  private static formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = value.replace(/"/g, '""');
      return value.includes(',') ? `"${escaped}"` : escaped;
    }
    return String(value);
  }
} 