import { MobilePerformanceDashboard } from '@/components/performance/MobilePerformanceDashboard';
import { WebPerformanceDashboard } from '@/components/performance/WebPerformanceDashboard';
import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import type { RootStackParamList } from '@/navigation/types';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { PerformanceAlerts } from '@components/performance/PerformanceAlerts';
import { PerformanceDashboard } from '@components/performance/PerformanceDashboard';
import { PerformanceReport } from '@components/performance/PerformanceReport';
import { PerformanceTrends } from '@components/performance/PerformanceTrends';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';

type PerformanceMonitorScreenProps = NativeStackScreenProps<RootStackParamList, 'PerformanceMonitor'>;

interface PerformanceMetrics {
  averageLatency: number;
  throughput: number;
  averageCompressionRatio: number;
  totalMetrics: {
    messages: number;
    failed: number;
  };
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

type TabType = 'general' | 'web' | 'mobile';

export function PerformanceMonitorScreen({ navigation }: PerformanceMonitorScreenProps): JSX.Element {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Determine which tabs to show based on platform
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This would be the real data source in a complete implementation
      // Here we're using placeholder data for demonstration
      const data = {
        averageLatency: 245,
        throughput: 10.5,
        averageCompressionRatio: 0.65,
        totalMetrics: {
          messages: 1258,
          failed: 32,
        },
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              data: [20, 45, 28, 80, 99],
            },
          ],
        },
      };
      setMetrics(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load metrics');
      setError(error);
      PerformanceMonitor.captureError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();

    // Set the appropriate default tab based on platform
    if (isWeb) {
      setActiveTab('web');
    } else if (isMobile) {
      setActiveTab('mobile');
    } else {
      setActiveTab('general');
    }
  }, [loadMetrics, isWeb, isMobile]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-loading">
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-error">
        <ThemedText style={styles.errorText}>{error.message}</ThemedText>
        <HapticTab 
          style={styles.retryButton}
          onPress={() => void loadMetrics()}
          accessibilityLabel="Retry loading metrics"
        >
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </HapticTab>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.container, styles.centered]} testID="performance-monitor-empty">
        <ThemedText>No metrics available</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="performance-monitor-screen">
      <PerformanceAlerts />
      
      {/* Tab navigation for different performance views */}
      <View style={styles.tabContainer}>
        <HapticTab 
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
            General
          </ThemedText>
        </HapticTab>
        
        {isWeb && (
          <HapticTab 
            style={[styles.tab, activeTab === 'web' && styles.activeTab]}
            onPress={() => setActiveTab('web')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'web' && styles.activeTabText]}>
              Web Vitals
            </ThemedText>
          </HapticTab>
        )}

        {isMobile && (
          <HapticTab 
            style={[styles.tab, activeTab === 'mobile' && styles.activeTab]}
            onPress={() => setActiveTab('mobile')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'mobile' && styles.activeTabText]}>
              Mobile Vitals
            </ThemedText>
          </HapticTab>
        )}
      </View>
      
      {activeTab === 'general' && (
        <ScrollView>
          <PerformanceDashboard metrics={metrics} />
          <PerformanceReport />
          <PerformanceTrends />
        </ScrollView>
      )}

      {activeTab === 'web' && (
        <WebPerformanceDashboard refreshInterval={60000} />
      )}

      {activeTab === 'mobile' && (
        <MobilePerformanceDashboard refreshInterval={30000} autoTrackFrames={false} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
}); 