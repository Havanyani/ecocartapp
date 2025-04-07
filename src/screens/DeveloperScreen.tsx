import ErrorLoggingService, { ErrorLog, ErrorStats } from '@/services/ErrorLoggingService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function DeveloperScreen() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    loadErrorData();
  }, []);

  const loadErrorData = () => {
    setStats(ErrorLoggingService.getErrorStats());
    setRecentErrors(ErrorLoggingService.getRecentErrors());
  };

  const clearErrorLogs = () => {
    ErrorLoggingService.clearErrorLogs();
    loadErrorData();
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>Loading error statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Statistics</Text>
        <Text style={styles.stat}>Total Errors: {stats.totalErrors}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Errors by Type</Text>
        {Object.entries(stats.errorsByType).map(([type, count]) => (
          <Text key={type} style={styles.stat}>
            {type}: {count.toString()}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Errors by Route</Text>
        {Object.entries(stats.errorsByRoute).map(([route, count]) => (
          <Text key={route} style={styles.stat}>
            {route}: {count.toString()}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Errors by Component</Text>
        {Object.entries(stats.errorsByComponent).map(([component, count]) => (
          <Text key={component} style={styles.stat}>
            {component}: {count.toString()}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Errors</Text>
        {recentErrors.map((error) => (
          <View key={error.id} style={styles.errorCard}>
            <Text style={styles.errorTitle}>{error.error.name}</Text>
            <Text style={styles.errorMessage}>{error.error.message}</Text>
            <Text style={styles.errorContext}>
              Route: {error.context.route || 'N/A'}
            </Text>
            <Text style={styles.errorContext}>
              Component: {error.context.component || 'N/A'}
            </Text>
            <Text style={styles.errorContext}>
              Time: {new Date(error.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearErrorLogs}>
        <Text style={styles.clearButtonText}>Clear Error Logs</Text>
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
  errorCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  errorContext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
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