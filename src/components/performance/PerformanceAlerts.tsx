import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  recommendation: string;
}

interface PerformanceThreshold {
  metric: string;
  warning: number;
  error: number;
  unit: string;
}

const DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'Memory Usage', warning: 80, error: 90, unit: '%' },
  { metric: 'CPU Usage', warning: 70, error: 85, unit: '%' },
  { metric: 'Frame Rate', warning: 30, error: 20, unit: 'fps' },
  { metric: 'Network Latency', warning: 200, error: 500, unit: 'ms' },
  { metric: 'Disk Usage', warning: 85, error: 95, unit: '%' },
];

export const PerformanceAlerts: React.FC = () => {
  const theme = useTheme()()();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [thresholds, setThresholds] = useState<PerformanceThreshold[]>(DEFAULT_THRESHOLDS);
  const [isLoading, setIsLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simulate real-time performance monitoring
    const interval = setInterval(() => {
      checkPerformanceMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [thresholds]);

  const checkPerformanceMetrics = () => {
    // Simulate performance metrics (replace with actual metrics)
    const metrics = {
      'Memory Usage': Math.random() * 100,
      'CPU Usage': Math.random() * 100,
      'Frame Rate': 60 - Math.random() * 40,
      'Network Latency': Math.random() * 1000,
      'Disk Usage': Math.random() * 100,
    };

    const newAlerts: PerformanceAlert[] = [];

    for (const threshold of thresholds) {
      const value = metrics[threshold.metric as keyof typeof metrics];
      
      if (value >= threshold.error) {
        newAlerts.push({
          id: `${threshold.metric}-${Date.now()}`,
          type: 'error',
          metric: threshold.metric,
          value,
          threshold: threshold.error,
          timestamp: Date.now(),
          recommendation: getRecommendation(threshold.metric, value),
        });
      } else if (value >= threshold.warning) {
        newAlerts.push({
          id: `${threshold.metric}-${Date.now()}`,
          type: 'warning',
          metric: threshold.metric,
          value,
          threshold: threshold.warning,
          timestamp: Date.now(),
          recommendation: getRecommendation(threshold.metric, value),
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
      animateNewAlert();
    }
  };

  const getRecommendation = (metric: string, value: number): string => {
    switch (metric) {
      case 'Memory Usage':
        return 'Consider closing unused apps or clearing app cache';
      case 'CPU Usage':
        return 'Reduce background processes or optimize computations';
      case 'Frame Rate':
        return 'Simplify animations or reduce UI complexity';
      case 'Network Latency':
        return 'Check network connection or reduce data transfer size';
      case 'Disk Usage':
        return 'Clean up temporary files or remove unused assets';
      default:
        return 'Monitor and optimize as needed';
    }
  };

  const animateNewAlert = () => {
    slideAnim.setValue(-50);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertColor = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'error':
        return '#FF3B30';
      case 'warning':
        return '#FFCC00';
      case 'info':
        return '#007AFF';
    }
  };

  const formatValue = (value: number, unit: string): string => {
    return `${value.toFixed(1)}${unit}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Alerts</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setAlerts([])}
        >
          <IconSymbol name="delete-sweep" size={20} color={theme.colors.primary} />
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="check-circle" size={48} color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>
            No performance alerts
          </Text>
        </View>
      ) : (
        <View style={styles.alertsList}>
          {alerts.map((alert) => (
            <Animated.View
              key={alert.id}
              style={[
                styles.alertItem,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertType}>
                  <IconSymbol
                    name={alert.type === 'error' ? 'alert-circle' : 'alert'}
                    size={20}
                    color={getAlertColor(alert.type)}
                  />
                  <Text style={[styles.alertMetric, { color: getAlertColor(alert.type) }]}>
                    {alert.metric}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dismissAlert(alert.id)}
                  style={styles.dismissButton}
                >
                  <IconSymbol name="close" size={16} color="rgba(0,0,0,0.5)" />
                </TouchableOpacity>
              </View>

              <View style={styles.alertContent}>
                <Text style={styles.alertValue}>
                  Current: {formatValue(alert.value, thresholds.find(t => t.metric === alert.metric)?.unit || '')}
                </Text>
                <Text style={styles.alertThreshold}>
                  Threshold: {formatValue(alert.threshold, thresholds.find(t => t.metric === alert.metric)?.unit || '')}
                </Text>
                <Text style={styles.alertTimestamp}>
                  {formatTimestamp(alert.timestamp)}
                </Text>
              </View>

              <View style={styles.recommendationContainer}>
                <IconSymbol name="lightbulb" size={16} color={theme.colors.primary} />
                <Text style={styles.recommendation}>
                  {alert.recommendation}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertMetric: {
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
  alertContent: {
    marginBottom: 8,
  },
  alertValue: {
    fontSize: 14,
    marginBottom: 2,
  },
  alertThreshold: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
    padding: 8,
    borderRadius: 4,
  },
  recommendation: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
  },
}); 