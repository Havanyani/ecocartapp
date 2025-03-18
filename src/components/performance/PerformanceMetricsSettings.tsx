import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface MetricSetting {
  id: string;
  label: string;
  description: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  category: 'collection' | 'environmental' | 'financial';
  enabled: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: string | number;
    selected: boolean;
  }>;
}

interface PerformanceMetricsSettingsProps {
  settings: MetricSetting[];
  onSettingToggle: (id: string) => void;
  onOptionSelect: (settingId: string, optionId: string) => void;
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsSettings({
  settings,
  onSettingToggle,
  onOptionSelect,
  title = 'Metrics Settings',
  subtitle,
}: PerformanceMetricsSettingsProps) {
  const getCategoryColor = (category: MetricSetting['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.settingsList}>
        {settings.map(setting => (
          <View key={setting.id} style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingInfo}>
                <IconSymbol
                  name={setting.icon}
                  size={24}
                  color={getCategoryColor(setting.category)}
                />
                <View style={styles.settingTexts}>
                  <ThemedText style={styles.settingLabel}>
                    {setting.label}
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {setting.description}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => onSettingToggle(setting.id)}
                trackColor={{ false: '#e0e0e0', true: '#a5d6a7' }}
                thumbColor={setting.enabled ? '#2e7d32' : '#fff'}
              />
            </View>

            {setting.enabled && setting.options && (
              <View style={styles.optionsList}>
                {setting.options.map(option => (
                  <HapticTab
                    key={option.id}
                    style={[
                      styles.optionButton,
                      option.selected && styles.selectedOption,
                    ]}
                    onPress={() => onOptionSelect(setting.id, option.id)}
                  >
                    <ThemedText
                      style={[
                        styles.optionLabel,
                        option.selected && styles.selectedOptionLabel,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                    {option.selected && (
                      <IconSymbol
                        name="check"
                        size={20}
                        color={getCategoryColor(setting.category)}
                      />
                    )}
                  </HapticTab>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingsList: {
    gap: 16,
  },
  settingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  settingTexts: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
}); 