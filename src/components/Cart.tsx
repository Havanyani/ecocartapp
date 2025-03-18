import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  credits: number;
  onCheckout?: () => void;
}

export function Cart({ items, credits = 0, onCheckout }: CartProps): JSX.Element {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const availableCredits = credits;
  const finalTotal = Math.max(subtotal - availableCredits, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.itemList}>
        {items.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <ThemedText style={styles.itemPrice}>R {item.price.toFixed(2)}</ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.row}>
          <ThemedText>Subtotal</ThemedText>
          <ThemedText>R {subtotal.toFixed(2)}</ThemedText>
        </View>
        
        <View style={styles.row}>
          <ThemedText style={styles.creditText}>EcoCart Credits</ThemedText>
          <ThemedText style={styles.creditText}>-R {availableCredits.toFixed(2)}</ThemedText>
        </View>

        <View style={styles.row}>
          <ThemedText style={styles.totalText}>Total</ThemedText>
          <ThemedText style={styles.totalText}>R {finalTotal.toFixed(2)}</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={onCheckout}
          accessibilityLabel="Proceed to checkout"
          accessibilityRole="button"
        >
          <ThemedText style={styles.checkoutText}>Proceed to Checkout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summary: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  creditText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 