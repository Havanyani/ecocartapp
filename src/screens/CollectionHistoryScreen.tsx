import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { WeightTracker } from '@/components/WeightTracker';
import { useCollections } from '@/hooks/useCollections';
import { useTheme } from '@/hooks/useTheme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Collection {
  id: string;
  date: string;
  weight: number;
  credits: number;
  status: 'completed' | 'pending' | 'cancelled';
  impact: {
    plasticSaved: number;
    co2Reduced: number;
    treesEquivalent: number;
  };
}

interface FilterButton {
  id: string;
  label: string;
  value: Collection['status'] | 'all';
}

const filterButtons: FilterButton[] = [
  { id: 'all', label: 'All Collections', value: 'all' },
  { id: 'completed', label: 'Completed', value: 'completed' },
  { id: 'pending', label: 'Pending', value: 'pending' },
];

export function CollectionHistoryScreen() {
  const { theme } = useTheme();
  const { collections, isLoading, error, fetchCollections } = useCollections();
  const [selectedFilter, setSelectedFilter] = useState<FilterButton['value']>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCollections();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh collections');
    } finally {
      setRefreshing(false);
    }
  }, [fetchCollections]);

  const getStatusColor = (status: Collection['status']): string => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const filteredCollections = collections.filter(collection =>
    selectedFilter === 'all' ? true : collection.status === selectedFilter
  );

  const totalWeight = collections
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.weight, 0);

  const totalCredits = collections
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.credits, 0);

  const renderCollection = useCallback(({ item: collection }: { item: Collection }) => (
    <ThemedView 
      style={styles.collectionCard}
      testID={`collection-${collection.id}`}
    >
      <View style={styles.cardHeader}>
        <ThemedText style={styles.dateText}>
          {new Date(collection.date).toLocaleDateString()}
        </ThemedText>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(collection.status) }
        ]}>
          <ThemedText style={styles.statusText}>
            {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.weightSection}>
        <IconSymbol name="scale" size={20} color={theme.colors.primary} />
        <ThemedText style={styles.weightText}>
          {collection.weight} kg
        </ThemedText>
      </View>

      <View style={styles.creditsSection}>
        <IconSymbol name="credit-card" size={20} color={theme.colors.primary} />
        <ThemedText style={styles.creditsText}>
          {collection.credits} credits earned
        </ThemedText>
      </View>

      {collection.status === 'completed' && (
        <View style={styles.impactSection}>
          <ThemedText style={styles.impactTitle}>Environmental Impact</ThemedText>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <IconSymbol name="recycle" size={20} color={theme.colors.success} />
              <ThemedText>{collection.impact.plasticSaved}kg plastic saved</ThemedText>
            </View>
            <View style={styles.impactItem}>
              <IconSymbol name="cloud" size={20} color={theme.colors.info} />
              <ThemedText>{collection.impact.co2Reduced}kg CO₂ reduced</ThemedText>
            </View>
            <View style={styles.impactItem}>
              <IconSymbol name="tree" size={20} color={theme.colors.success} />
              <ThemedText>{collection.impact.treesEquivalent} trees equivalent</ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  ), [theme.colors]);

  return (
    <SafeAreaView style={styles.container}>
      <WeightTracker
        currentWeight={totalWeight}
        credits={totalCredits}
        style={styles.tracker}
        testID="weight-tracker"
        history={collections.map(c => ({ date: c.date, weight: c.weight }))}
        weeklyData={collections.slice(-7).map(c => c.weight)}
      />

      <View style={styles.filterContainer}>
        {filterButtons.map(button => (
          <HapticTab
            key={button.id}
            active={selectedFilter === button.value}
            onPress={() => setSelectedFilter(button.value)}
            style={styles.filterButton}
            testID={`filter-${button.id}`}
          >
            <ThemedText>{button.label}</ThemedText>
          </HapticTab>
        ))}
      </View>

      <FlatList
        data={filteredCollections}
        renderItem={renderCollection}
        keyExtractor={collection => collection.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        testID="collections-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tracker: {
    margin: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listContent: {
    padding: 16,
  },
  collectionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  weightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  weightText: {
    fontSize: 18,
    fontWeight: '600',
  },
  creditsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  creditsText: {
    fontSize: 16,
  },
  impactSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  impactGrid: {
    gap: 8,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 