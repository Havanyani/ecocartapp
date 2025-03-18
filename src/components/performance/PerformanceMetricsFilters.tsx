import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface FilterOption {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: 'collection' | 'environmental' | 'financial';
  options: Array<{
    id: string;
    label: string;
    value: string | number;
    count?: number;
  }>;
  multiSelect?: boolean;
}

interface PerformanceMetricsFiltersProps {
  filters: FilterOption[];
  selectedFilters: { [key: string]: string[] };
  onFilterChange: (filterId: string, values: string[]) => void;
  title?: string;
  subtitle?: string;
}

export function PerformanceMetricsFilters({
  filters,
  selectedFilters,
  onFilterChange,
  title = 'Filter Metrics',
  subtitle,
}: PerformanceMetricsFiltersProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const getCategoryColor = (category: FilterOption['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const handleOptionPress = (filterId: string, optionId: string) => {
    const currentSelected = selectedFilters[filterId] || [];
    const filter = filters.find(f => f.id === filterId);

    if (filter?.multiSelect) {
      const newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter(id => id !== optionId)
        : [...currentSelected, optionId];
      onFilterChange(filterId, newSelected);
    } else {
      onFilterChange(filterId, [optionId]);
    }
  };

  const getSelectedCount = (filterId: string) => {
    const count = selectedFilters[filterId]?.length || 0;
    return count > 0 ? `${count} selected` : 'All';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>

      <View style={styles.filtersList}>
        {filters.map(filter => (
          <View key={filter.id} style={styles.filterSection}>
            <HapticTab
              style={styles.filterHeader}
              onPress={() => setExpandedFilter(
                expandedFilter === filter.id ? null : filter.id
              )}
            >
              <View style={styles.filterInfo}>
                <IconSymbol
                  name={filter.icon}
                  size={20}
                  color={getCategoryColor(filter.category)}
                />
                <ThemedText style={styles.filterLabel}>{filter.label}</ThemedText>
              </View>
              <View style={styles.filterStatus}>
                <ThemedText style={styles.selectedCount}>
                  {getSelectedCount(filter.id)}
                </ThemedText>
                <IconSymbol
                  name={expandedFilter === filter.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
            </HapticTab>

            {expandedFilter === filter.id && (
              <View style={styles.optionsList}>
                {filter.options.map(option => {
                  const isSelected = selectedFilters[filter.id]?.includes(option.id);
                  return (
                    <HapticTab
                      key={option.id}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                      ]}
                      onPress={() => handleOptionPress(filter.id, option.id)}
                    >
                      <ThemedText
                        style={[
                          styles.optionLabel,
                          isSelected && styles.selectedOptionLabel,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                      {option.count !== undefined && (
                        <View
                          style={[
                            styles.countBadge,
                            isSelected && styles.selectedCountBadge,
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.countText,
                              isSelected && styles.selectedCountText,
                            ]}
                          >
                            {option.count}
                          </ThemedText>
                        </View>
                      )}
                    </HapticTab>
                  );
                })}
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
  filtersList: {
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  optionsList: {
    gap: 8,
    paddingHorizontal: 8,
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  selectedCountBadge: {
    backgroundColor: '#2e7d32',
  },
  countText: {
    fontSize: 12,
    color: '#666',
  },
  selectedCountText: {
    color: '#fff',
  },
}); 