import { DeliverySlot, GroceryIntegrationConfig, GroceryStore, InventoryItem, OrderStatus, Product, ProductSearchParams, StoreSearchParams } from '@/types/GroceryStore';
import { OfflineQueueManager } from '@/utils/OfflineQueueManager';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';

// Default configuration for different grocery store APIs
const GROCERY_INTEGRATIONS: Record<string, GroceryIntegrationConfig> = {
  'checkers_sixty60': {
    baseUrl: 'https://api.sixty60.co.za',
    apiVersion: 'v2',
    endpoints: {
      stores: '/stores',
      products: '/products',
      delivery: '/delivery-slots',
      orders: '/orders',
      auth: '/auth',
    },
    authType: 'bearer',
  },
  'default': {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.ecocart.com',
    apiVersion: 'v1',
    endpoints: {
      stores: '/stores',
      products: '/products',
      delivery: '/delivery-slots',
      orders: '/orders',
      auth: '/auth',
    },
    authType: 'bearer',
  },
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}, provider = 'default'): Promise<T> {
  const integration = GROCERY_INTEGRATIONS[provider] || GROCERY_INTEGRATIONS.default;
  const baseUrl = integration.baseUrl;
  const apiVersion = integration.apiVersion;
  
  const url = `${baseUrl}/${apiVersion}${endpoint}`;
  
  try {
    const traceId = PerformanceMonitor.startTrace(`grocery_api_${endpoint.split('/')[1]}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    PerformanceMonitor.endTrace(traceId, `grocery_api_${endpoint.split('/')[1]}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        })
      );
    }

    return response.json();
  } catch (error) {
    // We can't end a trace that doesn't exist, so skip this in the catch block
    
    if (!navigator.onLine) {
      // If eligible for offline queuing, add to queue
      if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
        await OfflineQueueManager.addToQueue({
          type: 'CREATE_ORDER', // Use an existing ActionType that makes sense
          payload: { endpoint, options, provider },
        });
      }
    }
    
    PerformanceMonitor.captureError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

export const groceryStoreApi = {
  // Authentication
  authenticate: (
    credentials: { username: string; password: string }, 
    provider = 'default'
  ): Promise<{ token: string; expiresIn: number }> => {
    return fetchApi<{ token: string; expiresIn: number }>(
      GROCERY_INTEGRATIONS[provider]?.endpoints.auth || '/auth',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      provider
    );
  },

  // Store operations
  searchStores: (params: StoreSearchParams, provider = 'default'): Promise<GroceryStore[]> => {
    const queryParams = new URLSearchParams();
    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.query) queryParams.append('query', params.query);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return fetchApi<GroceryStore[]>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.stores || '/stores'}?${queryParams.toString()}`,
      {},
      provider
    );
  },

  getStoreById: (storeId: string, provider = 'default'): Promise<GroceryStore> => {
    return fetchApi<GroceryStore>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.stores || '/stores'}/${storeId}`,
      {},
      provider
    );
  },

  // Product operations
  searchProducts: (params: ProductSearchParams, provider = 'default'): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.query) queryParams.append('query', params.query);
    if (params.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());
    if (params.storeId) queryParams.append('storeId', params.storeId);

    return fetchApi<Product[]>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.products || '/products'}?${queryParams.toString()}`,
      {},
      provider
    );
  },

  getProductById: (productId: string, storeId?: string, provider = 'default'): Promise<Product> => {
    const endpoint = storeId 
      ? `${GROCERY_INTEGRATIONS[provider]?.endpoints.stores || '/stores'}/${storeId}/products/${productId}`
      : `${GROCERY_INTEGRATIONS[provider]?.endpoints.products || '/products'}/${productId}`;
    
    return fetchApi<Product>(endpoint, {}, provider);
  },

  // Inventory operations
  getInventory: (productId: string, storeId: string, provider = 'default'): Promise<InventoryItem> => {
    return fetchApi<InventoryItem>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.stores || '/stores'}/${storeId}/products/${productId}/inventory`,
      {},
      provider
    );
  },

  getStoreInventory: (storeId: string, provider = 'default'): Promise<InventoryItem[]> => {
    return fetchApi<InventoryItem[]>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.stores || '/stores'}/${storeId}/inventory`,
      {},
      provider
    );
  },

  // Delivery operations
  getDeliverySlots: (
    params: { date?: string; address?: string; storeId?: string }, 
    provider = 'default'
  ): Promise<DeliverySlot[]> => {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.address) queryParams.append('address', params.address);
    if (params.storeId) queryParams.append('storeId', params.storeId);

    return fetchApi<DeliverySlot[]>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.delivery || '/delivery-slots'}?${queryParams.toString()}`,
      {},
      provider
    );
  },

  // Order operations
  getOrderStatus: (orderId: string, provider = 'default'): Promise<OrderStatus> => {
    return fetchApi<OrderStatus>(
      `${GROCERY_INTEGRATIONS[provider]?.endpoints.orders || '/orders'}/${orderId}/status`,
      {},
      provider
    );
  },

  // Checkers Sixty60 specific operations
  checkersGetDeliveryEstimate: (
    address: string, 
    items: Array<{ productId: string; quantity: number }>
  ): Promise<{ estimatedDeliveryTime: string; deliveryFee: number }> => {
    return fetchApi<{ estimatedDeliveryTime: string; deliveryFee: number }>(
      `${GROCERY_INTEGRATIONS['checkers_sixty60']?.endpoints.delivery || '/delivery-slots'}/estimate`,
      {
        method: 'POST',
        body: JSON.stringify({ address, items }),
      },
      'checkers_sixty60'
    );
  },

  // Get integration configuration
  getIntegrationConfig: (provider: string): GroceryIntegrationConfig => {
    return GROCERY_INTEGRATIONS[provider] || GROCERY_INTEGRATIONS.default;
  },
}; 