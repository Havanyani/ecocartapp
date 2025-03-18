import { SafeStorage } from '@/utils/storage';
import { makeAutoObservable } from 'mobx';
import { Platform } from 'react-native';

export interface PerformanceThresholds {
  latency: number;
  compression: number;
  batchSize: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  networkBandwidth: number;
}

export interface PerformanceSettings {
  thresholds: PerformanceThresholds;
  alertsEnabled: boolean;
  persistMetrics: boolean;
  retentionDays: number;
  autoOptimize: boolean;
  debugMode: boolean;
  samplingRate: number;
  notificationChannels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

class PerformanceSettingsStore {
  thresholds: PerformanceThresholds = {
    latency: 1000,
    compression: 0.8,
    batchSize: 100,
    errorRate: 0.05,
    memoryUsage: 80,
    cpuUsage: 70,
    networkBandwidth: 1000
  };

  alertsEnabled = true;
  persistMetrics = true;
  retentionDays = 7;
  autoOptimize = false;
  debugMode = false;
  samplingRate = 1000;
  notificationChannels = {
    email: false,
    push: true,
    inApp: true
  };

  constructor() {
    makeAutoObservable(this);
    if (Platform.OS !== 'web' || (typeof window !== 'undefined' && window.localStorage)) {
      void this.loadSettings();
    }
  }

  async loadSettings(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }

      const settings = await SafeStorage.getItem('performanceSettings');
      if (settings) {
        const parsed = JSON.parse(settings) as PerformanceSettings;
        this.thresholds = parsed.thresholds;
        this.alertsEnabled = parsed.alertsEnabled;
        this.persistMetrics = parsed.persistMetrics;
        this.retentionDays = parsed.retentionDays;
        this.autoOptimize = parsed.autoOptimize;
        this.debugMode = parsed.debugMode;
        this.samplingRate = parsed.samplingRate;
        this.notificationChannels = parsed.notificationChannels;
      }
    } catch (error) {
      console.error('Failed to load performance settings:', error);
    }
  }

  async saveSettings(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }

      const settings: PerformanceSettings = {
        thresholds: this.thresholds,
        alertsEnabled: this.alertsEnabled,
        persistMetrics: this.persistMetrics,
        retentionDays: this.retentionDays,
        autoOptimize: this.autoOptimize,
        debugMode: this.debugMode,
        samplingRate: this.samplingRate,
        notificationChannels: this.notificationChannels
      };
      await SafeStorage.setItem('performanceSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save performance settings:', error);
    }
  }

  setThreshold(key: keyof PerformanceThresholds, value: number): void {
    this.thresholds[key] = value;
    void this.saveSettings();
  }

  setAlertsEnabled(enabled: boolean): void {
    this.alertsEnabled = enabled;
    void this.saveSettings();
  }

  setPersistMetrics(enabled: boolean): void {
    this.persistMetrics = enabled;
    void this.saveSettings();
  }

  setRetentionDays(days: number): void {
    this.retentionDays = days;
    void this.saveSettings();
  }

  setAutoOptimize(enabled: boolean): void {
    this.autoOptimize = enabled;
    void this.saveSettings();
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    void this.saveSettings();
  }

  setSamplingRate(rate: number): void {
    this.samplingRate = rate;
    void this.saveSettings();
  }

  setNotificationChannel(channel: keyof typeof this.notificationChannels, enabled: boolean): void {
    this.notificationChannels[channel] = enabled;
    void this.saveSettings();
  }
}

export const performanceSettingsStore = new PerformanceSettingsStore(); 