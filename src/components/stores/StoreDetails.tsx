import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useGroceryStore } from '@/hooks/useGroceryStore';
import { useTheme } from '@/hooks/useTheme';
import { GroceryStore, Product } from '@/types/GroceryStore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';

interface StoreDetailsProps {
  store: GroceryStore;
}

export function StoreDetails({ store }: StoreDetailsProps) {
  const { theme } = useTheme();
  const { products, isLoading, error, searchProducts, getStoreProducts } = useGroceryStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [store.id, selectedCategory]);

  const loadProducts = async () => {
    try {
      await searchProducts({
        storeId: store.id,
        category: selectedCategory || undefined,
        isAvailable: true,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const storeProducts = getStoreProducts(store.id);
  const categories = Array.from(new Set(storeProducts.map(p => p.category)));

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <View
      style={[
        styles.categoryItem,
        {
          backgroundColor: selectedCategory === item ? theme.colors.primary : theme.colors.background,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.categoryText,
          {
            color: selectedCategory === item ? theme.colors.text.inverse : theme.colors.text.primary,
          },
        ]}
        onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
      >
        {item}
      </ThemedText>
    </View>
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
      <View style={styles.header}>
        <ThemedText style={styles.storeName}>{store.name}</ThemedText>
        <ThemedText style={styles.storeAddress}>{store.address}</ThemedText>
        <View style={styles.contactInfo}>
          {store.contactNumber && (
            <View style={styles.contactItem}>
              <IconSymbol name="phone" size={16} color={theme.colors.text.secondary} />
              <ThemedText style={styles.contactText}>{store.contactNumber}</ThemedText>
            </View>
          )}
          {store.email && (
            <View style={styles.contactItem}>
              <IconSymbol name="email" size={16} color={theme.colors.text.secondary} />
              <ThemedText style={styles.contactText}>{store.email}</ThemedText>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />

      <FlatList
        data={storeProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
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
  header: {
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  storeAddress: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoriesList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
}); 