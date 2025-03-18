import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ToolbarAction {
  id: string;
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  onPress: () => void;
  primary?: boolean;
  badge?: number;
}

interface PerformanceMetricsToolbarProps {
  title?: string;
  subtitle?: string;
  actions: ToolbarAction[];
  onSearch?: (query: string) => void;
}

export function PerformanceMetricsToolbar({
  title = 'Performance Metrics',
  subtitle,
  actions = [],
  onSearch,
}: PerformanceMetricsToolbarProps) {
  const primaryActions = actions.filter(action => action.primary);
  const secondaryActions = actions.filter(action => !action.primary);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>

        <View style={styles.primaryActions}>
          {primaryActions.map(action => (
            <HapticTab
              key={action.id}
              style={styles.primaryButton}
              onPress={action.onPress}
            >
              <IconSymbol name={action.icon} size={20} color="#fff" />
              <ThemedText style={styles.primaryButtonText}>
                {action.label}
              </ThemedText>
              {action.badge !== undefined && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {action.badge}
                  </ThemedText>
                </View>
              )}
            </HapticTab>
          ))}
        </View>
      </View>

      <View style={styles.toolbar}>
        {onSearch && (
          <HapticTab style={styles.searchButton} onPress={() => onSearch('')}>
            <IconSymbol name="image" size={20} color="#666" />
            <ThemedText style={styles.searchPlaceholder}>
              Search metrics...
            </ThemedText>
          </HapticTab>
        )}

        <View style={styles.secondaryActions}>
          {secondaryActions.map(action => (
            <HapticTab
              key={action.id}
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <IconSymbol name={action.icon} size={20} color="#666" />
              {action.badge !== undefined && (
                <View style={styles.smallBadge}>
                  <ThemedText style={styles.smallBadgeText}>
                    {action.badge}
                  </ThemedText>
                </View>
              )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
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
  primaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  smallBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
}); 