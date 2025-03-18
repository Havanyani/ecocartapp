import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface PerformanceMetricsFilterProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onApply: () => void;
  onReset: () => void;
}

export function PerformanceMetricsFilter({
  options,
  selectedFilters,
  onFilterChange,
  onApply,
  onReset,
}: PerformanceMetricsFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isExpanded ? 0 : -300,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    onFilterChange(newFilters);
  };

  return (
    <ThemedView style={styles.container}>
      <HapticTab 
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <IconSymbol name="filter-variant" size={20} color="#2e7d32" />
        <ThemedText style={styles.toggleText}>
          Filters ({selectedFilters.length})
        </ThemedText>
      </HapticTab>

      <Animated.View
        style={[
          styles.filterContent,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.filterOptions}>
          {options.map(option => (
            <HapticTab
              key={option.id}
              style={[
                styles.filterOption,
                selectedFilters.includes(option.id) && styles.selectedOption,
              ]}
              onPress={() => toggleFilter(option.id)}
            >
              <IconSymbol
                name={option.icon}
                size={20}
                color={selectedFilters.includes(option.id) ? '#fff' : '#666'}
              />
              <ThemedText
                style={[
                  styles.filterLabel,
                  selectedFilters.includes(option.id) && styles.selectedLabel,
                ]}
              >
                {option.label}
              </ThemedText>
            </HapticTab>
          ))}
        </View>

        <View style={styles.actions}>
          <HapticTab style={styles.resetButton} onPress={onReset}>
            <IconSymbol name="refresh" size={20} color="#666" />
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </HapticTab>

          <HapticTab style={styles.applyButton} onPress={onApply}>
            <IconSymbol name="check" size={20} color="#fff" />
            <ThemedText style={styles.applyText}>Apply Filters</ThemedText>
          </HapticTab>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  filterContent: {
    padding: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  selectedOption: {
    backgroundColor: '#2e7d32',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedLabel: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  resetText: {
    fontSize: 14,
    color: '#666',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    gap: 4,
  },
  applyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
}); 