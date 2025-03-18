import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PerformanceSettings, type SettingsOption } from '../../../src/components/performance/PerformanceSettings';
import { ThemedText } from '../../../src/components/ui/ThemedText';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { performanceSettingsStore } from '../../../src/stores/PerformanceSettingsStore';

const thresholdSettings = [
  {
    id: 'latency',
    label: 'Latency',
    description: 'Maximum acceptable response time in milliseconds',
    icon: 'timer' as const,
    suffix: 'ms',
  },
  {
    id: 'compression',
    label: 'Compression Ratio',
    description: 'Target data compression ratio (0-1)',
    icon: 'archive' as const,
    suffix: '',
  },
  {
    id: 'batchSize',
    label: 'Batch Size',
    description: 'Number of items to process in each batch',
    icon: 'database' as const,
    suffix: '',
  },
  {
    id: 'errorRate',
    label: 'Error Rate',
    description: 'Maximum acceptable error rate percentage',
    icon: 'alert-circle' as const,
    suffix: '%',
  },
  {
    id: 'memoryUsage',
    label: 'Memory Usage',
    description: 'Maximum memory usage percentage',
    icon: 'memory' as const,
    suffix: '%',
  },
  {
    id: 'cpuUsage',
    label: 'CPU Usage',
    description: 'Maximum CPU usage percentage',
    icon: 'chip' as const,
    suffix: '%',
  },
  {
    id: 'networkBandwidth',
    label: 'Network Bandwidth',
    description: 'Minimum required bandwidth in Kbps',
    icon: 'wifi' as const,
    suffix: 'Kbps',
  },
];

const generalSettings: SettingsOption[] = [
  {
    id: 'alertsEnabled',
    label: 'Enable Alerts',
    description: 'Show notifications for performance issues',
    icon: 'bell' as const,
    value: false,
  },
  {
    id: 'persistMetrics',
    label: 'Persist Metrics',
    description: 'Save performance data between sessions',
    icon: 'content-save' as const,
    value: false,
  },
  {
    id: 'autoOptimize',
    label: 'Auto-Optimize',
    description: 'Automatically adjust settings for optimal performance',
    icon: 'flash' as const,
    value: false,
  },
  {
    id: 'debugMode',
    label: 'Debug Mode',
    description: 'Enable detailed performance logging',
    icon: 'bug' as const,
    value: false,
  },
];

const notificationSettings: SettingsOption[] = [
  {
    id: 'email',
    label: 'Email Notifications',
    description: 'Receive performance alerts via email',
    icon: 'email' as const,
    value: false,
  },
  {
    id: 'push',
    label: 'Push Notifications',
    description: 'Receive push notifications on your device',
    icon: 'bell-ring' as const,
    value: false,
  },
  {
    id: 'inApp',
    label: 'In-App Notifications',
    description: 'Show alerts within the app',
    icon: 'application' as const,
    value: false,
  },
];

export default observer(function PerformanceSettingsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const handleThresholdChange = useCallback((key: keyof typeof performanceSettingsStore.thresholds, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      performanceSettingsStore.setThreshold(key, numValue);
    }
  }, []);

  const handleToggleSetting = useCallback((key: string, value: boolean) => {
    switch (key) {
      case 'alertsEnabled':
        performanceSettingsStore.setAlertsEnabled(value);
        break;
      case 'persistMetrics':
        performanceSettingsStore.setPersistMetrics(value);
        break;
      case 'autoOptimize':
        performanceSettingsStore.setAutoOptimize(value);
        break;
      case 'debugMode':
        performanceSettingsStore.setDebugMode(value);
        break;
      case 'email':
      case 'push':
      case 'inApp':
        performanceSettingsStore.setNotificationChannel(key, value);
        break;
    }
  }, []);

  // Sample data for visualization
  const chartData = {
    labels: ['CPU', 'Memory', 'Network', 'Latency'],
    datasets: [{
      data: [
        performanceSettingsStore.thresholds.cpuUsage,
        performanceSettingsStore.thresholds.memoryUsage,
        performanceSettingsStore.thresholds.networkBandwidth / 10, // Scaled for visualization
        performanceSettingsStore.thresholds.latency / 10, // Scaled for visualization
      ],
    }],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="h1">Performance Settings</ThemedText>
          <ThemedText variant="body" style={{ color: theme.colors.textSecondary }}>
            Configure performance monitoring thresholds and alerts
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Current Thresholds</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <LineChart
              data={chartData}
              width={width - 48}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary + opacity.toString(16).padStart(2, '0'),
                labelColor: () => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Alert Thresholds</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {thresholdSettings.map(setting => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <ThemedText variant="body">{setting.label}</ThemedText>
                  <ThemedText
                    variant="body-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {setting.description}
                  </ThemedText>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={performanceSettingsStore.thresholds[setting.id as keyof typeof performanceSettingsStore.thresholds].toString()}
                    onChangeText={(value) =>
                      handleThresholdChange(
                        setting.id as keyof typeof performanceSettingsStore.thresholds,
                        value
                      )
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  {setting.suffix && (
                    <ThemedText
                      variant="body-sm"
                      style={{ color: theme.colors.textSecondary, marginLeft: 8 }}
                    >
                      {setting.suffix}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">General Settings</ThemedText>
          <PerformanceSettings
            settings={generalSettings.map(setting => ({
              ...setting,
              value:
                setting.id === 'alertsEnabled'
                  ? performanceSettingsStore.alertsEnabled
                  : setting.id === 'persistMetrics'
                  ? performanceSettingsStore.persistMetrics
                  : setting.id === 'autoOptimize'
                  ? performanceSettingsStore.autoOptimize
                  : performanceSettingsStore.debugMode,
            }))}
            onToggle={handleToggleSetting}
          />
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Notification Channels</ThemedText>
          <PerformanceSettings
            settings={notificationSettings.map(setting => ({
              ...setting,
              value: performanceSettingsStore.notificationChannels[setting.id as keyof typeof performanceSettingsStore.notificationChannels],
            }))}
            onToggle={handleToggleSetting}
          />
        </View>

        <View style={styles.section}>
          <ThemedText variant="h2">Data Retention</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText variant="body">Retention Period</ThemedText>
                <ThemedText
                  variant="body-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Number of days to keep performance data
                </ThemedText>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={performanceSettingsStore.retentionDays.toString()}
                  onChangeText={(value) => {
                    const days = parseInt(value);
                    if (!isNaN(days)) {
                      performanceSettingsStore.setRetentionDays(days);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="7"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <ThemedText
                  variant="body-sm"
                  style={{ color: theme.colors.textSecondary, marginLeft: 8 }}
                >
                  days
                </ThemedText>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText variant="body">Sampling Rate</ThemedText>
                <ThemedText
                  variant="body-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Interval between performance measurements (ms)
                </ThemedText>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={performanceSettingsStore.samplingRate.toString()}
                  onChangeText={(value) => {
                    const rate = parseInt(value);
                    if (!isNaN(rate)) {
                      performanceSettingsStore.setSamplingRate(rate);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="1000"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <ThemedText
                  variant="body-sm"
                  style={{ color: theme.colors.textSecondary, marginLeft: 8 }}
                >
                  ms
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
}); 