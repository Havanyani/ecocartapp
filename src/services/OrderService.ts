import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { ApiService } from './ApiService';

export interface OrderItem {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  quantity: number;
  price: number;
  materialType: string;
  estimatedWeight: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface OrderResponse {
  data: Order;
  message?: string;
}

interface QueuedResponse {
  queued: true;
  message: string;
}

export class OrderService {
  private static instance: OrderService;
  private apiService: ApiService;

  private constructor() {
    this.apiService = ApiService.getInstance();
  }

  public static getInstance(): OrderService {
    if (!this.instance) {
      this.instance = new OrderService();
    }
    return this.instance;
  }

  public async getOrders(): Promise<Order[]> {
    try {
      const response = await this.apiService.get<Order[]>('/orders');
      return response.data;
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await this.apiService.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> {
    try {
      const response = await this.apiService.post<Order>('/orders', orderData);
      return response.data;
    } catch (error) {
      // If offline, queue the order creation
      if (error instanceof Error && error.message.includes('Network Error')) {
        await OfflineQueueManager.addToQueue({
          type: 'CREATE_ORDER',
          payload: orderData
        });
        throw new Error('Order creation queued for offline processing');
      }
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await this.apiService.put<Order>(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.apiService.put<Order>(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  public async getOrderTracking(orderId: string): Promise<{
    status: string;
    location: string;
    estimatedDelivery: string;
  }> {
    try {
      const response = await this.apiService.get<{
        status: string;
        location: string;
        estimatedDelivery: string;
      }>(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  static async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    status: OrderItem['status']
  ): Promise<OrderResponse> {
    const response = await ApiService.getInstance().patch<OrderResponse>(
      `/orders/${orderId}/items/${itemId}/status`,
      { status }
    );
    return response.data;
  }
}

export const orderService = OrderService.getInstance(); 