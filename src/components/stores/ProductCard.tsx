import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import { Product } from '@/types/GroceryStore';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const theme = useTheme()()();

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      onPress={handlePress}
    >
      {product.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <ThemedText style={styles.name}>{product.name}</ThemedText>
        <ThemedText style={styles.category}>{product.category}</ThemedText>
        {product.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {product.description}
          </ThemedText>
        )}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>
              ${product.price.toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.unit}>{product.unit}</ThemedText>
          </View>
          {product.sustainabilityScore !== undefined && (
            <View
              style={[
                styles.sustainabilityBadge,
                {
                  backgroundColor: getSustainabilityColor(product.sustainabilityScore),
                },
              ]}
            >
              <IconSymbol name="leaf" size={16} color="#FFFFFF" />
              <ThemedText style={styles.sustainabilityScore}>
                {product.sustainabilityScore}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  unit: {
    fontSize: 14,
    opacity: 0.7,
  },
  sustainabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sustainabilityScore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 