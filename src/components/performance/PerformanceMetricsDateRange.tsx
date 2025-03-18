import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

type DateRangePreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
  preset?: DateRangePreset;
}

interface PerformanceMetricsDateRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onApply?: () => void;
  presets?: DateRangePreset[];
}

export function PerformanceMetricsDateRange({
  value,
  onChange,
  onApply,
  presets = ['today', 'week', 'month', 'quarter', 'year'],
}: PerformanceMetricsDateRangeProps) {
  const [isCustomRange, setIsCustomRange] = useState(value.preset === 'custom');

  const getPresetLabel = (preset: DateRangePreset) => {
    switch (preset) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      case 'custom': return 'Custom Range';
      default: return '';
    }
  };

  const getPresetRange = (preset: DateRangePreset): DateRange => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        end.setMonth(quarter * 3 + 3, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(12, 0);
        break;
    }

    return { start, end, preset };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Date Range</ThemedText>
        <ThemedText style={styles.selectedRange}>
          {formatDate(value.start)} - {formatDate(value.end)}
        </ThemedText>
      </View>

      <View style={styles.presets}>
        {presets.map(preset => (
          <HapticTab
            key={preset}
            style={[
              styles.presetButton,
              value.preset === preset && styles.activePreset,
            ]}
            onPress={() => {
              setIsCustomRange(preset === 'custom');
              onChange(getPresetRange(preset));
            }}
          >
            <ThemedText
              style={[
                styles.presetLabel,
                value.preset === preset && styles.activePresetLabel,
              ]}
            >
              {getPresetLabel(preset)}
            </ThemedText>
          </HapticTab>
        ))}
      </View>

      {isCustomRange && (
        <View style={styles.customRange}>
          {/* Custom date picker implementation would go here */}
        </View>
      )}

      {onApply && (
        <HapticTab style={styles.applyButton} onPress={onApply}>
          <IconSymbol name="check" size={20} color="#fff" />
          <ThemedText style={styles.applyText}>Apply Range</ThemedText>
        </HapticTab>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedRange: {
    fontSize: 14,
    color: '#666',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  activePreset: {
    backgroundColor: '#e8f5e9',
  },
  presetLabel: {
    fontSize: 14,
    color: '#666',
  },
  activePresetLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  customRange: {
    marginBottom: 16,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 