import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import MarkdownView from 'react-native-markdown-display';
import { StorageMonitorInstance } from '../../utils/StorageMonitor';

// Interface for metrics data
interface MetricsData {
  mmkvReads: number;
  mmkvWrites: number;
  mmkvAvgReadTime: number;
  mmkvAvgWriteTime: number;
  sqliteReads: number;
  sqliteWrites: number;
  sqliteAvgReadTime: number;
  sqliteAvgWriteTime: number;
  totalErrors: number;
  uptime: string;
}

/**
 * Component to display storage monitoring metrics
 */
const StorageMonitoringScreen: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData>({
    mmkvReads: 0,
    mmkvWrites: 0,
    mmkvAvgReadTime: 0,
    mmkvAvgWriteTime: 0,
    sqliteReads: 0,
    sqliteWrites: 0,
    sqliteAvgReadTime: 0,
    sqliteAvgWriteTime: 0,
    totalErrors: 0,
    uptime: '0:00:00'
  });
  const [report, setReport] = useState<string | null>(null);
  
  // Toggle monitoring state
  const toggleMonitoring = () => {
    if (isMonitoring) {
      StorageMonitorInstance.stopMonitoring();
      setIsMonitoring(false);
    } else {
      StorageMonitorInstance.startMonitoring();
      setIsMonitoring(true);
    }
  };
  
  // Reset all metrics
  const resetMetrics = () => {
    StorageMonitorInstance.resetMetrics();
    updateMetrics();
    setReport(null);
  };
  
  // Generate a detailed report
  const generateReport = () => {
    const reportText = StorageMonitorInstance.generateReport();
    setReport(reportText);
  };
  
  // Update metrics from the monitor
  const updateMetrics = () => {
    const currentMetrics = StorageMonitorInstance.getMetrics();
    
    // Calculate uptime
    const uptime = Date.now() - currentMetrics.resetTimestamp;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    setMetrics({
      mmkvReads: currentMetrics.mmkvReadCount,
      mmkvWrites: currentMetrics.mmkvWriteCount + currentMetrics.mmkvDeleteCount,
      mmkvAvgReadTime: currentMetrics.mmkvReadCount > 0 
        ? currentMetrics.mmkvReadTime / currentMetrics.mmkvReadCount 
        : 0,
      mmkvAvgWriteTime: currentMetrics.mmkvWriteCount > 0 
        ? currentMetrics.mmkvWriteTime / currentMetrics.mmkvWriteCount 
        : 0,
      sqliteReads: currentMetrics.sqliteReadCount,
      sqliteWrites: currentMetrics.sqliteWriteCount,
      sqliteAvgReadTime: currentMetrics.sqliteReadCount > 0 
        ? currentMetrics.sqliteReadTime / currentMetrics.sqliteReadCount 
        : 0,
      sqliteAvgWriteTime: currentMetrics.sqliteWriteCount > 0 
        ? currentMetrics.sqliteWriteTime / currentMetrics.sqliteWriteCount 
        : 0,
      totalErrors: currentMetrics.mmkvErrors + currentMetrics.sqliteErrors,
      uptime: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    });
  };
  
  // Set up periodic metrics updates
  useEffect(() => {
    // Initial update
    updateMetrics();
    
    // Add listener for real-time updates
    const removeListener = StorageMonitorInstance.addListener(() => {
      updateMetrics();
    });
    
    // Set up timer for regular updates
    const timerId = setInterval(updateMetrics, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(timerId);
      removeListener();
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Monitoring</Text>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Monitoring Status: </Text>
        <Switch 
          value={isMonitoring}
          onValueChange={toggleMonitoring}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isMonitoring ? '#4CAF50' : '#f4f3f4'}
        />
        <Text style={[styles.statusText, { color: isMonitoring ? '#4CAF50' : '#888' }]}>
          {isMonitoring ? 'Active' : 'Inactive'}
        </Text>
      </View>
      
      <Text style={styles.uptimeText}>Uptime: {metrics.uptime}</Text>
      
      <ScrollView style={styles.metricsContainer}>
        {/* MMKV Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MMKV Operations</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.mmkvReads}</Text>
              <Text style={styles.metricLabel}>Read Operations</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.mmkvWrites}</Text>
              <Text style={styles.metricLabel}>Write Operations</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.mmkvAvgReadTime.toFixed(2)} ms</Text>
              <Text style={styles.metricLabel}>Avg Read Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.mmkvAvgWriteTime.toFixed(2)} ms</Text>
              <Text style={styles.metricLabel}>Avg Write Time</Text>
            </View>
          </View>
        </View>
        
        {/* SQLite Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SQLite Operations</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.sqliteReads}</Text>
              <Text style={styles.metricLabel}>Read Operations</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.sqliteWrites}</Text>
              <Text style={styles.metricLabel}>Write Operations</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.sqliteAvgReadTime.toFixed(2)} ms</Text>
              <Text style={styles.metricLabel}>Avg Read Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.sqliteAvgWriteTime.toFixed(2)} ms</Text>
              <Text style={styles.metricLabel}>Avg Write Time</Text>
            </View>
          </View>
        </View>
        
        {/* Error Summary */}
        <View style={[styles.errorContainer, metrics.totalErrors > 0 && styles.errorContainerActive]}>
          <Text style={styles.errorTitle}>Total Errors: {metrics.totalErrors}</Text>
          {metrics.totalErrors > 0 && (
            <Text style={styles.errorMessage}>
              Check the report for details on storage errors.
            </Text>
          )}
        </View>
        
        {/* Report Display */}
        {report && (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Storage Report</Text>
            <MarkdownView>
              {report}
            </MarkdownView>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetMetrics}
        >
          <Text style={styles.buttonText}>Reset Metrics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.reportButton]} 
          onPress={generateReport}
        >
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>
      </View>
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  uptimeText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  metricsContainer: {
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#388e3c',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorContainerActive: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  errorMessage: {
    fontSize: 14,
    color: '#c62828',
    marginTop: 8,
  },
  reportContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#388e3c',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  reportButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StorageMonitoringScreen; 