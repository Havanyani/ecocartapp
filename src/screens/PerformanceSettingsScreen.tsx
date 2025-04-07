import {
    HapticTab,
    ThemedText,
    ThemedView
} from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  threshold?: number;
  unit?: string;
}

interface NotificationSetting {
  id: string;
  type: 'alert' | 'report' | 'threshold';
  frequency: 'immediate' | 'daily' | 'weekly';
  isEnabled: boolean;
}

export function PerformanceSettingsScreen() {
  const navigation = useNavigation();
  const theme = useTheme()()();
  const { 
    metrics,
    updateMetric,
    notificationSettings,
    updateNotificationSetting 
  } = usePerformanceSettings();
  const { requestNotificationPermission } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<'metrics' | 'notifications'>('metrics');

  const handleMetricToggle = useCallback(async (metric: PerformanceMetric) => {
    if (!metric.isEnabled && Platform.OS !== 'web') {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Notifications Required',
          'Please enable notifications to track this metric.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    updateMetric(metric.id, { isEnabled: !metric.isEnabled });
  }, [updateMetric, requestNotificationPermission]);

  const handleNotificationToggle = useCallback((setting: NotificationSetting) => {
    updateNotificationSetting(setting.id, { isEnabled: !setting.isEnabled });
  }, [updateNotificationSetting]);

  return (
    <SafeAreaView style={styles.container}>
      <HapticTab
        tabs={[
          { key: 'metrics', label: 'Metrics' },
          { key: 'notifications', label: 'Notifications' }
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab as (tab: string) => void}
      />

      <ScrollView style={styles.content}>
        {selectedTab === 'metrics' ? (
          metrics.map(metric => (
            <ThemedView key={metric.id} style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>{metric.name}</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  {metric.description}
                </ThemedText>
                {metric.threshold && (
                  <ThemedText style={styles.thresholdText}>
                    Threshold: {metric.threshold} {metric.unit}
                  </ThemedText>
                )}
              </View>
              <Switch
                value={metric.isEnabled}
                onValueChange={() => handleMetricToggle(metric)}
                accessibilityLabel={`Toggle ${metric.name}`}
                testID={`metric-toggle-${metric.id}`}
              />
            </ThemedView>
          ))
        ) : (
          notificationSettings.map(setting => (
            <ThemedView key={setting.id} style={styles.settingItem}>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>
                  {setting.type.charAt(0).toUpperCase() + setting.type.slice(1)} Notifications
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Frequency: {setting.frequency}
                </ThemedText>
              </View>
              <Switch
                value={setting.isEnabled}
                onValueChange={() => handleNotificationToggle(setting)}
                accessibilityLabel={`Toggle ${setting.type} notifications`}
                testID={`notification-toggle-${setting.id}`}
              />
            </ThemedView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  thresholdText: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  }
}); 