/**
 * OptimizedMaterialListScreen.tsx
 * 
 * An optimized version of the MaterialListScreen that demonstrates 
 * performance best practices including:
 * - Optimized list rendering
 * - Memoization
 * - Lazy loading
 * - Efficient data fetching and caching
 */

import { MaterialCard } from '@/components/materials/MaterialCard';
import { MaterialFilter } from '@/components/materials/MaterialFilter';
import OptimizedListView from '@/components/performance/OptimizedListView';
import { SearchBar } from '@/components/SearchBar';
import { useMaterials } from '@/hooks/useMaterials';
import { useTheme } from '@/hooks/useTheme';
import { Material } from '@/types/materials';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OptimizedMaterialListScreenProps = StackScreenProps<any>;

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 120; // Fixed height for each material card

export function OptimizedMaterialListScreen({ navigation }: OptimizedMaterialListScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const { materials, isLoading, error, loadMore, hasMore, categories } = useMaterials({
    searchQuery,
    categories: selectedCategories,
    page,
    limit: 20,
  });

  // Update the title in the header
  useEffect(() => {
    navigation.setOptions({
      title: 'Materials Catalog',
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.text,
    });
  }, [navigation, theme]);

  // Handle filter selection
  const handleFilterChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
    setPage(1); // Reset to first page when filters change
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when search changes
  }, []);

  // Load more materials when reaching the end of the list
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  // Navigate to material details when a material is selected
  const handleSelectMaterial = useCallback((material: Material) => {
    navigation.navigate('MaterialDetail', { materialId: material.id });
  }, [navigation]);

  // Render a material item
  const renderMaterialItem = useCallback(({ item }: { item: Material }) => (
    <TouchableOpacity 
      style={styles.materialItem}
      onPress={() => handleSelectMaterial(item)}
      testID={`material-item-${item.id}`}
    >
      <MaterialCard 
        material={item} 
        style={[styles.card, { backgroundColor: theme.colors.card }]}
      />
    </TouchableOpacity>
  ), [handleSelectMaterial, theme.colors.card]);

  // Get item layout for optimized rendering
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // Render the header with search and filters
  const ListHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search materials..."
        style={styles.searchBar}
        testID="materials-search"
      />
      <MaterialFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onSelectCategories={handleFilterChange}
        style={styles.filter}
      />
    </View>
  ), [searchQuery, handleSearch, categories, selectedCategories, handleFilterChange]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <OptimizedListView
        data={materials}
        renderItem={renderMaterialItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        isLoading={isLoading}
        error={error}
        onEndReached={handleLoadMore}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
        emptyText="No materials found. Try a different search or filter."
        testID="materials-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    marginBottom: 8,
  },
  filter: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  materialItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    height: ITEM_HEIGHT,
  },
  card: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 