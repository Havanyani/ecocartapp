import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useDeliveryNotifications } from '@/hooks/useDeliveryNotifications';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface NotificationPreferencesProps {
  personnelId: string;
}

export function NotificationPreferences({ personnelId }: NotificationPreferencesProps) {
  const theme = useTheme()()();
  const { preferences, togglePreference } = useDeliveryNotifications(personnelId);

  const preferenceItems = [
    {
      key: 'deliveryStatusUpdates',
      title: 'Delivery Status Updates',
      description: 'Get notified when delivery status changes',
      icon: 'truck-delivery',
    },
    {
      key: 'locationUpdates',
      title: 'Location Updates',
      description: 'Get notified when delivery personnel location changes',
      icon: 'map-marker',
    },
    {
      key: 'routeChanges',
      title: 'Route Changes',
      description: 'Get notified when delivery route is modified',
      icon: 'route',
    },
    {
      key: 'collectionUpdates',
      title: 'Collection Updates',
      description: 'Get notified about collection progress',
      icon: 'recycle',
    },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Notification Preferences</ThemedText>
      <ThemedText style={styles.subtitle}>
        Choose which notifications you want to receive
      </ThemedText>

      <View style={styles.preferencesList}>
        {preferenceItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.preferenceItem}
            onPress={() => togglePreference(item.key)}
          >
            <View style={styles.preferenceContent}>
              <IconSymbol
                name={item.icon}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.preferenceText}>
                <ThemedText style={styles.preferenceTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.preferenceDescription}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={preferences[item.key]}
              onValueChange={() => togglePreference(item.key)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.background}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
  },
  preferencesList: {
    gap: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 