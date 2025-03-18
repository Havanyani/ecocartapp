/**
 * app/(tabs)/tasks.tsx
 * 
 * Tasks management screen for the EcoCart app.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { Todo } from '@/components/Todo';
import { HapticTab } from '@/components/ui/HapticTab';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

import Colors from '@/constants/Colors';
import { collectionService } from '@/services/CollectionService';
import {
    selectCollections,
    selectError,
    selectIsLoading,
    setCollections,
    setError,
    setLoading
} from '@/store/slices/collectionSlice';
import { CollectionStatus } from '@/types/Collection';

type TaskFilter = 'all' | 'collection' | 'delivery' | 'overdue';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useDispatch();
  
  const collections = useSelector(selectCollections);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const history = await collectionService.getCollectionHistory();
      dispatch(setCollections(history));
    } catch (err) {
      dispatch(setError('Failed to load tasks. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkTaskComplete = async (collectionId: string) => {
    try {
      await collectionService.updateCollectionStatus(collectionId, 'completed' as CollectionStatus);
      await loadData(); // Refresh the list after marking complete
    } catch (error) {
      dispatch(setError('Failed to update task status. Please try again.'));
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      );
    }

    if (error) {
      return (
        <ThemedView style={styles.centerContent}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <HapticTab
            style={styles.retryButton}
            onPress={loadData}
            accessibilityLabel="Retry loading tasks"
            accessibilityRole="button"
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </HapticTab>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.content}>
        <ScrollableFilterComponent 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />

        <Todo 
          type={activeFilter === 'all' ? 'all' : activeFilter === 'collection' ? 'collection' : 'delivery'} 
          maxItems={50}
          onTaskComplete={handleMarkTaskComplete}
        />
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Tasks</ThemedText>
        <TouchableOpacity onPress={() => router.push('/collection/schedule')}>
          <ThemedView style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      {renderContent()}
    </SafeAreaView>
  );
}

interface ScrollableFilterProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

function ScrollableFilterComponent({ activeFilter, onFilterChange }: ScrollableFilterProps) {
  const filters: { id: TaskFilter, label: string, icon: string }[] = [
    { id: 'all', label: 'All Tasks', icon: 'list' },
    { id: 'collection', label: 'Collection', icon: 'trash-bin' },
    { id: 'delivery', label: 'Delivery', icon: 'car' },
    { id: 'overdue', label: 'Overdue', icon: 'alert-circle' },
  ];

  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterList}
    >
      {filters.map(item => (
        <TouchableOpacity 
          key={item.id}
          onPress={() => onFilterChange(item.id)}
          style={[
            styles.filterItem,
            activeFilter === item.id && styles.activeFilterItem
          ]}
        >
          <Ionicons 
            name={item.icon as any} 
            size={16} 
            color={activeFilter === item.id ? 'white' : '#666'} 
          />
          <ThemedText 
            style={[
              styles.filterText,
              activeFilter === item.id && styles.activeFilterText
            ]}
          >
            {item.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#f44336',
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterItem: {
    backgroundColor: '#2e7d32',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    fontWeight: '500',
    color: 'white',
  },
}); 