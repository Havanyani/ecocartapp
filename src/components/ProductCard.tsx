import { HapticButton } from '@/components/HapticButton';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/theme';
import type { Product } from '@/types/product';
import { Image, StyleSheet, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const themeFunc = useTheme();
const theme = themeFunc();

  return (
    <HapticButton
      style={styles.productCard}
      onPress={() => onAddToCart()}
      accessibilityLabel={`View details for ${product.name}`}
    >
      <Image
        style={styles.productImage}
        source={{ uri: product.image }}
        defaultSource={require('@/assets/images/placeholder.png')}
      />
      {product.ecoFriendly.isEcoFriendly && (
        <View style={styles.ecoFriendlyBadge}>
          <IconSymbol name="leaf" size={16} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={styles.productPrice}>
          R {product.price.toFixed(2)}
        </ThemedText>
        <View style={styles.ratingContainer}>
          <IconSymbol name="star" size={16} color="#FFD700" />
          <ThemedText style={styles.ratingText}>
            {product.ratings.average.toFixed(1)} ({product.ratings.count})
          </ThemedText>
        </View>
        <HapticButton
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={onAddToCart}
          accessibilityLabel={`Add ${product.name} to cart`}
        >
          <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
        </HapticButton>
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  ecoFriendlyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e8f5e9',
    padding: 4,
    borderRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 