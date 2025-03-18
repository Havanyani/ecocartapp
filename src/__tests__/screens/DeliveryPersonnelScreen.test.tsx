import { Alert } from 'react-native';

// Mock hooks
jest.mock('@/hooks/usePlasticCollection', () => ({
  usePlasticCollection: jest.fn()
}));

jest.mock('@/hooks/useDeliveryRoute', () => ({
  useDeliveryRoute: jest.fn()
}));

jest.mock('@/hooks/useLocation', () => ({
  useLocation: jest.fn()
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockPickups = [
  {
    id: '1',
    customerId: 'customer1',
    customerName: 'John Doe',
    address: '123 Main St',
    scheduledTime: '2024-03-20T14:30:00Z',
    status: 'pending',
    estimatedWeight: 2.5,
    notes: 'Ring doorbell twice',
    orderId: 'order1'
  },
  {
    id: '2',
    customerId: 'customer2',
    customerName: 'Jane Smith',
    address: '456 Oak Ave',
    scheduledTime: '2024-03-20T15:00:00Z',
    status: 'in_progress',
    estimatedWeight: 3.0,
    orderId: 'order2'
  }
];

const mockRoute = {
  totalDistance: 15.5,
  estimatedTime: 45,
  stops: [
    {
      id: '1',
      type: 'pickup',
      address: '123 Main St',
      scheduledTime: '2024-03-20T14:30:00'
    }
  ]
}; 