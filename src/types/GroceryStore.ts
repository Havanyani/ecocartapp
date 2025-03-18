import { z } from 'zod';

export const GroceryStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  operatingHours: z.array(
    z.object({
      day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      open: z.string(),
      close: z.string(),
    })
  ),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  price: z.number(),
  unit: z.string(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean(),
  sustainabilityScore: z.number().min(0).max(100).optional(),
});

export const InventoryItemSchema = z.object({
  productId: z.string(),
  storeId: z.string(),
  quantity: z.number(),
  lastUpdated: z.date(),
});

export const DeliverySlotSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  available: z.boolean(),
  maxOrders: z.number().optional(),
  currentOrders: z.number().optional(),
  fee: z.number().optional(),
  storeId: z.string().optional(),
});

export const OrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled']),
  updatedAt: z.string(),
  estimatedDelivery: z.string().optional(),
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  deliveryNotes: z.string().optional(),
});

export interface GroceryStore extends z.infer<typeof GroceryStoreSchema> {}
export interface Product extends z.infer<typeof ProductSchema> {}
export interface InventoryItem extends z.infer<typeof InventoryItemSchema> {}
export interface DeliverySlot extends z.infer<typeof DeliverySlotSchema> {}
export interface OrderStatus extends z.infer<typeof OrderStatusSchema> {}

export interface StoreSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  query?: string;
  isActive?: boolean;
}

export interface ProductSearchParams {
  storeId: string;
  category?: string;
  query?: string;
  isAvailable?: boolean;
}

export interface GroceryIntegrationConfig {
  name: string;
  baseUrl: string;
  authUrl: string;
  deliverySlotsUrl: string;
  orderStatusUrl: string;
}

export interface GroceryOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
}

export interface GroceryOrder {
  id: string;
  userId: string;
  items: GroceryOrderItem[];
  deliverySlot: DeliverySlot;
  status: OrderStatus;
  totalPrice: number;
  deliveryFee: number;
  paymentMethod: 'credit' | 'card' | 'cash';
  createdAt: string;
  updatedAt: string;
}

export interface CreditRedemptionPayload {
  userId: string;
  creditAmount: number;
  orderId?: string;
}

export interface CreditRedemptionResponse {
  success: boolean;
  newBalance: number;
  redeemedAmount: number;
  transactionId: string;
  error?: string;
} 