import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

export interface SettingsOption {
  id: string;
  label: string;
  description: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  value: boolean;
}

interface PerformanceSettingsProps {
  settings: SettingsOption[];
  onToggle: (id: string, value: boolean) => void;
}

export function PerformanceSettings({ settings, onToggle }: PerformanceSettingsProps) {
  const theme = useTheme()()();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ThemedText style={styles.title}>Performance Settings</ThemedText>

      {settings.map((setting) => (
        <View key={setting.id} style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View style={styles.settingHeader}>
              <IconSymbol name={setting.icon} size={20} color={theme.colors.text} />
              <ThemedText variant="body" style={styles.settingLabel}>
                {setting.label}
              </ThemedText>
            </View>
            <ThemedText
              variant="body-sm"
              style={[styles.settingDescription, { color: theme.colors.textSecondary }]}
            >
              {setting.description}
            </ThemedText>
          </View>
          <Switch
            value={setting.value}
            onValueChange={(value) => onToggle(setting.id, value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingLabel: {
    marginLeft: 8,
  },
  settingDescription: {
    marginTop: 2,
  },
}); 