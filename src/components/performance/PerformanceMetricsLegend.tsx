import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface LegendItem {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: 'recycle' | 'leaf' | 'truck' | 'package' | 'account-group' | 'earth';
  unit?: string;
  isActive?: boolean;
}

interface PerformanceMetricsLegendProps {
  items: LegendItem[];
  title?: string;
  onItemPress?: (id: string) => void;
}

export function PerformanceMetricsLegend({
  items,
  title = 'Legend',
  onItemPress,
}: PerformanceMetricsLegendProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [items]);

  return (
    <ThemedView style={styles.container}>
      {title && (
        <ThemedText style={styles.title}>
          <IconSymbol name="information" size={20} color="#2e7d32" />
          {title}
        </ThemedText>
      )}

      <View style={styles.legendGrid}>
        {items.map(item => (
          <Animated.View
            key={item.id}
            style={[
              styles.legendItem,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                borderColor: item.isActive ? item.color : 'transparent',
              },
            ]}
          >
            <HapticTab
              style={styles.legendContent}
              onPress={() => onItemPress?.(item.id)}
            >
              <View style={styles.itemHeader}>
                <IconSymbol
                  name={item.icon}
                  size={20}
                  color={item.color}
                />
                <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
              </View>

              <ThemedText style={[styles.itemValue, { color: item.color }]}>
                {item.value}
                {item.unit && (
                  <ThemedText style={styles.itemUnit}>{item.unit}</ThemedText>
                )}
              </ThemedText>
            </HapticTab>
          </Animated.View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
  },
  legendContent: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
  },
  itemValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#666',
    marginLeft: 2,
  },
}); 