import { PerformanceExportService } from '../../services/PerformanceExportService';

interface TestMetrics {
  averageLatency: number;
  averageCompressionRatio: number;
  totalMetrics: {
    messages: number;
    batches: number;
  };
}

describe('PerformanceExportService', () => {
  const mockMetrics: TestMetrics = {
    averageLatency: 100,
    averageCompressionRatio: 0.6,
    totalMetrics: {
      messages: 1000,
      batches: 50
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports metrics as JSON', async () => {
    const result = await PerformanceExportService.exportMetrics(JSON.stringify(mockMetrics));
    expect(result.mimeType).toBe('application/json');
    expect(JSON.parse(result.content)).toEqual(mockMetrics);
  });

  it('exports metrics as CSV', async () => {
    const result = await PerformanceExportService.exportMetrics(JSON.stringify(mockMetrics));
    expect(result.mimeType).toBe('text/csv');
    
    const lines = result.content.split('\n');
    expect(lines[0]).toBe('averageLatency,averageCompressionRatio,totalMetrics.messages,totalMetrics.batches');
    expect(lines[1]).toBe('100,0.6,1000,50');
  });

  it('handles complex objects in CSV conversion', async () => {
    const complexMetrics = {
      summary: {
        performance: {
          score: 95,
          grade: 'A'
        }
      },
      details: [
        { name: 'metric1', value: 10 },
        { name: 'metric2', value: 20 }
      ]
    };

    const result = await PerformanceExportService.exportMetrics(JSON.stringify(complexMetrics));
    expect(result.mimeType).toBe('text/csv');
    
    const lines = result.content.split('\n');
    expect(lines[0]).toContain('summary.performance.score');
    expect(lines[0]).toContain('summary.performance.grade');
  });

  it('handles errors gracefully', async () => {
    await expect(
      PerformanceExportService.exportMetrics(undefined)
    ).resolves.toEqual({
      content: '',
      mimeType: 'text/csv'
    });
  });
}); 