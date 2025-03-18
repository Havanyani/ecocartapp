import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type TimeRange = 'day' | 'week' | 'month' | 'year';
type ViewMode = 'chart' | 'table' | 'grid';

interface HeaderAction {
  id: string;
  icon: 'filter' | 'download' | 'share' | 'cog';
  onPress: () => void;
}

interface PerformanceMetricsHeaderProps {
  title: string;
  subtitle?: string;
  timeRange: TimeRange;
  viewMode: ViewMode;
  onTimeRangeChange: (range: TimeRange) => void;
  onViewModeChange: (mode: ViewMode) => void;
  actions?: HeaderAction[];
}

export function PerformanceMetricsHeader({
  title,
  subtitle,
  timeRange,
  viewMode,
  onTimeRangeChange,
  onViewModeChange,
  actions = [],
}: PerformanceMetricsHeaderProps) {
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const viewModeOptions = [
    { value: 'chart', icon: 'chart-areaspline' },
    { value: 'table', icon: 'table-large' },
    { value: 'grid', icon: 'grid' },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.titleSection}>
        <View>
          <ThemedText style={styles.title}>
            <IconSymbol name="chart-box" size={24} color="#2e7d32" />
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
        <View style={styles.actions}>
          {actions.map(action => (
            <HapticTab
              key={action.id}
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <IconSymbol name={action.icon} size={20} color="#666" />
            </HapticTab>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.timeRangeSection}>
          {timeRangeOptions.map(option => (
            <HapticTab
              key={option.value}
              style={[
                styles.timeRangeButton,
                timeRange === option.value && styles.activeTimeRange,
              ]}
              onPress={() => onTimeRangeChange(option.value)}
            >
              <ThemedText
                style={[
                  styles.timeRangeLabel,
                  timeRange === option.value && styles.activeTimeRangeLabel,
                ]}
              >
                {option.label}
              </ThemedText>
            </HapticTab>
          ))}
        </View>

        <View style={styles.viewModeSection}>
          {viewModeOptions.map(option => (
            <HapticTab
              key={option.value}
              style={[
                styles.viewModeButton,
                viewMode === option.value && styles.activeViewMode,
              ]}
              onPress={() => onViewModeChange(option.value)}
            >
              <IconSymbol
                name={option.icon}
                size={20}
                color={viewMode === option.value ? '#2e7d32' : '#666'}
              />
            </HapticTab>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRangeSection: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  activeTimeRange: {
    backgroundColor: '#e8f5e9',
  },
  timeRangeLabel: {
    fontSize: 14,
    color: '#666',
  },
  activeTimeRangeLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  viewModeSection: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  activeViewMode: {
    backgroundColor: '#e8f5e9',
  },
}); 