import { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/shared';

// Dummy cart data
const initialCartItems = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 85,
    quantity: 1
  },
  {
    id: '3',
    name: 'Reusable Water Bottle',
    price: 24.99,
    image: require('../../assets/placeholder.png'),
    ecoScore: 88,
    quantity: 2
  }
];

export default function CartScreen() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getEcoSavings = () => {
    // Simple calculation based on eco score for demo purposes
    return cartItems.reduce((sum, item) => sum + ((item.ecoScore / 100) * 5 * item.quantity), 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/eco-logo.png')} style={styles.logo} />
          <ThemedText style={styles.title}>Your Cart</ThemedText>
        </View>
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName}>{item.name}</ThemedText>
                  <ThemedText style={styles.productPrice}>${item.price.toFixed(2)}</ThemedText>
                  <View style={styles.ecoScoreContainer}>
                    <ThemedText style={styles.ecoScoreText}>Eco Score: </ThemedText>
                    <ThemedText style={[styles.ecoScore, { color: getScoreColor(item.ecoScore) }]}>
                      {item.ecoScore}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <ThemedText style={styles.quantityButtonText}>-</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <ThemedText style={styles.quantityButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          />
          
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>${getSubtotal().toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Estimated CO₂ Savings</ThemedText>
              <ThemedText style={[styles.summaryValue, styles.ecoSavings]}>
                {getEcoSavings().toFixed(2)} kg
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyCart}>
          <ThemedText style={styles.emptyCartText}>Your cart is empty</ThemedText>
          <TouchableOpacity style={styles.shopButton}>
            <ThemedText style={styles.shopButtonText}>Shop Now</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#2a9d8f'; // good - green
  if (score >= 60) return '#e9c46a'; // medium - yellow
  return '#e76f51'; // poor - red
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
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 4,
  },
  ecoScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoScoreText: {
    fontSize: 12,
    color: '#666',
  },
  ecoScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 6,
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontSize: 13,
  },
  summary: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ecoSavings: {
    color: '#2a9d8f',
  },
  checkoutButton: {
    backgroundColor: '#2a9d8f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 