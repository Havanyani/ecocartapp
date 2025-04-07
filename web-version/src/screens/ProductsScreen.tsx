import { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { CategoryFilter, ProductCard, SearchBar, ThemedText } from '../components/shared';

// Dummy data for products
const dummyProducts = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 85,
    category: 'clothing'
  },
  {
    id: '2',
    name: 'Bamboo Cutlery Set',
    price: 15.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 92,
    category: 'kitchen'
  },
  {
    id: '3',
    name: 'Reusable Water Bottle',
    price: 24.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 88,
    category: 'kitchen'
  },
  {
    id: '4',
    name: 'Recycled Paper Notebook',
    price: 9.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 80,
    category: 'stationery'
  },
  {
    id: '5',
    name: 'Hemp Backpack',
    price: 59.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 78,
    category: 'accessories'
  },
  {
    id: '6',
    name: 'Solar Power Bank',
    price: 49.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 75,
    category: 'electronics'
  },
];

// All available categories
const categories = ['all', 'clothing', 'kitchen', 'stationery', 'accessories', 'electronics'];

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter products based on search query and selected category
  const filteredProducts = dummyProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/eco-logo.png')} style={styles.logo} />
          <ThemedText style={styles.title}>Eco Products</ThemedText>
        </View>
        
        <SearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          style={styles.categoriesContainer}
        />
      </View>
      
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            price={item.price}
            image={item.image}
            ecoScore={item.ecoScore}
            onPress={() => console.log(`Selected: ${item.name}`)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No products found</ThemedText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#2a9d8f',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#fff',
  },
  categoryText: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#2a9d8f',
  },
  productsList: {
    padding: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 