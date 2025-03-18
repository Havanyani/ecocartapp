import { ExtendedProfileResult, Metrics } from '@/types/Performance';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import PDFLib from 'react-native-pdf-lib';
import { captureRef } from 'react-native-view-shot';
import { PerformanceAnalytics } from './PerformanceAnalytics';

interface PDFGeneratorOptions {
  title?: string;
  includeCharts?: boolean;
  includeInsights?: boolean;
  metrics?: Array<keyof Metrics>;
  timeRange: 'hour' | 'day' | 'week';
}

interface ChartImage {
  metric: keyof Metrics;
  uri: string;
}

export class PDFGenerator {
  private static readonly PAGE_WIDTH = 612; // Standard US Letter width in points
  private static readonly PAGE_HEIGHT = 792; // Standard US Letter height in points
  private static readonly MARGIN = 50;
  private static readonly CONTENT_WIDTH = PDFGenerator.PAGE_WIDTH - (PDFGenerator.MARGIN * 2);

  private static async captureChart(chartRef: React.RefObject<any>): Promise<string> {
    if (!chartRef.current) return '';
    return await captureRef(chartRef.current, {
      format: 'png',
      quality: 1,
      result: 'base64',
    });
  }

  static async generatePDF(
    data: ExtendedProfileResult[],
    chartRefs: { [key: string]: React.RefObject<any> },
    options: PDFGeneratorOptions
  ): Promise<string> {
    try {
      // Create PDF document
      const document = await PDFLib.PDFDocument.create();
      const page = await document.addPage([PDFGenerator.PAGE_WIDTH, PDFGenerator.PAGE_HEIGHT]);

      // Add header
      const title = options.title || 'Performance Report';
      const timestamp = format(new Date(), 'PPpp');
      
      await page
        .drawText(title, {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - PDFGenerator.MARGIN,
          fontSize: 24,
          color: '#000000',
        })
        .drawText(`Generated on ${timestamp}`, {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - PDFGenerator.MARGIN - 30,
          fontSize: 10,
          color: '#000000',
        })
        .drawText(`Time Range: ${options.timeRange}`, {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - PDFGenerator.MARGIN - 45,
          fontSize: 10,
          color: '#000000',
        });

      let currentY = PDFGenerator.MARGIN + 80;

      // Add metrics section
      await page.drawText('Performance Metrics', {
        x: PDFGenerator.MARGIN,
        y: PDFGenerator.PAGE_HEIGHT - currentY,
        fontSize: 18,
        color: '#000000',
      });
      currentY += 30;

      const metrics = options.metrics || (Object.keys(data[0].metrics) as Array<keyof Metrics>);
      const latestResult = data[data.length - 1];

      for (const metric of metrics) {
        const value = latestResult.metrics[metric];
        await page.drawText(`${metric}: ${value.toFixed(2)}`, {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - currentY,
          fontSize: 12,
          color: '#000000',
        });
        currentY += 20;
      }

      currentY += 20;

      // Add insights if requested
      if (options.includeInsights) {
        await page.drawText('Performance Insights', {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - currentY,
          fontSize: 18,
          color: '#000000',
        });
        currentY += 30;

        const insights = PerformanceAnalytics.generateInsights(data);
        for (const insight of insights) {
          await page.drawText(`${insight.type.toUpperCase()} (${insight.importance})`, {
            x: PDFGenerator.MARGIN,
            y: PDFGenerator.PAGE_HEIGHT - currentY,
            fontSize: 14,
            color: '#000000',
          });
          currentY += 20;

          await page.drawText(insight.description, {
            x: PDFGenerator.MARGIN,
            y: PDFGenerator.PAGE_HEIGHT - currentY,
            fontSize: 12,
            color: '#000000',
          });
          currentY += 20;

          if (insight.recommendation) {
            await page.drawText(`Recommendation: ${insight.recommendation}`, {
              x: PDFGenerator.MARGIN,
              y: PDFGenerator.PAGE_HEIGHT - currentY,
              fontSize: 12,
              color: '#666666',
            });
            currentY += 20;
          }

          currentY += 10;
        }
      }

      // Add charts if requested
      if (options.includeCharts) {
        const newPage = await document.addPage([PDFGenerator.PAGE_WIDTH, PDFGenerator.PAGE_HEIGHT]);
        currentY = PDFGenerator.MARGIN;

        await newPage.drawText('Performance Charts', {
          x: PDFGenerator.MARGIN,
          y: PDFGenerator.PAGE_HEIGHT - currentY,
          fontSize: 18,
          color: '#000000',
        });
        currentY += 30;

        for (const [metric, ref] of Object.entries(chartRefs)) {
          const base64Image = await this.captureChart(ref);
          if (base64Image) {
            await newPage.drawImage(base64Image, {
              x: PDFGenerator.MARGIN,
              y: PDFGenerator.PAGE_HEIGHT - currentY - 200,
              width: PDFGenerator.CONTENT_WIDTH,
              height: 200,
            });
            currentY += 220;

            if (currentY > PDFGenerator.PAGE_HEIGHT - PDFGenerator.MARGIN - 200) {
              const nextPage = await document.addPage([PDFGenerator.PAGE_WIDTH, PDFGenerator.PAGE_HEIGHT]);
              currentY = PDFGenerator.MARGIN;
            }
          }
        }
      }

      // Save the document
      const path = `${FileSystem.documentDirectory}performance_report_${Date.now()}.pdf`;
      await document.write(path);
      return path;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }
} 