import { CategoryFilter } from '@/components/CategoryFilter';
import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import type { Product } from '@/types/product';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';

type ProductListScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

export function ProductListScreen({ navigation }: ProductListScreenProps): JSX.Element {
  const theme = useTheme();
  const { addToCart } = useCart();
  const {
    products,
    isLoading,
    error,
    hasMore,
    refreshProducts,
    loadMore,
    searchProducts,
    getProductsByCategory,
  } = useProducts({ pageSize: 10 });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshProducts();
    setIsRefreshing(false);
  }, [refreshProducts]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      await searchProducts(query);
    } else {
      await refreshProducts();
    }
  }, [searchProducts, refreshProducts]);

  const handleCategorySelect = useCallback(async (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      await refreshProducts();
    } else {
      await getProductsByCategory(category);
    }
  }, [getProductsByCategory, refreshProducts]);

  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      await addToCart(product, 1, 'standard');
    } catch (err) {
      // Handle error (show toast, etc.)
      console.error('Failed to add product to cart:', err);
    }
  }, [addToCart]);

  if (!isFeatureEnabled('enableProductCatalog')) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.disabledContainer}>
          <IconSymbol name="store-off" size={64} color={theme.theme.colors.textSecondary} />
          <ThemedText style={styles.disabledTitle}>Product Catalog Disabled</ThemedText>
          <ThemedText style={styles.disabledMessage}>
            EcoCart is currently focused on waste collection and rewards. The product catalog will be available soon!
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ErrorView
        message="Failed to load products"
        onRetry={refreshProducts}
      />
    );
  }

  const renderEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <ThemedText>No products found</ThemedText>
      </View>
    );
  };

  const renderFooterComponent = () => {
    if (!isLoading || !hasMore) return null;
    return <LoadingView style={styles.loadingFooter} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search products..."
        style={styles.searchBar}
      />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        style={styles.categoryFilter}
      />
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
  },
  categoryFilter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingFooter: {
    padding: 16,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  disabledMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
}); 