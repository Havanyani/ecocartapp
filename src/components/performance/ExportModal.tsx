import { ExportModalState } from '@/types/AdvancedAnalytics';
import { Metrics } from '@/types/Performance';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/ExportModal.styles';

interface ExportModalProps {
  visible: boolean;
  metrics: Array<keyof Metrics>;
  state: ExportModalState;
  onStateChange: (state: Partial<ExportModalState>) => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  metrics,
  state,
  onStateChange,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Export Performance Data
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Format</Text>
          <View style={styles.formatSelector}>
            {(['json', 'csv'] as const).map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.formatButton,
                  state.format === format && styles.formatButtonActive,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => onStateChange({ format })}
                accessible
                accessibilityState={{ selected: state.format === format }}
                accessibilityLabel={`${format.toUpperCase()} format`}
              >
                <Text
                  style={[
                    styles.formatButtonText,
                    state.format === format && styles.formatButtonTextActive,
                    { color: state.format === format ? colors.background : colors.text },
                  ]}
                >
                  {format.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Metrics</Text>
          <View style={styles.metricSelector}>
            {metrics.map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.metricButton,
                  state.selectedMetrics.includes(metric) && styles.metricButtonActive,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => {
                  const selectedMetrics = state.selectedMetrics.includes(metric)
                    ? state.selectedMetrics.filter((m) => m !== metric)
                    : [...state.selectedMetrics, metric];
                  onStateChange({ selectedMetrics });
                }}
                accessible
                accessibilityState={{ selected: state.selectedMetrics.includes(metric) }}
                accessibilityLabel={`${metric} metric`}
              >
                <Text
                  style={[
                    styles.metricButtonText,
                    state.selectedMetrics.includes(metric) && styles.metricButtonTextActive,
                    { color: state.selectedMetrics.includes(metric) ? colors.background : colors.text },
                  ]}
                >
                  {metric}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => onStateChange({ includeInsights: !state.includeInsights })}
            accessible
            accessibilityState={{ checked: state.includeInsights }}
            accessibilityLabel="Include insights in export"
          >
            <Text style={[styles.optionButtonText, { color: colors.text }]}>
              Include Insights
            </Text>
            <View
              style={[
                styles.checkbox,
                state.includeInsights && styles.checkboxChecked,
                { borderColor: colors.primary },
                state.includeInsights && { backgroundColor: colors.primary },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => onStateChange({ includeCharts: !state.includeCharts })}
            accessible
            accessibilityState={{ checked: state.includeCharts }}
            accessibilityLabel="Include charts in export"
          >
            <Text style={[styles.optionButtonText, { color: colors.text }]}>
              Include Charts
            </Text>
            <View
              style={[
                styles.checkbox,
                state.includeCharts && styles.checkboxChecked,
                { borderColor: colors.primary },
                state.includeCharts && { backgroundColor: colors.primary },
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.border }]}
            onPress={onClose}
            accessible
            accessibilityLabel="Cancel export"
            accessibilityHint="Close the export dialog"
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            accessible
            accessibilityLabel="Export data"
            accessibilityHint="Start the export process"
          >
            <Text style={[styles.actionButtonText, { color: colors.background }]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 