import { DeliverySlot, OrderStatus } from '@/types/GroceryStore';
import { ActionType } from '@/utils/OfflineQueueManager';
import { performanceMonitor } from '@/utils/PerformanceMonitor';

// API integration configurations
export const GROCERY_INTEGRATIONS: Record<string, GroceryIntegrationConfig> = {
  checkers60: {
    name: 'Checkers Sixty60',
    baseUrl: 'https://api.sixty60.co.za/v1',
    authUrl: '/auth/login',
    deliverySlotsUrl: '/delivery/slots',
    orderStatusUrl: '/orders/{orderId}/status',
  },
  // Add more grocery integrations here
};

interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

interface DeliverySlotsResponse {
  success: boolean;
  data?: DeliverySlot[];
  error?: string;
}

interface BookSlotResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

interface OrderStatusResponse {
  success: boolean;
  status?: OrderStatus;
  error?: string;
}

/**
 * Helper function to make API calls with error handling and performance monitoring
 */
async function fetchApi<T>(
  url: string,
  options: RequestInit,
  actionType: ActionType
): Promise<T> {
  const benchmarkId = `grocery_api_${actionType.toLowerCase()}`;
  
  try {
    performanceMonitor.startBenchmark(benchmarkId);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    performanceMonitor.endBenchmark(benchmarkId);
    return data;
  } catch (error) {
    performanceMonitor.logError(benchmarkId, error instanceof Error ? error : new Error('Unknown API error'));
    throw error;
  }
}

/**
 * Grocery store API client
 */
export const groceryStoreApi = {
  /**
   * Authenticate with the grocery provider
   */
  async authenticate(
    username: string,
    password: string,
    provider = 'checkers60'
  ): Promise<AuthResponse> {
    try {
      const config = GROCERY_INTEGRATIONS[provider];
      if (!config) {
        return { success: false, error: `Unsupported provider: ${provider}` };
      }
      
      const url = `${config.baseUrl}${config.authUrl}`;
      
      const response = await fetchApi<any>(
        url,
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        },
        ActionType.AUTHENTICATE
      );
      
      if (response && response.token) {
        return {
          success: true,
          token: response.token,
        };
      }
      
      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  
  /**
   * Fetch available delivery slots
   */
  async fetchDeliverySlots(
    token: string,
    provider = 'checkers60'
  ): Promise<DeliverySlotsResponse> {
    try {
      const config = GROCERY_INTEGRATIONS[provider];
      if (!config) {
        return { success: false, error: `Unsupported provider: ${provider}` };
      }
      
      const url = `${config.baseUrl}${config.deliverySlotsUrl}`;
      
      const response = await fetchApi<any>(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
        ActionType.FETCH_DELIVERY_SLOTS
      );
      
      if (response && response.slots) {
        // Convert API response to our DeliverySlot format
        const deliverySlots: DeliverySlot[] = response.slots.map((slot: any) => ({
          id: slot.id,
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          available: slot.available,
          fee: slot.fee,
          maxItems: slot.max_items,
        }));
        
        return {
          success: true,
          data: deliverySlots,
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch delivery slots',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  
  /**
   * Book a delivery slot
   */
  async bookDeliverySlot(
    token: string,
    slotId: string,
    provider = 'checkers60'
  ): Promise<BookSlotResponse> {
    try {
      const config = GROCERY_INTEGRATIONS[provider];
      if (!config) {
        return { success: false, error: `Unsupported provider: ${provider}` };
      }
      
      const url = `${config.baseUrl}${config.deliverySlotsUrl}/${slotId}/book`;
      
      const response = await fetchApi<any>(
        url,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
        ActionType.BOOK_DELIVERY_SLOT
      );
      
      if (response && response.booking_id) {
        return {
          success: true,
          bookingId: response.booking_id,
        };
      }
      
      return {
        success: false,
        error: 'Failed to book delivery slot',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  
  /**
   * Get order status
   */
  async getOrderStatus(
    token: string,
    orderId: string,
    provider = 'checkers60'
  ): Promise<OrderStatusResponse> {
    try {
      const config = GROCERY_INTEGRATIONS[provider];
      if (!config) {
        return { success: false, error: `Unsupported provider: ${provider}` };
      }
      
      const url = `${config.baseUrl}${config.orderStatusUrl}`.replace('{orderId}', orderId);
      
      const response = await fetchApi<any>(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
        ActionType.GET_ORDER_STATUS
      );
      
      if (response && response.status) {
        // Convert API response to our OrderStatus format
        const orderStatus: OrderStatus = {
          orderId: response.order_id,
          status: response.status,
          estimatedDelivery: response.estimated_delivery,
          trackingInfo: response.tracking_info,
        };
        
        return {
          success: true,
          status: orderStatus,
        };
      }
      
      return {
        success: false,
        error: 'Failed to get order status',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
}; 