/// <reference types="jest" />
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@testing-library/jest-native/extend-expect';
import type { MockedFunction } from 'jest-mock';
import type { Metrics } from '../../services/MetricsPersistenceService';
import { MetricsPersistenceService } from '../../services/MetricsPersistenceService';

// Create properly typed mocks
const mockAsyncStorage = {
  getItem: jest.fn().mockResolvedValue('') as MockedFunction<typeof AsyncStorage.getItem>,
  setItem: jest.fn().mockResolvedValue(undefined) as MockedFunction<typeof AsyncStorage.setItem>,
  removeItem: jest.fn().mockResolvedValue(undefined) as MockedFunction<typeof AsyncStorage.removeItem>,
  clear: jest.fn().mockResolvedValue(undefined) as MockedFunction<typeof AsyncStorage.clear>
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const mockMetrics: Metrics = {
  errors: [{
    message: 'Test error',
    timestamp: Date.now(),
    errorName: 'TestError'
  }],
  performance: {
    latency: 100,
    throughput: 1000,
    errorRate: 0.01
  }
};

describe('MetricsPersistenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves metrics to storage', async () => {
    await MetricsPersistenceService.saveMetrics(mockMetrics);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'metrics',
      JSON.stringify(mockMetrics)
    );
  });

  it('loads metrics from storage', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockMetrics));

    const result = await MetricsPersistenceService.loadMetrics();
    expect(result).toEqual(mockMetrics);
  });

  it('handles missing stored metrics', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const result = await MetricsPersistenceService.loadMetrics();
    expect(result).toEqual({
      errors: [],
      performance: {
        latency: 0,
        throughput: 0,
        errorRate: 0
      }
    });
  });

  it('clears metrics from storage', async () => {
    await MetricsPersistenceService.clearMetrics();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('metrics');
  });

  it('handles storage errors gracefully', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    await expect(
      MetricsPersistenceService.saveMetrics(mockMetrics)
    ).rejects.toThrow('Failed to save metrics');
  });

  it('validates metrics before saving', async () => {
    const invalidMetrics: Metrics = {
      errors: 'not an array' as any,
      performance: {
        latency: 0,
        throughput: 0,
        errorRate: 0
      }
    };

    await expect(
      MetricsPersistenceService.saveMetrics(invalidMetrics)
    ).rejects.toThrow('Invalid metrics format');
  });
}); 