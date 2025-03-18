/**
 * AIBenchmarkScreen.tsx
 * 
 * Screen for running AI performance benchmarks and displaying results.
 */

import { AIPerformanceBenchmark } from '@/utils/performance/AIPerformanceBenchmark';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import necessary components and utilities
import { OptimizedAICache } from '@/services/ai/OptimizedAICache';
import { runInstrumentation } from '@/utils/performance/Instrumentation';

// Result type for benchmarks
interface BenchmarkResult {
  name: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  totalRuns: number;
  successRate: number;
  memoryUsage?: number;
  details?: any;
}

/**
 * AIBenchmarkScreen component
 */
const AIBenchmarkScreen: React.FC = () => {
  // State for benchmark results and loading state
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [benchmarkStartTime, setBenchmarkStartTime] = useState<number | null>(null);
  const [benchmarkEndTime, setBenchmarkEndTime] = useState<number | null>(null);
  
  // Get cache statistics
  const fetchCacheStats = useCallback(async () => {
    try {
      const cache = OptimizedAICache.getInstance();
      const stats = cache.getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      console.error('Error fetching cache stats:', err);
    }
  }, []);
  
  // Fetch initial cache stats on mount
  useEffect(() => {
    fetchCacheStats();
  }, [fetchCacheStats]);
  
  // Run benchmarks
  const runBenchmark = async () => {
    setIsLoading(true);
    setError(null);
    setBenchmarkStartTime(Date.now());
    setBenchmarkEndTime(null);
    
    try {
      // Run instrumented benchmarks to track performance
      const benchmarkResults = await runInstrumentation('benchmark_execution', 'Run all benchmarks', async () => {
        const benchmark = new AIPerformanceBenchmark();
        return await benchmark.runAllBenchmarks();
      });
      
      // Update results
      setResults(benchmarkResults);
      
      // Refresh cache stats
      await fetchCacheStats();
    } catch (err: any) {
      console.error('Benchmark error:', err);
      setError(err.message || 'Failed to run benchmarks');
    } finally {
      setBenchmarkEndTime(Date.now());
      setIsLoading(false);
    }
  };
  
  // Clear cache
  const clearCache = async () => {
    try {
      setIsLoading(true);
      const cache = OptimizedAICache.getInstance();
      await cache.clearCache();
      await fetchCacheStats();
    } catch (err: any) {
      setError(err.message || 'Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatting helper for time
  const formatTime = (ms: number): string => {
    if (ms < 1) return '<1 ms';
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };
  
  // Render benchmark result component
  const renderBenchmarkResult = (result: BenchmarkResult, index: number) => {
    return (
      <View key={index} style={styles.resultCard}>
        <Text style={styles.resultTitle}>{result.name}</Text>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Average Time:</Text>
          <Text style={styles.resultValue}>{formatTime(result.avgTime)}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Min Time:</Text>
          <Text style={styles.resultValue}>{formatTime(result.minTime)}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Max Time:</Text>
          <Text style={styles.resultValue}>{formatTime(result.maxTime)}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Success Rate:</Text>
          <Text style={styles.resultValue}>{(result.successRate * 100).toFixed(0)}%</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Total Runs:</Text>
          <Text style={styles.resultValue}>{result.totalRuns}</Text>
        </View>
      </View>
    );
  };
  
  // Render cache statistics
  const renderCacheStats = () => {
    if (!cacheStats) return null;
    
    return (
      <View style={styles.cacheStats}>
        <Text style={styles.sectionTitle}>Cache Statistics</Text>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Memory Entries:</Text>
          <Text style={styles.resultValue}>{cacheStats.memoryEntries}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Total Entries:</Text>
          <Text style={styles.resultValue}>{cacheStats.totalEntries}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>FAQ Entries:</Text>
          <Text style={styles.resultValue}>{cacheStats.faqEntries}</Text>
        </View>
        
        {cacheStats.indexes && (
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Index Sizes:</Text>
            <Text style={styles.resultValue}>
              Q:{cacheStats.indexes.queries}, 
              F:{cacheStats.indexes.faqs}, 
              C:{cacheStats.indexes.categories}
            </Text>
          </View>
        )}
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Last Updated:</Text>
          <Text style={styles.resultValue}>
            {cacheStats.lastUpdated ? new Date(cacheStats.lastUpdated).toLocaleTimeString() : 'Never'}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Performance Benchmark</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <Button 
              title="Run Benchmarks" 
              onPress={runBenchmark}
              disabled={isLoading}
            />
            <Button 
              title="Clear Cache" 
              onPress={clearCache}
              disabled={isLoading}
            />
          </View>
          
          {/* Display benchmark timing */}
          {(benchmarkStartTime || benchmarkEndTime) && (
            <View style={styles.timingContainer}>
              {benchmarkStartTime && (
                <Text>Started: {new Date(benchmarkStartTime).toLocaleTimeString()}</Text>
              )}
              {benchmarkEndTime && (
                <Text>
                  Completed: {new Date(benchmarkEndTime).toLocaleTimeString()} 
                  ({formatTime(benchmarkEndTime - benchmarkStartTime)})
                </Text>
              )}
            </View>
          )}
          
          {/* Show loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Running benchmarks...</Text>
            </View>
          )}
          
          {/* Show error message if any */}
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {/* Show cache statistics */}
          {renderCacheStats()}
          
          {/* Show benchmark results */}
          {results.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Benchmark Results</Text>
              {results.map(renderBenchmarkResult)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultLabel: {
    color: '#666',
  },
  resultValue: {
    fontWeight: '500',
  },
  cacheStats: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timingContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
});

export default AIBenchmarkScreen; 