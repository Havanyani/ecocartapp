import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceSettingsStore, type PerformanceSettings } from '../../stores/PerformanceSettingsStore';

jest.mock('@react-native-async-storage/async-storage');

describe('PerformanceSettingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('loads default settings when no stored settings exist', async () => {
    await performanceSettingsStore.loadSettings();
    
    expect(performanceSettingsStore.thresholds.latency).toBe(1000);
    expect(performanceSettingsStore.alertsEnabled).toBe(true);
    expect(performanceSettingsStore.persistMetrics).toBe(true);
    expect(performanceSettingsStore.retentionDays).toBe(7);
  });

  it('loads stored settings correctly', async () => {
    const storedSettings: PerformanceSettings = {
      thresholds: {
        latency: 500,
        compression: 0.5,
        batchSize: 50,
        errorRate: 0.1,
        memoryUsage: 80,
        cpuUsage: 70,
        networkBandwidth: 1000
      },
      alertsEnabled: false,
      persistMetrics: false,
      retentionDays: 14,
      autoOptimize: false,
      debugMode: false,
      samplingRate: 1000,
      notificationChannels: {
        email: false,
        push: true,
        inApp: true
      }
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedSettings));
    await performanceSettingsStore.loadSettings();
    
    expect(performanceSettingsStore.thresholds).toEqual(storedSettings.thresholds);
    expect(performanceSettingsStore.alertsEnabled).toBe(storedSettings.alertsEnabled);
    expect(performanceSettingsStore.persistMetrics).toBe(storedSettings.persistMetrics);
    expect(performanceSettingsStore.retentionDays).toBe(storedSettings.retentionDays);
  });

  it('saves settings correctly', async () => {
    performanceSettingsStore.setThreshold('latency', 500);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'performanceSettings',
      expect.stringContaining('"latency":500')
    );
  });

  it('handles setting changes correctly', () => {
    performanceSettingsStore.setAlertsEnabled(false);
    expect(performanceSettingsStore.alertsEnabled).toBe(false);

    performanceSettingsStore.setPersistMetrics(false);
    expect(performanceSettingsStore.persistMetrics).toBe(false);

    performanceSettingsStore.setRetentionDays(30);
    expect(performanceSettingsStore.retentionDays).toBe(30);
  });
}); 