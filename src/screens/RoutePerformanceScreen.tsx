import { useRoutePerformance } from '@/utils/routePerformance';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function RoutePerformanceScreen() {
  const {
    getMetrics,
    getAverageTransitionTime,
    getSlowestRoutes,
    clearMetrics,
  } = useRoutePerformance();

  const metrics = getMetrics();
  const averageTime = getAverageTransitionTime();
  const slowestRoutes = getSlowestRoutes();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route Performance Overview</Text>
        <Text style={styles.stat}>
          Total Routes: {metrics.length}
        </Text>
        <Text style={styles.stat}>
          Average Transition Time: {averageTime.toFixed(2)}ms
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Slowest Routes</Text>
        {slowestRoutes.map((metric, index) => (
          <View key={metric.timestamp} style={styles.metricCard}>
            <Text style={styles.metricTitle}>
              {index + 1}. {metric.route}
            </Text>
            <Text style={styles.metricValue}>
              {metric.transitionTime.toFixed(2)}ms
            </Text>
            <Text style={styles.metricTime}>
              {new Date(metric.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Routes</Text>
        {metrics.slice(-5).reverse().map((metric) => (
          <View key={metric.timestamp} style={styles.metricCard}>
            <Text style={styles.metricTitle}>{metric.route}</Text>
            <Text style={styles.metricValue}>
              {metric.transitionTime.toFixed(2)}ms
            </Text>
            <Text style={styles.metricTime}>
              {new Date(metric.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearMetrics}>
        <Text style={styles.clearButtonText}>Clear Metrics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  stat: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  metricCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricTime: {
    fontSize: 12,
    color: '#999',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 