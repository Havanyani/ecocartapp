import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PerformanceMonitor } from '../../../src/components/performance/PerformanceMonitor';
import { Button } from '../../../src/components/ui/Button';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { WebSocketPerformance } from '../../../src/utils/WebSocketPerformance';

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export default function PerformanceMonitorScreen() {
  const { theme } = useTheme();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const handleAlert = useCallback((type: PerformanceAlert['type'], message: string) => {
    setAlerts(prev => [
      { type, message, timestamp: Date.now() },
      ...prev.slice(0, 9), // Keep last 10 alerts
    ]);
  }, []);

  useEffect(() => {
    // TODO: Replace any with proper type once WebSocketPerformance types are defined
    const metrics: any = WebSocketPerformance.getMetricsSummary();
    
    // Example alert triggers based on metrics
    if (metrics.averageLatency > 200) {
      handleAlert('warning', 'High latency detected');
    }
    if (metrics.averageProcessingTime > 500) {
      handleAlert('error', 'Processing time exceeds threshold');
    }
  }, [handleAlert]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText variant="h1">Performance</ThemedText>
            <ThemedText variant="body" style={{ color: theme.colors.textSecondary }}>
              Monitor app performance metrics
            </ThemedText>
          </View>
          <Button
            variant="primary"
            label={isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            onPress={() => setIsMonitoring(!isMonitoring)}
          />
        </View>

        {isMonitoring && (
          <PerformanceMonitor
            refreshInterval={3000}
            showLatency
            showThroughput
            showCompression
          />
        )}

        <View style={styles.section}>
          <ThemedText variant="h2">Alerts</ThemedText>
          <View style={[styles.alertsContainer, { backgroundColor: theme.colors.surface }]}>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={theme.colors.success}
                />
                <ThemedText variant="body" style={{ color: theme.colors.textSecondary }}>
                  No performance issues detected
                </ThemedText>
              </View>
            ) : (
              alerts.map((alert, index) => (
                <View
                  key={alert.timestamp}
                  style={[
                    styles.alertItem,
                    index < alerts.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.alertIcon}>
                    <Ionicons
                      name={
                        alert.type === 'error'
                          ? 'alert-circle'
                          : alert.type === 'warning'
                          ? 'warning'
                          : 'information-circle'
                      }
                      size={24}
                      color={
                        alert.type === 'error'
                          ? theme.colors.error
                          : alert.type === 'warning'
                          ? theme.colors.warning
                          : theme.colors.primary
                      }
                    />
                  </View>
                  <View style={styles.alertContent}>
                    <ThemedText variant="body">{alert.message}</ThemedText>
                    <ThemedText
                      variant="body-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  alertsContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    padding: 16,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
}); 