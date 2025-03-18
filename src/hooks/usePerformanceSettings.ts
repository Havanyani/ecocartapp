import { useCallback, useState } from 'react';

interface Metric {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  threshold: number;
  unit: string;
}

interface NotificationSetting {
  id: string;
  type: 'alert' | 'report';
  frequency: 'immediate' | 'daily' | 'weekly';
  isEnabled: boolean;
}

export function usePerformanceSettings() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);

  const updateMetric = useCallback(async (id: string, updates: Partial<Metric>) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, ...updates } : metric
    ));
  }, []);

  const updateNotificationSetting = useCallback(async (id: string, updates: Partial<NotificationSetting>) => {
    setNotificationSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, ...updates } : setting
    ));
  }, []);

  return {
    metrics,
    updateMetric,
    notificationSettings,
    updateNotificationSetting,
  };
} 