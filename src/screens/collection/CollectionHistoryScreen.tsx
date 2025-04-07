import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Collection, useCollection } from '../../contexts/CollectionContext';
import { useTheme } from '../../contexts/ThemeContext';

type CollectionStatus = 'scheduled' | 'completed' | 'cancelled';

export const CollectionHistoryScreen = ({ navigation }: any) => {
  const { collections, fetchCollections, isLoading, error } = useCollection();
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<CollectionStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  const filteredCollections = collections.filter(collection => {
    if (selectedFilter === 'all') return true;
    return collection.status === selectedFilter;
  });

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={[styles.collectionItem, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync();
        }
        navigation.navigate('CollectionDetails', { collectionId: item.id });
      }}
    >
      <View style={styles.collectionHeader}>
        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {new Date(item.scheduledDateTime).toLocaleDateString()}
        </Text>
        <MaterialCommunityIcons
          name={getStatusIcon(item.status)}
          size={24}
          color={getStatusColor(item.status, theme)}
        />
      </View>
      <View style={styles.collectionDetails}>
        <Text style={[styles.weightText, { color: theme.colors.text }]}>
          Weight: {item.weight || 'Not recorded'} kg
        </Text>
        <Text style={[styles.materialsText, { color: theme.colors.text }]}>
          Materials: {item.materials.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusIcon = (status: CollectionStatus) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'clock-outline';
    }
  };

  const getStatusColor = (status: CollectionStatus, theme: any) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => {
              setSelectedFilter(filter);
              if (Platform.OS === 'ios') {
                Haptics.selectionAsync();
              }
            }}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && { color: theme.colors.white }
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          data={filteredCollections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  collectionItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  collectionDetails: {
    gap: 4,
  },
  weightText: {
    fontSize: 14,
  },
  materialsText: {
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
  },
}); 