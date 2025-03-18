import { HapticButton } from '@/components/ui/HapticButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useCart } from '@/hooks/useCart';
import type { RootStackParamList } from '@/navigation/types';
import type { Product } from '@/types/product';
import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
    ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProductDetailScreenProps = StackScreenProps<RootStackParamList, 'ProductDetail'>;

interface PackagingOption {
  type: Product['ecoFriendly']['packagingType'];
  label: string;
  description: string;
  icon: string;
  plasticReduction: number;
  additionalCost: number;
}

export function ProductDetailScreen({ route }: ProductDetailScreenProps): JSX.Element {
  const { product } = route.params;
  const { width } = useWindowDimensions();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = 
    useState<Product['ecoFriendly']['packagingType']>('standard');

  const packagingOptions: PackagingOption[] = [
    {
      type: 'standard',
      label: 'Standard Packaging',
      description: 'Regular packaging option',
      icon: 'package-variant',
      plasticReduction: 0,
      additionalCost: 0
    },
    {
      type: 'recyclable',
      label: 'Recyclable',
      description: '100% recyclable materials',
      icon: 'recycle',
      plasticReduction: 25,
      additionalCost: 2
    },
    {
      type: 'biodegradable',
      label: 'Biodegradable',
      description: 'Naturally decomposing materials',
      icon: 'leaf',
      plasticReduction: 35,
      additionalCost: 3
    },
    {
      type: 'reusable',
      label: 'Reusable Container',
      description: 'Return for credit on next order',
      icon: 'refresh',
      plasticReduction: 50,
      additionalCost: 5
    }
  ];

  const selectedOption = packagingOptions.find(opt => opt.type === selectedPackaging);
  const totalPrice = (product.price * quantity) + 
    (selectedOption?.additionalCost ?? 0) * quantity;

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          style={[styles.productImage, { width }]}
          source={{ uri: product.image }}
          defaultSource={require('@/assets/images/placeholder.png')}
          accessibilityLabel={`Image of ${product.name}`}
        />
        
        <ThemedView style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.productName}>{product.name}</ThemedText>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star" size={16} color="#FFD700" />
                <ThemedText style={styles.ratingText}>
                  {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.productPrice}>
              R {product.price.toFixed(2)}
            </ThemedText>
          </View>

          {product.ecoFriendly.isEcoFriendly && (
            <View style={styles.ecoFriendlyBadge}>
              <IconSymbol name="leaf" size={20} color="#2e7d32" />
              <ThemedText style={styles.ecoFriendlyText}>
                Eco-Friendly Product
              </ThemedText>
            </View>
          )}
          
          <ThemedText style={styles.description}>{product.description}</ThemedText>

          {product.nutritionInfo && (
            <View style={styles.nutritionSection}>
              <ThemedText style={styles.sectionTitle}>Nutrition Information</ThemedText>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionValue}>
                    {product.nutritionInfo.calories}
                  </ThemedText>
                  <ThemedText style={styles.nutritionLabel}>Calories</ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionValue}>
                    {product.nutritionInfo.protein}g
                  </ThemedText>
                  <ThemedText style={styles.nutritionLabel}>Protein</ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionValue}>
                    {product.nutritionInfo.carbs}g
                  </ThemedText>
                  <ThemedText style={styles.nutritionLabel}>Carbs</ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText style={styles.nutritionValue}>
                    {product.nutritionInfo.fat}g
                  </ThemedText>
                  <ThemedText style={styles.nutritionLabel}>Fat</ThemedText>
                </View>
              </View>
            </View>
          )}

          <View style={styles.packagingSection}>
            <ThemedText style={styles.sectionTitle}>Packaging Options</ThemedText>
            <View style={styles.packagingOptions}>
              {packagingOptions.map(option => (
                <HapticButton
                  key={option.type}
                  style={[
                    styles.packagingOption,
                    selectedPackaging === option.type ? styles.selectedPackaging : undefined
                  ].filter(Boolean) as ViewStyle[]}
                  onPress={() => setSelectedPackaging(option.type)}
                  accessibilityLabel={`Select ${option.label} packaging`}
                  accessibilityState={{ selected: selectedPackaging === option.type }}
                >
                  <IconSymbol 
                    name={option.icon} 
                    size={24} 
                    color={selectedPackaging === option.type ? '#2e7d32' : '#666'} 
                  />
                  <View style={styles.packagingInfo}>
                    <ThemedText style={styles.packagingLabel}>
                      {option.label}
                    </ThemedText>
                    <ThemedText style={styles.packagingDescription}>
                      {option.description}
                    </ThemedText>
                    {option.plasticReduction > 0 && (
                      <ThemedText style={styles.plasticReduction}>
                        Reduces plastic by {option.plasticReduction}%
                      </ThemedText>
                    )}
                    {option.additionalCost > 0 && (
                      <ThemedText style={styles.additionalCost}>
                        +R {option.additionalCost.toFixed(2)}
                      </ThemedText>
                    )}
                  </View>
                </HapticButton>
              ))}
            </View>
          </View>

          <View style={styles.quantitySection}>
            <ThemedText style={styles.sectionTitle}>Quantity</ThemedText>
            <View style={styles.quantityContainer}>
              <HapticButton 
                style={styles.quantityButton} 
                onPress={decrementQuantity}
                accessibilityLabel="Decrease quantity"
              >
                <IconSymbol name="minus" size={20} color="#666" />
              </HapticButton>
              
              <ThemedText style={styles.quantity}>{quantity}</ThemedText>
              
              <HapticButton 
                style={styles.quantityButton} 
                onPress={incrementQuantity}
                accessibilityLabel="Increase quantity"
              >
                <IconSymbol name="plus" size={20} color="#666" />
              </HapticButton>
            </View>
          </View>

          <View style={styles.impactSection}>
            <ThemedText style={styles.sectionTitle}>Environmental Impact</ThemedText>
            <View style={styles.impactInfo}>
              <IconSymbol name="earth" size={48} color="#2e7d32" />
              <ThemedText style={styles.impactText}>
                By choosing {selectedOption?.label.toLowerCase()}, you're helping reduce plastic waste by{' '}
                {(selectedOption?.plasticReduction ?? 0) * quantity}% with this order.
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.totalLabel}>Total:</ThemedText>
          <ThemedText style={styles.totalPrice}>
            R {totalPrice.toFixed(2)}
          </ThemedText>
        </View>

        <HapticButton
          style={styles.addToCartButton}
          onPress={() => {
            addToCart(product, quantity, selectedPackaging);
          }}
          accessibilityLabel={`Add ${quantity} ${product.name} to cart`}
        >
          <ThemedText style={styles.addToCartText}>
            Add to Cart
          </ThemedText>
        </HapticButton>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  productImage: {
    height: 300,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  ecoFriendlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  ecoFriendlyText: {
    marginLeft: 8,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  packagingSection: {
    marginBottom: 24,
  },
  packagingOptions: {
    gap: 12,
  },
  packagingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPackaging: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
  },
  packagingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  packagingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  packagingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  plasticReduction: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
  },
  additionalCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  impactSection: {
    marginBottom: 24,
  },
  impactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
  },
  impactText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#2e7d32',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  addToCartButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 150,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 