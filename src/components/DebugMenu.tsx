import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PerformanceExportService } from '@/services/PerformanceExportService';
import { BenchmarkScenarios } from '@/utils/BenchmarkScenarios';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

interface TestResults {
  latency: number;
  throughput: number;
}

interface DebugAction {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  action: () => void | Promise<void>;
  isDangerous?: boolean;
}

interface WebSocketPerformanceType {
  trackMessageLatency: (latency: number) => void;
  trackProcessingTime: (operation: string, time: number) => void;
  trackCompressionRatio: (ratio: number) => void;
  resetMetrics: () => void;
}

interface ScenarioConfig {
  messageCount: number;
  messageSize: number;
}

interface BenchmarkScenariosType {
  scenarios: Record<string, ScenarioConfig>;
  runScenario: (name: string) => Promise<TestResults>;
}

interface PerformanceMonitorType {
  resetMetrics: () => void;
}

// Cast the imported utilities to their proper types
const typedWebSocketPerformance = WebSocketPerformance as unknown as WebSocketPerformanceType;
const typedBenchmarkScenarios = BenchmarkScenarios as unknown as BenchmarkScenariosType;
const typedPerformanceMonitor = PerformanceMonitor as unknown as PerformanceMonitorType;

export function DebugMenu() {
  const navigation = useNavigation();
  const [showScenarios, setShowScenarios] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async (scenarioName: string) => {
    try {
      setIsRunning(true);
      setError(null);
      const testResults = await typedBenchmarkScenarios.runScenario(scenarioName);
      setResults(testResults);
      navigation.navigate('PerformanceMonitor' as never);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error(`Scenario ${scenarioName} failed:`, err);
    } finally {
      setIsRunning(false);
      setShowScenarios(false);
    }
  };

  const generateTestData = () => {
    // Generate some test metrics
    for (let i = 0; i < 20; i++) {
      typedWebSocketPerformance.trackMessageLatency(Math.random() * 200);
      typedWebSocketPerformance.trackProcessingTime('test', Math.random() * 100);
      typedWebSocketPerformance.trackCompressionRatio(0.4 + Math.random() * 0.4);
    }
  };

  const exportData = async () => {
    try {
      await PerformanceExportService.exportMetrics('json');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export failed:', err);
    }
  };

  const clearMetrics = () => {
    typedWebSocketPerformance.resetMetrics();
    typedPerformanceMonitor.resetMetrics();
    setResults(null);
    setError(null);
  };

  const debugActions: DebugAction[] = [
    { 
      id: 'test',
      label: 'Run Performance Test',
      icon: 'speedometer',
      action: () => setShowScenarios(true)
    },
    {
      id: 'generate',
      label: 'Generate Test Data',
      icon: 'database-plus',
      action: generateTestData
    },
    {
      id: 'export',
      label: 'Export Metrics',
      icon: 'export',
      action: exportData
    },
    {
      id: 'reset',
      label: 'Clear Metrics',
      icon: 'refresh',
      action: clearMetrics,
      isDangerous: true
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <HapticTab
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.toggleContent}>
          <IconSymbol name="bug" size={20} color="#2e7d32" />
          <ThemedText style={styles.toggleText}>Debug Menu</ThemedText>
        </View>
      </HapticTab>

      {isExpanded && (
        <View style={styles.actionsContainer}>
          {debugActions.map(action => (
            <HapticTab
              key={action.id}
              style={[
                styles.actionButton,
                action.isDangerous && styles.dangerButton
              ]}
              onPress={action.action}
            >
              <View style={styles.actionContent}>
                <IconSymbol
                  name={action.icon}
                  size={20}
                  color={action.isDangerous ? '#d32f2f' : '#2e7d32'}
                />
                <ThemedText
                  style={[
                    styles.actionText,
                    action.isDangerous && styles.dangerText
                  ]}
                >
                  {action.label}
                </ThemedText>
              </View>
            </HapticTab>
          ))}

          {results && (
            <View style={styles.results}>
              <ThemedText style={styles.resultsTitle}>Test Results</ThemedText>
              <ThemedText>Latency: {results.latency}ms</ThemedText>
              <ThemedText>Throughput: {results.throughput}/s</ThemedText>
            </View>
          )}

          {error && (
            <ThemedText style={styles.error}>{error}</ThemedText>
          )}
        </View>
      )}

      <Modal
        visible={showScenarios}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScenarios(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Test Scenarios</ThemedText>
            <ScrollView>
              {Object.entries(typedBenchmarkScenarios.scenarios).map(([name, config]) => (
                <TouchableOpacity
                  key={name}
                  style={styles.scenarioButton}
                  onPress={() => runScenario(name)}
                  disabled={isRunning}
                >
                  <ThemedText style={styles.scenarioTitle}>{name}</ThemedText>
                  <ThemedText style={styles.scenarioDetails}>
                    Messages: {config.messageCount}, Size: {config.messageSize}b
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <HapticTab
              style={styles.closeButton}
              onPress={() => setShowScenarios(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </HapticTab>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerText: {
    color: '#d32f2f',
  },
  results: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    color: '#d32f2f',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scenarioButton: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scenarioDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 