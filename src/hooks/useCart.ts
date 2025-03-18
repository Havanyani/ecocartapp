import type { Product } from '@/types/product';
import { useCallback, useState } from 'react';

interface CartItem {
  product: Product;
  quantity: number;
  packagingType: 'standard' | 'eco';
}

interface UseCartReturn {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, packagingType: 'standard' | 'eco') => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback(async (
    product: Product,
    quantity: number,
    packagingType: 'standard' | 'eco'
  ) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { product, quantity, packagingType }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
} 