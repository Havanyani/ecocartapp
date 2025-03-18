import { DeliveryStop, Location } from '@/types/delivery';

describe('DeliveryRouteOptimizer', () => {
  const mockStartLocation: Location = {
    latitude: -33.9249,
    longitude: 18.4241,
    altitude: null,
    timestamp: 0,
    accuracy: null,
    altitudeAccuracy: null,
    speed: null,
    heading: null
  };

  const mockEndLocation: Location = {
    ...mockStartLocation,
    latitude: -33.9169,
    longitude: 18.4182
  };

  const mockDeliveryStops: DeliveryStop[] = [
    {
      id: '1',
      location: {
        ...mockStartLocation,
        latitude: -33.9230,
        longitude: 18.4220
      },
      timeWindow: {
        start: new Date('2024-03-20T09:00:00Z'),
        end: new Date('2024-03-20T10:00:00Z')
      },
      customerName: 'John Doe',
      orderDetails: { orderId: '123' }
    }
  ];
}); 