import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsPersistenceService } from '../../../../../services/MetricsPersistenceService';
import { performanceSettingsStore } from '../../../../../stores/PerformanceSettingsStore';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../stores/PerformanceSettingsStore', () => ({
  performanceSettingsStore: {
    persistMetrics: true,
    retentionDays: 7
  }
}));

describe('MetricsPersistenceService', () => {
  const mockMetrics = {
    latency: 100,
    throughput: 50,
    errorRate: 0.01
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('saves metrics correctly', async () => {
    await MetricsPersistenceService.saveMetrics(mockMetrics);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'performance_metrics',
      expect.stringContaining('"latency":100')
    );
  });

  it('respects persistence setting', async () => {
    performanceSettingsStore.persistMetrics = false;
    await MetricsPersistenceService.saveMetrics(mockMetrics);
    
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('loads and filters metrics by time range', async () => {
    const storedMetrics = {
      '1000': { value: 1 },
      '2000': { value: 2 },
      '3000': { value: 3 }
    };
    
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMetrics));
    
    const filtered = await MetricsPersistenceService.loadMetrics({
      start: 2000,
      end: 3000
    });
    
    expect(Object.keys(filtered)).toHaveLength(2);
    expect(filtered['2000']).toBeDefined();
    expect(filtered['3000']).toBeDefined();
  });

  it('calculates trends correctly', () => {
    const metrics = {
      '1000': { value: 100 },
      '2000': { value: 150 }
    };
    
    const summary = MetricsPersistenceService.getMetricsSummary(metrics);
    
    expect(summary.trends.value.change).toBe(50);
    expect(summary.trends.value.direction).toBe('increasing');
  });
}); 