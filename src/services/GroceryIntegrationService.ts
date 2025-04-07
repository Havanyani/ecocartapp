/**
 * GroceryIntegrationService.ts
 * 
 * Service for integrating with grocery store delivery systems, synchronizing
 * delivery schedules, and managing credit redemption.
 */

import { ApiService } from './ApiService';
import { CreditService } from './CreditService';
import NotificationService from './NotificationService';
import OfflineManager from './OfflineManager';

// Supported grocery store providers
export enum GroceryProvider {
  WHOLE_FOODS = 'whole_foods',
  KROGER = 'kroger',
  WALMART = 'walmart',
  INSTACART = 'instacart',
  AMAZON_FRESH = 'amazon_fresh',
  SHIPT = 'shipt',
  TARGET = 'target',
  ALBERTSONS = 'albertsons',
  OTHER = 'other'
}

// Order status types
export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

// Delivery schedule types
export interface DeliveryTimeSlot {
  id: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  available: boolean;
  fee: number;
  isSustainable: boolean; // Lower emissions/grouped with other deliveries
}

export interface GroceryStore {
  id: string;
  name: string;
  provider: GroceryProvider;
  address: string;
  logoUrl?: string;
  isConnected: boolean;
  isActive: boolean;
  lastSyncedAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  isSustainable?: boolean; // Eco-friendly product
}

export interface GroceryOrder {
  id: string;
  storeId: string;
  provider: GroceryProvider;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  scheduledDeliveryStart?: string;
  scheduledDeliveryEnd?: string;
  actualDeliveryTime?: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  creditsApplied: number;
  total: number;
  items: OrderItem[];
  trackingUrl?: string;
  notes?: string;
  isEcoDelivery: boolean;
}

export interface CreditRedemptionRequest {
  orderId: string;
  storeId: string;
  amount: number;
}

export interface CreditRedemptionResponse {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'applied' | 'rejected';
  transactionId: string;
  appliedAt?: string;
}

export interface ConnectStoreRequest {
  provider: GroceryProvider;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  storePreferences?: {
    defaultStore?: string;
    preferredDeliveryDays?: string[];
    preferredDeliveryTimeRanges?: {
      start: string; // 24-hour format e.g. "14:00"
      end: string;   // 24-hour format e.g. "18:00"
    }[];
  };
}

export class GroceryIntegrationService {
  private static instance: GroceryIntegrationService;
  private static readonly ENDPOINT = '/grocery';
  private syncIntervals: { [storeId: string]: NodeJS.Timeout } = {};

  private constructor() {}

  public static getInstance(): GroceryIntegrationService {
    if (!GroceryIntegrationService.instance) {
      GroceryIntegrationService.instance = new GroceryIntegrationService();
    }
    return GroceryIntegrationService.instance;
  }

  /**
   * Connect to a grocery store delivery system
   * @param request Connect store request
   */
  public async connectStore(request: ConnectStoreRequest): Promise<GroceryStore> {
    try {
      const response = await ApiService.getInstance().post(
        `${GroceryIntegrationService.ENDPOINT}/connect`,
        request
      );
      
      // Set up auto-sync for the connected store
      this.setupStoreSync(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Failed to connect grocery store:', error);
      throw new Error('Failed to connect to grocery store delivery system');
    }
  }

  /**
   * Disconnect from a grocery store
   * @param storeId Store ID to disconnect
   */
  public async disconnectStore(storeId: string): Promise<{ success: boolean }> {
    try {
      const response = await ApiService.getInstance().post(
        `${GroceryIntegrationService.ENDPOINT}/disconnect/${storeId}`
      );
      
      // Clear any sync intervals
      if (this.syncIntervals[storeId]) {
        clearInterval(this.syncIntervals[storeId]);
        delete this.syncIntervals[storeId];
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to disconnect grocery store:', error);
      throw new Error('Failed to disconnect from grocery store');
    }
  }

  /**
   * Get user's connected grocery stores
   */
  public async getConnectedStores(): Promise<GroceryStore[]> {
    try {
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/stores`
      );
      
      // Set up sync for all connected stores
      response.data.forEach((store: GroceryStore) => {
        if (store.isConnected && store.isActive) {
          this.setupStoreSync(store);
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get connected grocery stores:', error);
      if (!navigator.onLine) {
        // Return cached stores if offline
        return this.getCachedStores();
      }
      throw new Error('Failed to retrieve connected grocery stores');
    }
  }

  /**
   * Synchronize delivery schedule with a grocery store
   * @param storeId Store ID to sync with
   */
  public async syncDeliverySchedule(storeId: string): Promise<DeliveryTimeSlot[]> {
    try {
      const response = await ApiService.getInstance().post(
        `${GroceryIntegrationService.ENDPOINT}/sync-schedule/${storeId}`
      );
      
      // Cache the delivery schedule
      this.cacheDeliverySchedule(storeId, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Failed to sync delivery schedule:', error);
      if (!navigator.onLine) {
        // Return cached schedule if offline
        return this.getCachedDeliverySchedule(storeId);
      }
      throw new Error('Failed to synchronize delivery schedule');
    }
  }

  /**
   * Get available delivery time slots
   * @param storeId Store ID
   * @param date Date for delivery slots (YYYY-MM-DD)
   */
  public async getDeliveryTimeSlots(storeId: string, date: string): Promise<DeliveryTimeSlot[]> {
    try {
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/delivery-slots/${storeId}`,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get delivery slots:', error);
      throw new Error('Failed to retrieve delivery time slots');
    }
  }

  /**
   * Get user's grocery orders
   * @param limit Number of orders to retrieve
   * @param status Optional status filter
   */
  public async getOrders(limit: number = 10, status?: OrderStatus): Promise<GroceryOrder[]> {
    try {
      const params: any = { limit };
      if (status) {
        params.status = status;
      }
      
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/orders`,
        { params }
      );
      
      // Cache the orders
      this.cacheOrders(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Failed to get grocery orders:', error);
      if (!navigator.onLine) {
        // Return cached orders if offline
        return this.getCachedOrders();
      }
      throw new Error('Failed to retrieve grocery orders');
    }
  }

  /**
   * Get single order details
   * @param orderId Order ID
   */
  public async getOrderDetails(orderId: string): Promise<GroceryOrder> {
    try {
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get order details:', error);
      if (!navigator.onLine) {
        // Try to find in cached orders
        const cachedOrder = await this.getCachedOrderById(orderId);
        if (cachedOrder) {
          return cachedOrder;
        }
      }
      throw new Error('Failed to retrieve order details');
    }
  }

  /**
   * Apply credits to a grocery order
   * @param request Credit redemption request
   */
  public async redeemCredits(request: CreditRedemptionRequest): Promise<CreditRedemptionResponse> {
    try {
      // Validate if user has enough credits
      const userId = 'current-user'; // Get from auth service in a real implementation
      const availableCredits = await CreditService.getUserCredits(userId);
      if (availableCredits < request.amount) {
        throw new Error('Insufficient credits for this redemption');
      }
      
      const response = await ApiService.getInstance().post(
        `${GroceryIntegrationService.ENDPOINT}/redeem-credits`,
        request
      );
      
      // Update local credit balance
      await CreditService.useCredits(userId, request.amount);
      
      // Send notification about credits usage
      NotificationService.getInstance().sendLocalNotification({
        title: 'Credits Redeemed',
        body: `You've successfully redeemed ${request.amount} credits towards your grocery order.`,
        data: { screen: 'OrderDetails', orderId: request.orderId }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to redeem credits:', error);
      if (!navigator.onLine) {
        await OfflineManager.getInstance().addToQueue({
          type: 'REDEEM_CREDITS',
          payload: request
        });
        throw new Error('Your redemption will be processed when you are back online');
      }
      throw new Error('Failed to redeem credits for the order');
    }
  }

  /**
   * Get credit redemption history
   * @param limit Number of transactions to retrieve
   */
  public async getCreditRedemptionHistory(limit: number = 20): Promise<CreditRedemptionResponse[]> {
    try {
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/credit-redemptions`,
        { params: { limit } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get credit redemption history:', error);
      throw new Error('Failed to retrieve credit redemption history');
    }
  }

  /**
   * Get eco-friendly delivery options comparison
   * @param storeId Store ID
   * @param date Delivery date
   */
  public async getEcoDeliveryOptions(storeId: string, date: string): Promise<{
    standard: DeliveryTimeSlot[];
    eco: DeliveryTimeSlot[];
    emissions: {
      standard: number;
      eco: number;
      savings: number;
    };
  }> {
    try {
      const response = await ApiService.getInstance().get(
        `${GroceryIntegrationService.ENDPOINT}/eco-delivery-options/${storeId}`,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get eco delivery options:', error);
      throw new Error('Failed to retrieve eco-friendly delivery options');
    }
  }

  /**
   * Setup automatic synchronization for a store
   * @param store Store to sync
   */
  private setupStoreSync(store: GroceryStore): void {
    // Clear any existing interval
    if (this.syncIntervals[store.id]) {
      clearInterval(this.syncIntervals[store.id]);
    }
    
    // Sync every 30 minutes
    this.syncIntervals[store.id] = setInterval(() => {
      this.syncDeliverySchedule(store.id).catch(error => {
        console.error(`Failed to auto-sync store ${store.id}:`, error);
      });
    }, 30 * 60 * 1000); // 30 minutes
    
    // Do initial sync
    this.syncDeliverySchedule(store.id).catch(error => {
      console.error(`Failed to initial sync store ${store.id}:`, error);
    });
  }

  /**
   * Cache stores for offline use
   */
  private async cacheStores(stores: GroceryStore[]): Promise<void> {
    try {
      await localStorage.setItem('cached_grocery_stores', JSON.stringify(stores));
    } catch (error) {
      console.error('Failed to cache stores:', error);
    }
  }

  /**
   * Get cached stores
   */
  private async getCachedStores(): Promise<GroceryStore[]> {
    try {
      const cached = await localStorage.getItem('cached_grocery_stores');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached stores:', error);
      return [];
    }
  }

  /**
   * Cache delivery schedule
   */
  private async cacheDeliverySchedule(storeId: string, schedule: DeliveryTimeSlot[]): Promise<void> {
    try {
      await localStorage.setItem(`cached_delivery_schedule_${storeId}`, JSON.stringify(schedule));
      await localStorage.setItem(`cached_delivery_schedule_${storeId}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache delivery schedule:', error);
    }
  }

  /**
   * Get cached delivery schedule
   */
  private async getCachedDeliverySchedule(storeId: string): Promise<DeliveryTimeSlot[]> {
    try {
      const timestampStr = await localStorage.getItem(`cached_delivery_schedule_${storeId}_timestamp`);
      const timestamp = timestampStr ? parseInt(timestampStr) : 0;
      
      // Check if cache is fresh (less than 1 hour old)
      const now = Date.now();
      if (now - timestamp > 60 * 60 * 1000) {
        return []; // Cache is stale
      }
      
      const cached = await localStorage.getItem(`cached_delivery_schedule_${storeId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached delivery schedule:', error);
      return [];
    }
  }

  /**
   * Cache orders
   */
  private async cacheOrders(orders: GroceryOrder[]): Promise<void> {
    try {
      await localStorage.setItem('cached_grocery_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to cache orders:', error);
    }
  }

  /**
   * Get cached orders
   */
  private async getCachedOrders(): Promise<GroceryOrder[]> {
    try {
      const cached = await localStorage.getItem('cached_grocery_orders');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached orders:', error);
      return [];
    }
  }

  /**
   * Get cached order by ID
   */
  private async getCachedOrderById(orderId: string): Promise<GroceryOrder | null> {
    try {
      const orders = await this.getCachedOrders();
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Failed to get cached order by ID:', error);
      return null;
    }
  }
  
  /**
   * Clean up on service destruction
   */
  public cleanup(): void {
    // Clear all sync intervals
    Object.values(this.syncIntervals).forEach(interval => {
      clearInterval(interval);
    });
    this.syncIntervals = {};
  }
} 