import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MarkdownView from 'react-native-markdown-display';
import StorageBenchmark from '../../utils/StorageBenchmark';

/**
 * Component to run storage benchmarks and display results
 */
const StorageBenchmarkScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  
  const runBenchmarks = async () => {
    setLoading(true);
    try {
      // Run both benchmarks
      const kvResults = await StorageBenchmark.runKVStorageBenchmark();
      const sqliteResults = await StorageBenchmark.runSQLiteBenchmark();
      
      // Format the results into a report
      const formattedReport = StorageBenchmark.formatResults(kvResults, sqliteResults);
      setReport(formattedReport);
    } catch (error) {
      console.error('Benchmark error:', error);
      setReport(`# Benchmark Error\n\nAn error occurred during benchmarking: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Benchmark</Text>
      
      <Text style={styles.description}>
        This benchmark will compare the performance of AsyncStorage vs. our hybrid MMKV+SQLite storage solution.
        The test will measure read/write operations for different data sizes.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={runBenchmarks}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running Benchmarks...' : 'Run Benchmarks'}
        </Text>
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Running benchmarks, please wait...</Text>
          <Text style={styles.loadingSubtext}>This may take a minute or two</Text>
        </View>
      )}
      
      {report && !loading && (
        <ScrollView style={styles.reportContainer}>
          <MarkdownView>
            {report}
          </MarkdownView>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2e7d32',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    color: '#555',
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    color: '#777',
  },
  reportContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
});

export default StorageBenchmarkScreen; 