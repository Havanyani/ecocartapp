import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine } from '@/components/ui/VictoryChartAdapter';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { View } from 'react-native';
import { PDFDocument, rgb } from 'react-native-pdf-lib';
import { captureRef } from 'react-native-view-shot';
import { Metrics, TestResult } from './TestResultExporter';

interface ChartData {
  x: string;
  y: number;
  category?: string;
}

interface ChartConfig {
  type: 'line' | 'bar';
  data: ChartData[];
  title: string;
  xLabel: string;
  yLabel: string;
}

export class PerformanceReportGenerator {
  private static async generateChart(config: ChartConfig): Promise<string> {
    const chartRef = React.createRef<View>();
    const chart = React.createElement(View, {
      ref: chartRef,
      style: { width: 600, height: 300, backgroundColor: 'white' },
    }, React.createElement(VictoryChart as any, {
      width: 600,
      height: 300,
      padding: { top: 40, bottom: 50, left: 60, right: 40 },
    }, [
      React.createElement(VictoryAxis as any, {
        key: 'x-axis',
        label: config.xLabel,
        style: {
          axisLabel: { padding: 30 },
          tickLabels: { fontSize: 10 },
        },
      }),
      React.createElement(VictoryAxis as any, {
        key: 'y-axis',
        dependentAxis: true,
        label: config.yLabel,
        style: {
          axisLabel: { padding: 40 },
          tickLabels: { fontSize: 10 },
        },
      }),
      config.type === 'line'
        ? React.createElement(VictoryLine as any, {
            key: 'line',
            data: config.data,
            style: {
              data: { stroke: '#007AFF' },
            },
          })
        : React.createElement(VictoryBar as any, {
            key: 'bar',
            data: config.data,
            style: {
              data: { fill: '#007AFF' },
            },
          }),
    ]));

    const uri = await captureRef(chartRef, {
      format: 'png',
      quality: 1,
    });

    return uri;
  }

  private static async generateTrendChart(results: TestResult[]): Promise<string> {
    const data: ChartData[] = results.map((result) => ({
      x: new Date(result.timestamp).toLocaleDateString(),
      y: result.metrics.memory,
    }));

    return this.generateChart({
      type: 'line',
      data,
      title: 'Memory Usage Trend',
      xLabel: 'Date',
      yLabel: 'Memory Usage (%)',
    });
  }

  private static async generateMetricsDistribution(results: TestResult[]): Promise<string> {
    const latest = results[0];
    const data: ChartData[] = Object.entries(latest.metrics).map(([key, value]) => ({
      x: key,
      y: value as number,
    }));

    return this.generateChart({
      type: 'bar',
      data,
      title: 'Current Metrics Distribution',
      xLabel: 'Metric',
      yLabel: 'Value',
    });
  }

  static async generatePDFReport(results: TestResult[]): Promise<string> {
    const pdfPath = `${FileSystem.documentDirectory}performance_report_${Date.now()}.pdf`;
    const page = PDFDocument.create();

    // Add title
    page.drawText('Performance Test Report', {
      x: 50,
      y: 800,
      color: rgb(0, 0, 0),
      fontSize: 24,
    });

    // Add summary
    const summary = {
      totalTests: results.length,
      passed: results.filter(r => this.getTestStatus(r) === 'Passed').length,
      warnings: results.filter(r => this.getTestStatus(r) === 'Warning').length,
      failed: results.filter(r => this.getTestStatus(r) === 'Failed').length,
    };

    page.drawText(`Summary:`, {
      x: 50,
      y: 750,
      color: rgb(0, 0, 0),
      fontSize: 16,
    });

    page.drawText(`Total Tests: ${summary.totalTests}`, {
      x: 70,
      y: 730,
      color: rgb(0, 0, 0),
      fontSize: 12,
    });

    // Add trend chart
    const trendChartUri = await this.generateTrendChart(results);
    page.drawImage(trendChartUri, {
      x: 50,
      y: 400,
      width: 500,
      height: 300,
    });

    // Add distribution chart
    const distributionChartUri = await this.generateMetricsDistribution(results);
    page.drawImage(distributionChartUri, {
      x: 50,
      y: 50,
      width: 500,
      height: 300,
    });

    await page.write(pdfPath);
    return pdfPath;
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
} 