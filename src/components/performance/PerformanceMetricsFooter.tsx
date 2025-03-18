import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface FooterAction {
  id: string;
  label: string;
  icon: 'download' | 'share' | 'refresh' | 'filter' | 'cog';
  onPress: () => void;
  primary?: boolean;
}

interface PerformanceMetricsFooterProps {
  actions: FooterAction[];
  lastUpdated: Date;
  onRefresh?: () => void;
}

export function PerformanceMetricsFooter({
  actions,
  lastUpdated,
  onRefresh,
}: PerformanceMetricsFooterProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.updateInfo}>
          <IconSymbol name="clock-outline" size={16} color="#666" />
          <ThemedText style={styles.updateText}>
            Last updated: {formatDate(lastUpdated)}
          </ThemedText>
          {onRefresh && (
            <HapticTab
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <IconSymbol name="refresh" size={16} color="#2e7d32" />
            </HapticTab>
          )}
        </View>

        <View style={styles.actions}>
          {actions.map(action => (
            <HapticTab
              key={action.id}
              style={[
                styles.actionButton,
                action.primary && styles.primaryAction,
              ]}
              onPress={action.onPress}
            >
              <IconSymbol
                name={action.icon}
                size={20}
                color={action.primary ? '#fff' : '#666'}
              />
              <ThemedText
                style={[
                  styles.actionLabel,
                  action.primary && styles.primaryActionLabel,
                ]}
              >
                {action.label}
              </ThemedText>
            </HapticTab>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    gap: 12,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    padding: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  primaryAction: {
    backgroundColor: '#2e7d32',
  },
  actionLabel: {
    fontSize: 14,
    color: '#666',
  },
  primaryActionLabel: {
    color: '#fff',
    fontWeight: '600',
  },
}); 