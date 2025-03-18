import { ThemedText } from '@/components/ui/ThemedText';
import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ActionItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  onPress: () => void;
  category?: 'export' | 'share' | 'settings' | 'filter';
  disabled?: boolean;
  loading?: boolean;
}

interface PerformanceMetricsActionsProps {
  actions: ActionItem[];
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsActions({
  actions,
  title = 'Actions',
  subtitle,
}: PerformanceMetricsActionsProps) {
  const getCategoryColor = (category?: ActionItem['category']) => {
    switch (category) {
      case 'export': return '#2e7d32';
      case 'share': return '#1976d2';
      case 'settings': return '#ed6c02';
      case 'filter': return '#9c27b0';
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

      <View style={styles.actionsList}>
        {actions.map(action => (
          <HapticTab
            key={action.id}
            style={[
              styles.actionButton,
              action.disabled && styles.disabledAction,
            ]}
            onPress={action.onPress}
            disabled={action.disabled || action.loading}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionIcon}>
                <IconSymbol
                  name={action.icon}
                  size={24}
                  color={getCategoryColor(action.category)}
                  style={action.disabled && styles.disabledIcon}
                />
              </View>
              <View style={styles.actionTexts}>
                <ThemedText
                  style={[
                    styles.actionLabel,
                    action.disabled && styles.disabledText,
                  ]}
                >
                  {action.label}
                </ThemedText>
                {action.description && (
                  <ThemedText
                    style={[
                      styles.actionDescription,
                      action.disabled && styles.disabledText,
                    ]}
                  >
                    {action.description}
                  </ThemedText>
                )}
              </View>
              {!action.loading && (
                <IconSymbol
                  name="chevron-right"
                  size={20}
                  color="#666"
                  style={action.disabled && styles.disabledIcon}
                />
              )}
              {action.loading && (
                <View style={styles.loadingIndicator} />
              )}
            </View>
          </HapticTab>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsList: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTexts: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  disabledAction: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  disabledIcon: {
    opacity: 0.5,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderTopColor: 'transparent',
    alignSelf: 'center',
  },
}); 