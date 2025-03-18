import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsPersistenceService } from '../../services/MetricsPersistenceService';
import { performanceSettingsStore } from '../../stores/PerformanceSettingsStore';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../stores/PerformanceSettingsStore', () => ({
  performanceSettingsStore: {
    persistMetrics: true,
    retentionDays: 7
  }
}));

interface MetricItem {
  value: number;
  timestamp: number;
}

interface TestMetrics {
  [key: string]: MetricItem;
}

describe('MetricsPersistenceService', () => {
  const mockMetrics: TestMetrics = {
    latency: { value: 100, timestamp: Date.now() },
    throughput: { value: 50, timestamp: Date.now() },
    errorRate: { value: 0.01, timestamp: Date.now() }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('saves metrics correctly', async () => {
    await MetricsPersistenceService.saveMetrics(mockMetrics);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'performance_metrics',
      expect.stringContaining('"latency":100')
    );
  });

  it('respects persistence setting', async () => {
    (performanceSettingsStore as any).persistMetrics = false;
    await MetricsPersistenceService.saveMetrics(mockMetrics);
    
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('loads and filters metrics by time range', async () => {
    const storedMetrics = {
      '1000': { value: 1 },
      '2000': { value: 2 },
      '3000': { value: 3 }
    };
    
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedMetrics));
    
    const filtered = await MetricsPersistenceService.loadMetrics({
      start: 2000,
      end: 3000
    });
    
    expect(Object.keys(filtered)).toHaveLength(2);
    expect(filtered['2000']).toBeDefined();
    expect(filtered['3000']).toBeDefined();
  });

  it('cleans up old metrics', async () => {
    const now = Date.now();
    const oldMetrics = {
      [now - 40 * 24 * 60 * 60 * 1000]: mockMetrics,
      [now]: mockMetrics
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldMetrics));

    await MetricsPersistenceService.clearOldMetrics();

    expect((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]).not.toContain(String(now - 40 * 24 * 60 * 60 * 1000));
  });

  it('handles empty metrics gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await MetricsPersistenceService.loadMetrics();
    expect(result).toEqual({});
  });

  it('clears metrics from storage', async () => {
    await MetricsPersistenceService.clearOldMetrics();
    expect((AsyncStorage.removeItem as jest.Mock).mock.calls[0][0]).toBe('performance_metrics');
  });
}); 