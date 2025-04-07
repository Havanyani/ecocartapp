import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { TestResultExporter } from '@/utils/TestResultExporter';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ProfileResult {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  metrics: {
    memory: number;
    cpu: number;
    fps: number;
    renderTime: number;
    networkCalls: number;
    diskOperations: number;
  };
  traces: {
    component: string;
    renderCount: number;
    totalTime: number;
    avgTime: number;
  }[];
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  thresholds: {
    memory: number;
    cpu: number;
    fps: number;
    renderTime: number;
    networkCalls: number;
    diskOperations: number;
  };
}

interface MemoryLeakResult {
  isDetected: boolean;
  leakSize: number;
  componentName: string;
  stackTrace: string;
}

interface AnimationMetrics {
  framesDropped: number;
  jankScore: number;
  averageFrameTime: number;
}

interface ExtendedProfileResult extends ProfileResult {
  memoryLeak?: MemoryLeakResult;
  animation?: AnimationMetrics;
  thresholds: {
    memory: number;
    cpu: number;
    fps: number;
    renderTime: number;
    networkCalls: number;
    diskOperations: number;
  };
}

interface Theme {
  colors: {
    primary: string | { primary: string; secondary: string };
    text: string | { primary: string; secondary: string };
    // ... other colors
  };
}

const DEFAULT_TEST_CASES: TestCase[] = [
  {
    id: 'startup',
    name: 'App Startup',
    description: 'Measures app startup performance metrics',
    thresholds: {
      memory: 100,
      cpu: 80,
      fps: 30,
      renderTime: 1000,
      networkCalls: 10,
      diskOperations: 5,
    },
  },
  {
    id: 'navigation',
    name: 'Navigation Performance',
    description: 'Tests screen transition performance',
    thresholds: {
      memory: 50,
      cpu: 40,
      fps: 45,
      renderTime: 300,
      networkCalls: 5,
      diskOperations: 2,
    },
  },
  {
    id: 'interaction',
    name: 'User Interaction',
    description: 'Measures responsiveness to user actions',
    thresholds: {
      memory: 60,
      cpu: 50,
      fps: 50,
      renderTime: 200,
      networkCalls: 3,
      diskOperations: 1,
    },
  },
];

const ADDITIONAL_TEST_CASES: TestCase[] = [
  {
    id: 'memory-leak',
    name: 'Memory Leak Detection',
    description: 'Monitors memory usage patterns to detect potential leaks',
    thresholds: {
      memory: 150,
      cpu: 70,
      fps: 30,
      renderTime: 500,
      networkCalls: 5,
      diskOperations: 2,
    },
  },
  {
    id: 'animation',
    name: 'Animation Performance',
    description: 'Tests smooth animation rendering and frame rates',
    thresholds: {
      memory: 80,
      cpu: 60,
      fps: 55,
      renderTime: 16,
      networkCalls: 2,
      diskOperations: 1,
    },
  },
];

const ALL_TEST_CASES = [...DEFAULT_TEST_CASES, ...ADDITIONAL_TEST_CASES];

interface ExportModalState {
  visible: boolean;
  format: 'json' | 'csv' | 'pdf';
  includeTraces: boolean;
  includeHistory: boolean;
  dateRange: {
    start: number;
    end: number;
  } | null;
  filters: {
    status: ('Passed' | 'Warning' | 'Failed')[];
    metrics: {
      [key: string]: {
        min?: number;
        max?: number;
      };
    };
    components: string[];
    search: string;
  };
}

interface NewTestState {
  name?: string;
  description?: string;
  thresholds: {
    memory: number;
    cpu: number;
    fps: number;
    renderTime: number;
    networkCalls: number;
    diskOperations: number;
  };
}

export const PerformanceProfiler: React.FC = () => {
  const theme = useTheme()()() as { theme: Theme };
  const primaryColor = typeof theme.colors.primary === 'string' 
    ? theme.colors.primary 
    : theme.colors.primary.primary;
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [results, setResults] = useState<ExtendedProfileResult[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ExtendedProfileResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);
  const [newTest, setNewTest] = useState<NewTestState>({
    thresholds: {
      memory: 100,
      cpu: 80,
      fps: 30,
      renderTime: 1000,
      networkCalls: 10,
      diskOperations: 5,
    },
  });
  const [exportModal, setExportModal] = useState<ExportModalState>({
    visible: false,
    format: 'json',
    includeTraces: true,
    includeHistory: true,
    dateRange: null,
    filters: {
      status: [],
      metrics: {},
      components: [],
      search: '',
    },
  });

  const runProfiler = async (testCase: TestCase) => {
    setIsRunning(true);
    setSelectedTest(testCase.id);

    try {
      // Simulate profiling run with additional metrics
      const profile: ExtendedProfileResult = {
        id: `${testCase.id}-${Date.now()}`,
        name: testCase.name,
        timestamp: Date.now(),
        duration: Math.random() * 2000 + 1000,
        metrics: {
          memory: Math.random() * 100,
          cpu: Math.random() * 100,
          fps: Math.random() * 60,
          renderTime: Math.random() * 1000,
          networkCalls: Math.floor(Math.random() * 20),
          diskOperations: Math.floor(Math.random() * 10),
        },
        thresholds: testCase.thresholds,
        traces: [
          {
            component: 'MainScreen',
            renderCount: Math.floor(Math.random() * 10),
            totalTime: Math.random() * 500,
            avgTime: Math.random() * 50,
          },
          {
            component: 'NavigationBar',
            renderCount: Math.floor(Math.random() * 20),
            totalTime: Math.random() * 300,
            avgTime: Math.random() * 30,
          },
          {
            component: 'DataList',
            renderCount: Math.floor(Math.random() * 50),
            totalTime: Math.random() * 800,
            avgTime: Math.random() * 40,
          },
        ],
      };

      // Add specialized metrics based on test type
      if (testCase.id === 'memory-leak') {
        profile.memoryLeak = {
          isDetected: Math.random() > 0.7,
          leakSize: Math.random() * 50,
          componentName: 'DataList',
          stackTrace: 'at DataList.render\nat ListView.renderItem',
        };
      } else if (testCase.id === 'animation') {
        profile.animation = {
          framesDropped: Math.floor(Math.random() * 10),
          jankScore: Math.random() * 100,
          averageFrameTime: Math.random() * 16 + 8,
        };
      }

      setResults(prev => [profile, ...prev]);
      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error running profiler:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateTest = () => {
    if (!newTest.name || !newTest.description) {
      Alert.alert('Error', 'Please provide a name and description for the test case');
      return;
    }

    const testCase: TestCase = {
      id: `custom-${Date.now()}`,
      name: newTest.name,
      description: newTest.description,
      thresholds: {
        memory: 100,
        cpu: 80,
        fps: 30,
        renderTime: 1000,
        networkCalls: 10,
        diskOperations: 5,
      },
    };

    setCustomTestCases(prev => [...prev, testCase]);
    setNewTest({
      name: '',
      description: '',
      thresholds: {
        memory: 100,
        cpu: 80,
        fps: 30,
        renderTime: 1000,
        networkCalls: 10,
        diskOperations: 5,
      },
    });
    setShowCreateTest(false);
  };

  const getMetricStatus = (value: number, threshold: number): 'success' | 'warning' | 'error' => {
    if (value <= threshold * 0.8) return 'success';
    if (value <= threshold) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error'): string => {
    switch (status) {
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FFCC00';
      case 'error':
        return '#FF3B30';
    }
  };

  const formatMetricValue = (value: number, metric: keyof ProfileResult['metrics']): string => {
    switch (metric) {
      case 'memory':
      case 'cpu':
        return `${value.toFixed(1)}%`;
      case 'fps':
        return `${value.toFixed(1)} FPS`;
      case 'renderTime':
        return `${value.toFixed(1)}ms`;
      case 'networkCalls':
      case 'diskOperations':
        return value.toString();
      default:
        return value.toFixed(1);
    }
  };

  const renderHistoryComparison = () => {
    if (results.length < 2) return null;

    const latest = results[0];
    const previous = results[1];
    const changes: Record<keyof ProfileResult['metrics'], number> = {
      memory: 0,
      cpu: 0,
      fps: 0,
      renderTime: 0,
      networkCalls: 0,
      diskOperations: 0,
    };

    Object.keys(latest.metrics).forEach((key) => {
      const metric = key as keyof ProfileResult['metrics'];
      changes[metric] = ((latest.metrics[metric] - previous.metrics[metric]) / previous.metrics[metric]) * 100;
    });

    return (
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Comparison with Previous Run</Text>
        <View style={styles.changesGrid}>
          {Object.entries(changes).map(([key, value]) => (
            <View key={key} style={styles.changeCard}>
              <Text style={styles.changeName}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Text style={[
                styles.changeValue,
                { color: value > 0 ? '#FF3B30' : value < 0 ? '#34C759' : primaryColor }
              ]}>
                {value > 0 ? '+' : ''}{value.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSpecializedMetrics = () => {
    if (!currentProfile) return null;

    return (
      <>
        {currentProfile.memoryLeak && (
          <View style={styles.specialSection}>
            <Text style={styles.sectionTitle}>Memory Leak Analysis</Text>
            <View style={styles.leakInfo}>
              <Text style={[
                styles.leakStatus,
                { color: currentProfile.memoryLeak.isDetected ? '#FF3B30' : '#34C759' }
              ]}>
                {currentProfile.memoryLeak.isDetected ? 'Leak Detected' : 'No Leaks Found'}
              </Text>
              {currentProfile.memoryLeak.isDetected && (
                <>
                  <Text style={styles.leakDetail}>
                    Size: {currentProfile.memoryLeak.leakSize.toFixed(1)} MB
                  </Text>
                  <Text style={styles.leakDetail}>
                    Component: {currentProfile.memoryLeak.componentName}
                  </Text>
                  <Text style={styles.leakTrace}>
                    {currentProfile.memoryLeak.stackTrace}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {currentProfile.animation && (
          <View style={styles.specialSection}>
            <Text style={styles.sectionTitle}>Animation Metrics</Text>
            <View style={styles.animationInfo}>
              <View style={styles.animationMetric}>
                <Text style={styles.metricLabel}>Frames Dropped</Text>
                <Text style={[
                  styles.metricValue,
                  { color: currentProfile.animation.framesDropped > 5 ? '#FF3B30' : '#34C759' }
                ]}>
                  {currentProfile.animation.framesDropped}
                </Text>
              </View>
              <View style={styles.animationMetric}>
                <Text style={styles.metricLabel}>Jank Score</Text>
                <Text style={[
                  styles.metricValue,
                  { color: currentProfile.animation.jankScore > 50 ? '#FF3B30' : '#34C759' }
                ]}>
                  {currentProfile.animation.jankScore.toFixed(1)}
                </Text>
              </View>
              <View style={styles.animationMetric}>
                <Text style={styles.metricLabel}>Avg Frame Time</Text>
                <Text style={[
                  styles.metricValue,
                  { color: currentProfile.animation.averageFrameTime > 16 ? '#FF3B30' : '#34C759' }
                ]}>
                  {currentProfile.animation.averageFrameTime.toFixed(1)}ms
                </Text>
              </View>
            </View>
          </View>
        )}
      </>
    );
  };

  const handleExport = async () => {
    try {
      await TestResultExporter.exportResults(results, {
        format: exportModal.format,
        includeTraces: exportModal.includeTraces,
        includeHistory: exportModal.includeHistory,
        dateRange: exportModal.dateRange || undefined,
        filters: exportModal.filters,
      });
      setExportModal(prev => ({ ...prev, visible: false }));
    } catch (error) {
      console.error('Error exporting results:', error);
      Alert.alert('Export Error', 'Failed to export test results. Please try again.');
    }
  };

  const handleStatusFilterChange = (status: 'Passed' | 'Warning' | 'Failed') => {
    setExportModal(prev => {
      const newStatuses = prev.filters.status.includes(status)
        ? prev.filters.status.filter(s => s !== status)
        : [...prev.filters.status, status];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          status: newStatuses,
        },
      };
    });
  };

  const handleMetricFilterChange = (
    metric: keyof ProfileResult['metrics'],
    type: 'min' | 'max',
    value: string
  ) => {
    const numValue = parseFloat(value);
    setExportModal(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        metrics: {
          ...prev.filters.metrics,
          [metric]: {
            ...prev.filters.metrics[metric],
            [type]: isNaN(numValue) ? undefined : numValue,
          },
        },
      },
    }));
  };

  const handleComponentFilterChange = (component: string) => {
    setExportModal(prev => {
      const newComponents = prev.filters.components.includes(component)
        ? prev.filters.components.filter(c => c !== component)
        : [...prev.filters.components, component];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          components: newComponents,
        },
      };
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Profiler</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowHistory(!showHistory)}
          >
            <IconSymbol name="history" size={20} color={primaryColor} />
            <Text style={styles.headerButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setExportModal(prev => ({ ...prev, visible: true }))}
          >
            <IconSymbol name="download" size={20} color={primaryColor} />
            <Text style={styles.headerButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateTest(true)}
          >
            <IconSymbol name="plus" size={20} color={primaryColor} />
            <Text style={styles.headerButtonText}>New Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.testCases}>
        <Text style={styles.sectionTitle}>Test Cases</Text>
        {[...ALL_TEST_CASES, ...customTestCases].map((testCase) => (
          <View key={testCase.id} style={styles.testCase}>
            <View style={styles.testHeader}>
              <View>
                <Text style={styles.testName}>{testCase.name}</Text>
                <Text style={styles.testDescription}>{testCase.description}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.runButton,
                  (isRunning && selectedTest === testCase.id) && styles.runningButton,
                ]}
                onPress={() => runProfiler(testCase)}
                disabled={isRunning}
              >
                {isRunning && selectedTest === testCase.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <IconSymbol name="play" size={16} color="#FFFFFF" />
                    <Text style={styles.runButtonText}>Run</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {currentProfile && (
        <>
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Latest Results</Text>
            <Text style={styles.timestamp}>
              {new Date(currentProfile.timestamp).toLocaleString()}
            </Text>

            <View style={styles.metricsGrid}>
              {Object.entries(currentProfile.metrics).map(([key, value]) => {
                const metric = key as keyof ProfileResult['metrics'];
                const testCase = [...ALL_TEST_CASES, ...customTestCases].find(t => t.id === selectedTest);
                const threshold = testCase?.thresholds[metric] || 0;
                const status = getMetricStatus(value, threshold);

                return (
                  <View key={key} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricName}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Text>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    </View>
                    <Text style={[styles.metricValue, { color: getStatusColor(status) }]}>
                      {formatMetricValue(value, metric)}
                    </Text>
                    <Text style={styles.metricThreshold}>
                      Threshold: {formatMetricValue(threshold, metric)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {showHistory && renderHistoryComparison()}
          {renderSpecializedMetrics()}

          <View style={styles.tracesSection}>
            <Text style={styles.sectionTitle}>Component Traces</Text>
            {currentProfile.traces.map((trace, index) => (
              <View key={index} style={styles.traceItem}>
                <Text style={styles.componentName}>{trace.component}</Text>
                <View style={styles.traceStats}>
                  <View style={styles.traceStat}>
                    <Text style={styles.traceLabel}>Renders</Text>
                    <Text style={styles.traceValue}>{trace.renderCount}</Text>
                  </View>
                  <View style={styles.traceStat}>
                    <Text style={styles.traceLabel}>Total Time</Text>
                    <Text style={styles.traceValue}>{trace.totalTime.toFixed(1)}ms</Text>
                  </View>
                  <View style={styles.traceStat}>
                    <Text style={styles.traceLabel}>Avg Time</Text>
                    <Text style={styles.traceValue}>{trace.avgTime.toFixed(1)}ms</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Modal
        visible={showCreateTest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateTest(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Test Case</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Test Name"
              value={newTest.name}
              onChangeText={(text) => setNewTest(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Test Description"
              value={newTest.description}
              onChangeText={(text) => setNewTest(prev => ({ ...prev, description: text }))}
              multiline
            />

            <Text style={styles.thresholdsTitle}>Thresholds</Text>
            {Object.entries(newTest.thresholds || {}).map(([key, value]) => (
              <View key={key} style={styles.thresholdInput}>
                <Text style={styles.thresholdLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <TextInput
                  style={styles.thresholdValue}
                  keyboardType="numeric"
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setNewTest(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        [key]: num,
                      },
                    }));
                  }}
                />
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewTest({
                  thresholds: {
                    memory: 100,
                    cpu: 80,
                    fps: 30,
                    renderTime: 1000,
                    networkCalls: 10,
                    diskOperations: 5,
                  },
                })}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateTest}
              >
                <Text style={[styles.modalButtonText, styles.createButtonText]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={exportModal.visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExportModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Test Results</Text>

            <View style={styles.exportOption}>
              <Text style={styles.exportLabel}>Format</Text>
              <View style={styles.formatButtons}>
                {(['json', 'csv', 'pdf'] as const).map((format) => (
                  <TouchableOpacity
                    key={format}
                    style={[
                      styles.formatButton,
                      exportModal.format === format && styles.selectedFormat,
                    ]}
                    onPress={() => setExportModal(prev => ({ ...prev, format }))}
                  >
                    <Text style={[
                      styles.formatButtonText,
                      exportModal.format === format && styles.selectedFormatText,
                    ]}>
                      {format.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.exportOption}>
              <Text style={styles.exportLabel}>Status Filter</Text>
              <View style={styles.filterButtons}>
                {(['Passed', 'Warning', 'Failed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      exportModal.filters.status.includes(status) && styles.selectedFilter,
                    ]}
                    onPress={() => handleStatusFilterChange(status)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      exportModal.filters.status.includes(status) && styles.selectedFilterText,
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.exportOption}>
              <Text style={styles.exportLabel}>Metric Filters</Text>
              {Object.keys(results[0]?.metrics || {}).map((metric) => (
                <View key={metric} style={styles.metricFilter}>
                  <Text style={styles.metricFilterLabel}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Text>
                  <View style={styles.metricFilterInputs}>
                    <TextInput
                      style={styles.metricFilterInput}
                      placeholder="Min"
                      keyboardType="numeric"
                      value={exportModal.filters.metrics[metric]?.min?.toString() || ''}
                      onChangeText={(value) => handleMetricFilterChange(
                        metric as keyof ProfileResult['metrics'],
                        'min',
                        value
                      )}
                    />
                    <TextInput
                      style={styles.metricFilterInput}
                      placeholder="Max"
                      keyboardType="numeric"
                      value={exportModal.filters.metrics[metric]?.max?.toString() || ''}
                      onChangeText={(value) => handleMetricFilterChange(
                        metric as keyof ProfileResult['metrics'],
                        'max',
                        value
                      )}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.exportOption}>
              <Text style={styles.exportLabel}>Component Filter</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search components..."
                value={exportModal.filters.search}
                onChangeText={(text) => setExportModal(prev => ({
                  ...prev,
                  filters: {
                    ...prev.filters,
                    search: text,
                  },
                }))}
              />
              <View style={styles.componentList}>
                {Array.from(new Set(results.flatMap(r => r.traces.map(t => t.component)))).map((component) => (
                  <TouchableOpacity
                    key={component}
                    style={[
                      styles.componentButton,
                      exportModal.filters.components.includes(component) && styles.selectedComponent,
                    ]}
                    onPress={() => handleComponentFilterChange(component)}
                  >
                    <Text style={[
                      styles.componentButtonText,
                      exportModal.filters.components.includes(component) && styles.selectedComponentText,
                    ]}>
                      {component}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setExportModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleExport}
              >
                <Text style={[styles.modalButtonText, styles.createButtonText]}>Export</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  testCases: {
    marginBottom: 24,
  },
  testCase: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  runningButton: {
    backgroundColor: 'rgba(0,122,255,0.5)',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resultSection: {
    marginBottom: 24,
  },
  timestamp: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricThreshold: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  tracesSection: {
    marginBottom: 24,
  },
  traceItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  traceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  traceStat: {
    alignItems: 'center',
  },
  traceLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 4,
  },
  traceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  historySection: {
    marginBottom: 24,
  },
  changesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  changeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  changeName: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  specialSection: {
    marginBottom: 24,
  },
  leakInfo: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  leakStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  leakDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  leakTrace: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  animationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  animationMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  thresholdsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  thresholdInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thresholdLabel: {
    flex: 1,
    fontSize: 14,
  },
  thresholdValue: {
    width: 80,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    padding: 8,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButtonText: {
    color: '#FFFFFF',
  },
  exportOption: {
    marginBottom: 16,
  },
  exportLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedFormat: {
    backgroundColor: '#007AFF',
  },
  formatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFormatText: {
    color: '#FFFFFF',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  metricFilter: {
    marginBottom: 12,
  },
  metricFilterLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricFilterInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  metricFilterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedComponent: {
    backgroundColor: '#007AFF',
  },
  componentButtonText: {
    fontSize: 14,
  },
  selectedComponentText: {
    color: '#FFFFFF',
  },
}); 