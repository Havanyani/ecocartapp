import { performanceAnalytics } from '@/utils/PerformanceAnalytics';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return '#FFA500';
      case 'critical':
        return '#FF0000';
      default:
        return '#4CAF50';
    }
  };

  return (
    <View style={[styles.metricCard, { borderColor: getStatusColor() }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: getStatusColor() }]}>
        {value} {unit}
      </Text>
    </View>
  );
};

export const PerformanceDashboard: React.FC = () => {
  const metrics = performanceAnalytics.getLatestMetrics();

  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No performance metrics available</Text>
      </View>
    );
  }

  const getMemoryStatus = (usage: number) => {
    if (usage > 200) return 'critical';
    if (usage > 100) return 'warning';
    return 'normal';
  };

  const getNetworkStatus = (latency: number) => {
    if (latency > 3000) return 'critical';
    if (latency > 1000) return 'warning';
    return 'normal';
  };

  const getRenderStatus = (time: number) => {
    if (time > 32) return 'critical';
    if (time > 16) return 'warning';
    return 'normal';
  };

  const getFrameRateStatus = (fps: number) => {
    if (fps < 30) return 'critical';
    if (fps < 45) return 'warning';
    return 'normal';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Performance Dashboard</Text>
      <Text style={styles.timestamp}>
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </Text>
      
      <View style={styles.grid}>
        <MetricCard
          title="Memory Usage"
          value={metrics.memoryUsage.toFixed(1)}
          unit="MB"
          status={getMemoryStatus(metrics.memoryUsage)}
        />
        
        <MetricCard
          title="Network Latency"
          value={metrics.networkLatency}
          unit="ms"
          status={getNetworkStatus(metrics.networkLatency)}
        />
        
        <MetricCard
          title="Render Time"
          value={metrics.renderTime.toFixed(1)}
          unit="ms"
          status={getRenderStatus(metrics.renderTime)}
        />
        
        <MetricCard
          title="Frame Rate"
          value={metrics.frameRate}
          unit="fps"
          status={getFrameRateStatus(metrics.frameRate)}
        />
        
        <MetricCard
          title="Interaction Delay"
          value={metrics.interactionDelay.toFixed(1)}
          unit="ms"
          status={metrics.interactionDelay > 100 ? 'warning' : 'normal'}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
}); 