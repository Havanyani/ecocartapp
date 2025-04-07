import { IconSymbol } from '@/components/ui/IconSymbol';
import { SearchBar } from '@/components/ui/SearchBar';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useGroceryStore } from '@/hooks/useGroceryStore';
import { useTheme } from '@/theme';
import { GroceryStore } from '@/types/GroceryStore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface StoreListProps {
  onStoreSelect: (store: GroceryStore) => void;
}

export function StoreList({ onStoreSelect }: StoreListProps) {
  const theme = useTheme()()();
  const { stores, isLoading, error, searchStores } = useGroceryStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      await searchStores({
        query: searchQuery,
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchStores({
      query,
      isActive: true,
    });
  };

  const renderStoreItem = ({ item }: { item: GroceryStore }) => (
    <TouchableOpacity
      style={[styles.storeItem, { backgroundColor: theme.colors.background }]}
      onPress={() => onStoreSelect(item)}
    >
      <View style={styles.storeInfo}>
        <ThemedText style={styles.storeName}>{item.name}</ThemedText>
        <ThemedText style={styles.storeAddress}>{item.address}</ThemedText>
      </View>
      <IconSymbol name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search stores..."
        style={styles.searchBar}
      />
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
  },
  listContainer: {
    padding: 16,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
}); 