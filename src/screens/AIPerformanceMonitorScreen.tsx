import { useTheme } from '@/theme';
import aiPerformanceMonitor, { MetricType } from '@/utils/performance/AIPerformanceMonitor';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MetricDisplayData = {
  label: string;
  type: MetricType;
  value: number;
  recent: number;
  count: number;
  unit: string;
  improvement?: number;
  target?: number;
};

const AIPerformanceMonitorScreen: React.FC = () => {
  const theme = useTheme()()();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricDisplayData[]>([]);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(aiPerformanceMonitor.isMonitoringEnabled());
  
  // Performance targets from the plan
  const performanceTargets: Partial<Record<MetricType, number>> = {
    'response_time': 500,      // Target: <500ms
    'cache_lookup': 50,        // Target: <50ms
    'similarity_calc': 20,     // Target: <20ms
    'cache_load_time': 200,    // Target: <200ms
    'api_request_time': 300,   // Target: <300ms
    'message_processing': 100, // Target: <100ms
  };
  
  useEffect(() => {
    loadMetrics();
  }, []);
  
  const loadMetrics = async () => {
    setIsLoading(true);
    
    try {
      const report = aiPerformanceMonitor.generateReport();
      
      const metricsData: MetricDisplayData[] = [
        {
          label: 'Response Time',
          type: 'response_time',
          value: report.averages.response_time,
          recent: report.recents.response_time,
          count: report.counts.response_time,
          unit: 'ms',
          target: performanceTargets.response_time,
        },
        {
          label: 'Cache Lookup',
          type: 'cache_lookup',
          value: report.averages.cache_lookup,
          recent: report.recents.cache_lookup,
          count: report.counts.cache_lookup,
          unit: 'ms',
          target: performanceTargets.cache_lookup,
        },
        {
          label: 'Similarity Calculation',
          type: 'similarity_calc',
          value: report.averages.similarity_calc,
          recent: report.recents.similarity_calc,
          count: report.counts.similarity_calc,
          unit: 'ms',
          target: performanceTargets.similarity_calc,
        },
        {
          label: 'Message Rendering',
          type: 'render_time',
          value: report.averages.render_time,
          recent: report.recents.render_time,
          count: report.counts.render_time,
          unit: 'ms',
        },
        {
          label: 'Memory Usage',
          type: 'memory_usage',
          value: report.averages.memory_usage,
          recent: report.recents.memory_usage,
          count: report.counts.memory_usage,
          unit: 'MB',
        },
        {
          label: 'Cache Load Time',
          type: 'cache_load_time',
          value: report.averages.cache_load_time,
          recent: report.recents.cache_load_time,
          count: report.counts.cache_load_time,
          unit: 'ms',
          target: performanceTargets.cache_load_time,
        },
        {
          label: 'API Request Time',
          type: 'api_request_time',
          value: report.averages.api_request_time,
          recent: report.recents.api_request_time,
          count: report.counts.api_request_time,
          unit: 'ms',
          target: performanceTargets.api_request_time,
        },
        {
          label: 'Message Processing',
          type: 'message_processing',
          value: report.averages.message_processing,
          recent: report.recents.message_processing,
          count: report.counts.message_processing,
          unit: 'ms',
          target: performanceTargets.message_processing,
        },
      ];
      
      // Calculate improvement percentage if there's both current and target values
      metricsData.forEach(metric => {
        if (metric.value > 0 && metric.target) {
          const current = metric.value;
          const target = metric.target;
          
          if (current > target) {
            // Needs improvement
            const improvementNeeded = ((current - target) / current) * 100;
            metric.improvement = -improvementNeeded; // Negative means needs improvement
          } else {
            // Already better than target
            const improvementAchieved = ((target - current) / target) * 100;
            metric.improvement = improvementAchieved; // Positive means already improved
          }
        }
      });
      
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMonitoring = () => {
    const newState = !isMonitoringEnabled;
    aiPerformanceMonitor.setEnabled(newState);
    setIsMonitoringEnabled(newState);
  };
  
  const clearMetrics = () => {
    Alert.alert(
      'Clear Performance Metrics',
      'Are you sure you want to clear all collected performance metrics? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            aiPerformanceMonitor.clearMetrics();
            loadMetrics();
          },
        },
      ]
    );
  };
  
  const exportMetrics = async () => {
    try {
      const metricsJson = aiPerformanceMonitor.exportMetrics();
      await Share.share({
        message: metricsJson,
        title: 'EcoCart AI Assistant Performance Metrics',
      });
    } catch (error) {
      console.error('Error exporting metrics:', error);
      Alert.alert('Export Error', 'Failed to export performance metrics.');
    }
  };
  
  const renderMetricItem = (item: MetricDisplayData) => {
    // Only show items with data
    if (item.count === 0) return null;
    
    const recentIsBetter = item.recent < item.value;
    const hasTarget = item.target !== undefined;
    const meetsTarget = hasTarget && item.value <= (item.target as number);
    
    return (
      <View key={item.type} style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
            {item.label}
          </Text>
          <Text style={[styles.metricCount, { color: theme.colors.textSecondary }]}>
            {item.count} samples
          </Text>
        </View>
        
        <View style={styles.metricValueContainer}>
          <Text style={[
            styles.metricValue, 
            { 
              color: hasTarget 
                ? (meetsTarget ? '#4CAF50' : '#FF5722') 
                : theme.colors.text 
            }
          ]}>
            {item.value.toFixed(2)} {item.unit}
          </Text>
          
          {hasTarget && (
            <Text style={[
              styles.targetValue,
              { color: meetsTarget ? '#4CAF50' : '#FF5722' }
            ]}>
              Target: {item.target} {item.unit}
            </Text>
          )}
          
          {item.improvement !== undefined && (
            <View style={styles.improvementContainer}>
              <Ionicons 
                name={item.improvement >= 0 ? "checkmark-circle" : "arrow-up-circle"} 
                size={14} 
                color={item.improvement >= 0 ? '#4CAF50' : '#FF5722'} 
              />
              <Text style={[
                styles.improvementText,
                { color: item.improvement >= 0 ? '#4CAF50' : '#FF5722' }
              ]}>
                {item.improvement >= 0 
                  ? `${item.improvement.toFixed(1)}% better than target` 
                  : `${Math.abs(item.improvement).toFixed(1)}% improvement needed`}
              </Text>
            </View>
          )}
        </View>
        
        {item.recent !== item.value && (
          <View style={styles.recentContainer}>
            <Text style={[styles.recentLabel, { color: theme.colors.textSecondary }]}>
              Recent (last 5):
            </Text>
            <Text style={[
              styles.recentValue, 
              { color: recentIsBetter ? '#4CAF50' : '#FF5722' }
            ]}>
              {item.recent.toFixed(2)} {item.unit}
              {' '}
              <Ionicons 
                name={recentIsBetter ? "trending-down" : "trending-up"} 
                size={14} 
                color={recentIsBetter ? '#4CAF50' : '#FF5722'} 
              />
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          AI Performance Monitor
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={exportMetrics}
            style={styles.actionButton}
            accessibilityLabel="Export metrics"
          >
            <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={toggleMonitoring}
          style={[
            styles.toggleButton,
            { backgroundColor: isMonitoringEnabled ? '#4CAF50' : theme.colors.background }
          ]}
          accessibilityLabel={isMonitoringEnabled ? "Disable monitoring" : "Enable monitoring"}
        >
          <Ionicons 
            name={isMonitoringEnabled ? "eye" : "eye-off"} 
            size={20} 
            color={isMonitoringEnabled ? '#FFFFFF' : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.toggleText,
            { color: isMonitoringEnabled ? '#FFFFFF' : theme.colors.textSecondary }
          ]}>
            {isMonitoringEnabled ? 'Monitoring On' : 'Monitoring Off'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={loadMetrics}
          style={[styles.actionButton, styles.refreshButton]}
          accessibilityLabel="Refresh metrics"
        >
          <Ionicons name="refresh" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={clearMetrics}
          style={[styles.actionButton, styles.clearButton]}
          accessibilityLabel="Clear metrics"
        >
          <Ionicons name="trash-outline" size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading metrics...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {metrics.length === 0 || metrics.every(m => m.count === 0) ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="analytics-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No performance metrics available.
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Use the AI Assistant to generate performance data.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Performance Metrics
              </Text>
              {metrics.map(renderMetricItem)}
              
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Values shown are averages across all collected data. "Recent" shows the average of the last 5 measurements.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    marginLeft: 'auto',
  },
  clearButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricCount: {
    fontSize: 12,
  },
  metricValueContainer: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  targetValue: {
    fontSize: 12,
    marginTop: 2,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  improvementText: {
    fontSize: 12,
    marginLeft: 4,
  },
  recentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  recentLabel: {
    fontSize: 12,
  },
  recentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});

export default AIPerformanceMonitorScreen; 