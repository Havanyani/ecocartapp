import { DeliveryPersonnel, DeliveryPersonnelSearchParams, DeliveryStatus, DeliveryStatusUpdateParams } from '@/types/DeliveryPersonnel';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.ecocart.com';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const deliveryPersonnelApi = {
  searchPersonnel: (params: DeliveryPersonnelSearchParams): Promise<DeliveryPersonnel[]> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.rating) queryParams.append('rating', params.rating.toString());
    if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
    if (params.location) {
      queryParams.append('latitude', params.location.latitude.toString());
      queryParams.append('longitude', params.location.longitude.toString());
      queryParams.append('radius', params.location.radius.toString());
    }

    return fetchApi<DeliveryPersonnel[]>(`/delivery-personnel?${queryParams.toString()}`);
  },

  getPersonnelById: (personnelId: string): Promise<DeliveryPersonnel> => {
    return fetchApi<DeliveryPersonnel>(`/delivery-personnel/${personnelId}`);
  },

  updatePersonnelStatus: (personnelId: string, status: DeliveryPersonnel['status']): Promise<DeliveryPersonnel> => {
    return fetchApi<DeliveryPersonnel>(`/delivery-personnel/${personnelId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updatePersonnelLocation: (
    personnelId: string,
    location: DeliveryPersonnel['currentLocation']
  ): Promise<DeliveryPersonnel> => {
    return fetchApi<DeliveryPersonnel>(`/delivery-personnel/${personnelId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ location }),
    });
  },

  getDeliveryStatus: (orderId: string): Promise<DeliveryStatus> => {
    return fetchApi<DeliveryStatus>(`/delivery-status/${orderId}`);
  },

  updateDeliveryStatus: (params: DeliveryStatusUpdateParams): Promise<DeliveryStatus> => {
    return fetchApi<DeliveryStatus>('/delivery-status', {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  },

  assignDelivery: (orderId: string, personnelId: string): Promise<DeliveryStatus> => {
    return fetchApi<DeliveryStatus>('/delivery-status/assign', {
      method: 'POST',
      body: JSON.stringify({ orderId, personnelId }),
    });
  },
}; 