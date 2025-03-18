import { useNotifications } from '@/hooks/useNotifications';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';
import { PerformanceSettingsScreen } from '@/screens/PerformanceSettingsScreen';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock hooks
jest.mock('@/hooks/usePerformanceSettings', () => ({
  usePerformanceSettings: jest.fn()
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn()
}));

const mockMetrics = [
  {
    id: '1',
    name: 'Plastic Collection Rate',
    description: 'Track daily plastic collection amounts',
    isEnabled: true,
    threshold: 5,
    unit: 'kg'
  },
  {
    id: '2',
    name: 'Credit Accumulation',
    description: 'Monitor credit earning rate',
    isEnabled: false,
    threshold: 100,
    unit: 'credits'
  }
];

const mockNotificationSettings = [
  {
    id: '1',
    type: 'alert',
    frequency: 'immediate',
    isEnabled: true
  },
  {
    id: '2',
    type: 'report',
    frequency: 'weekly',
    isEnabled: false
  }
];

describe('PerformanceSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePerformanceSettings as jest.Mock).mockReturnValue({
      metrics: mockMetrics,
      updateMetric: jest.fn(),
      notificationSettings: mockNotificationSettings,
      updateNotificationSetting: jest.fn()
    });
    (useNotifications as jest.Mock).mockReturnValue({
      requestNotificationPermission: jest.fn().mockResolvedValue(true)
    });
  });

  it('renders metrics tab correctly', () => {
    const { getByText, getAllByRole } = render(<PerformanceSettingsScreen />);

    expect(getByText('Plastic Collection Rate')).toBeTruthy();
    expect(getByText('Credit Accumulation')).toBeTruthy();
    expect(getAllByRole('switch')).toHaveLength(2);
  });

  it('switches between metrics and notifications tabs', () => {
    const { getByText, getByTestId } = render(<PerformanceSettingsScreen />);
    
    fireEvent.press(getByTestId('notifications-tab'));
    expect(getByText('Notification Settings')).toBeTruthy();
    
    fireEvent.press(getByTestId('metrics-tab'));
    expect(getByText('Performance Metrics')).toBeTruthy();
  });
}); 