import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface RankingItem {
  id: string;
  rank: number;
  label: string;
  value: number;
  previousRank: number;
  unit: string;
  icon: 'package-variant' | 'weight' | 'recycle' | 'credit-card-outline' | 'leaf';
  category: 'collection' | 'environmental' | 'financial';
}

interface PerformanceMetricsRankingProps {
  items: RankingItem[];
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  onItemPress?: (id: string) => void;
}

export function PerformanceMetricsRanking({
  items,
  timeframe,
  onItemPress,
}: PerformanceMetricsRankingProps) {
  const slideAnims = useRef(items.map(() => new Animated.Value(-50))).current;
  const fadeAnims = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = items.map((_, index) =>
      Animated.parallel([
        Animated.spring(slideAnims[index], {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(100, animations).start();
  }, [items]);

  const getCategoryColor = (category: RankingItem['category']) => {
    switch (category) {
      case 'collection': return '#2e7d32';
      case 'environmental': return '#00796b';
      case 'financial': return '#1976d2';
      default: return '#666';
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change === 0) return null;
    return {
      direction: change > 0 ? 'up' : 'down',
      value: Math.abs(change),
    };
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          <IconSymbol name="podium" size={24} color="#2e7d32" />
          Performance Rankings
        </ThemedText>
        <ThemedText style={styles.timeframe}>
          This {timeframe}
        </ThemedText>
      </View>

      <View style={styles.rankingList}>
        {items.map((item, index) => {
          const rankChange = getRankChange(item.rank, item.previousRank);
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.rankingItem,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateX: slideAnims[index] }],
                },
              ]}
            >
              <HapticTab
                style={styles.itemContent}
                onPress={() => onItemPress?.(item.id)}
              >
                <View style={styles.rankSection}>
                  <ThemedText style={styles.rankNumber}>#{item.rank}</ThemedText>
                  {rankChange && (
                    <IconSymbol
                      name={rankChange.direction === 'up' ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={rankChange.direction === 'up' ? '#2e7d32' : '#d32f2f'}
                    />
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <IconSymbol
                      name={item.icon}
                      size={20}
                      color={getCategoryColor(item.category)}
                    />
                    <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                  </View>

                  <ThemedText style={styles.itemValue}>
                    {item.value.toLocaleString()}
                    <ThemedText style={styles.unitText}>{item.unit}</ThemedText>
                  </ThemedText>
                </View>

                <IconSymbol name="chevron-right" size={20} color="#666" />
              </HapticTab>
            </Animated.View>
          );
        })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeframe: {
    fontSize: 14,
    color: '#666',
  },
  rankingList: {
    gap: 8,
  },
  rankingItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#666',
    marginLeft: 2,
  },
}); 