import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import PerformanceSettingsScreen from '../../../../app/settings/profile/performance-settings';
import { performanceSettingsStore } from '../../../stores/PerformanceSettingsStore';

// Mock the stores
jest.mock('../../../stores/PerformanceSettingsStore', () => ({
  performanceSettingsStore: {
    thresholds: {
      latency: 1000,
      compression: 0.8,
      batchSize: 100,
      errorRate: 0.05,
      memoryUsage: 80,
      cpuUsage: 70,
      networkBandwidth: 1000,
    },
    alertsEnabled: true,
    persistMetrics: true,
    retentionDays: 7,
    autoOptimize: false,
    debugMode: false,
    samplingRate: 1000,
    notificationChannels: {
      email: false,
      push: true,
      inApp: true,
    },
    setThreshold: jest.fn(),
    setAlertsEnabled: jest.fn(),
    setPersistMetrics: jest.fn(),
    setRetentionDays: jest.fn(),
    setAutoOptimize: jest.fn(),
    setDebugMode: jest.fn(),
    setSamplingRate: jest.fn(),
    setNotificationChannel: jest.fn(),
  },
}));

// Mock the theme context
jest.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#1976D2',
        text: '#000000',
        textSecondary: '#666666',
        border: '#E0E0E0',
        error: '#D32F2F',
        warning: '#FFA000',
        success: '#388E3C',
      },
    },
  }),
}));

describe('PerformanceSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all threshold settings', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);

    expect(getByText('Latency')).toBeTruthy();
    expect(getByText('Compression Ratio')).toBeTruthy();
    expect(getByText('Batch Size')).toBeTruthy();
    expect(getByText('Error Rate')).toBeTruthy();
    expect(getByText('Memory Usage')).toBeTruthy();
    expect(getByText('CPU Usage')).toBeTruthy();
    expect(getByText('Network Bandwidth')).toBeTruthy();
  });

  it('renders all general settings', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);

    expect(getByText('Enable Alerts')).toBeTruthy();
    expect(getByText('Persist Metrics')).toBeTruthy();
    expect(getByText('Auto-Optimize')).toBeTruthy();
    expect(getByText('Debug Mode')).toBeTruthy();
  });

  it('renders all notification settings', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);

    expect(getByText('Email Notifications')).toBeTruthy();
    expect(getByText('Push Notifications')).toBeTruthy();
    expect(getByText('In-App Notifications')).toBeTruthy();
  });

  it('handles threshold changes correctly', () => {
    const { getByDisplayValue } = render(<PerformanceSettingsScreen />);
    const latencyInput = getByDisplayValue('1000');

    fireEvent.changeText(latencyInput, '2000');

    expect(performanceSettingsStore.setThreshold).toHaveBeenCalledWith('latency', 2000);
  });

  it('handles toggle settings correctly', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);
    const alertsToggle = getByText('Enable Alerts').parent?.parent;

    if (alertsToggle) {
      fireEvent.press(alertsToggle);
      expect(performanceSettingsStore.setAlertsEnabled).toHaveBeenCalledWith(false);
    }
  });

  it('handles notification channel changes correctly', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);
    const emailToggle = getByText('Email Notifications').parent?.parent;

    if (emailToggle) {
      fireEvent.press(emailToggle);
      expect(performanceSettingsStore.setNotificationChannel).toHaveBeenCalledWith('email', true);
    }
  });

  it('handles retention days changes correctly', () => {
    const { getByDisplayValue } = render(<PerformanceSettingsScreen />);
    const retentionInput = getByDisplayValue('7');

    fireEvent.changeText(retentionInput, '14');

    expect(performanceSettingsStore.setRetentionDays).toHaveBeenCalledWith(14);
  });

  it('handles sampling rate changes correctly', () => {
    const { getByDisplayValue } = render(<PerformanceSettingsScreen />);
    const samplingInput = getByDisplayValue('1000');

    fireEvent.changeText(samplingInput, '2000');

    expect(performanceSettingsStore.setSamplingRate).toHaveBeenCalledWith(2000);
  });

  it('validates numeric inputs', () => {
    const { getByDisplayValue } = render(<PerformanceSettingsScreen />);
    const latencyInput = getByDisplayValue('1000');

    fireEvent.changeText(latencyInput, 'invalid');

    expect(performanceSettingsStore.setThreshold).not.toHaveBeenCalled();
  });

  it('displays current threshold values', () => {
    const { getByDisplayValue } = render(<PerformanceSettingsScreen />);

    expect(getByDisplayValue('1000')).toBeTruthy(); // Latency
    expect(getByDisplayValue('0.8')).toBeTruthy(); // Compression
    expect(getByDisplayValue('100')).toBeTruthy(); // Batch Size
    expect(getByDisplayValue('0.05')).toBeTruthy(); // Error Rate
  });

  it('displays correct units for thresholds', () => {
    const { getByText } = render(<PerformanceSettingsScreen />);

    expect(getByText('ms')).toBeTruthy();
    expect(getByText('%')).toBeTruthy();
    expect(getByText('Kbps')).toBeTruthy();
  });
}); 