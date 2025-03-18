import { useOrderTracking } from '@/hooks/useOrderTracking';
import { usePlasticCollection } from '@/hooks/usePlasticCollection';
import { RootStackParamList } from '@/navigation/types';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock hooks
jest.mock('@/hooks/useOrderTracking', () => ({
  useOrderTracking: jest.fn()
}));

jest.mock('@/hooks/usePlasticCollection', () => ({
  usePlasticCollection: jest.fn()
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn().mockReturnValue({
    key: 'Orders',
    index: 0,
    routeNames: ['Orders'],
    routes: [{ name: 'Orders' }],
    type: 'stack',
    stale: false
  }),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  navigateDeprecated: jest.fn(),
  preload: jest.fn(),
  setStateForNextRouteNamesChange: jest.fn(),
} as unknown as NativeStackNavigationProp<RootStackParamList, 'Orders'>;

// Sample mock data
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ECO-2024-001',
    status: 'in_progress',
    deliveryTime: '2024-03-20T14:30:00Z',
    totalAmount: 249.99,
    plasticPickup: {
      scheduled: true,
      estimatedWeight: 2.5,
      status: 'pending',
      credits: 25
    },
    deliveryPersonnel: {
      id: 'DEL-001',
      name: 'John Doe',
      phone: '+27123456789'
    },
    items: [
      { id: '1', name: 'Organic Milk', quantity: 2 },
      { id: '2', name: 'Eco-friendly Detergent', quantity: 1 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ECO-2024-002',
    status: 'completed',
    deliveryTime: '2024-03-19T10:00:00Z',
    totalAmount: 189.99,
    plasticPickup: {
      scheduled: true,
      actualWeight: 3.2,
      status: 'completed',
      credits: 32
    }
  }
];

describe('OrdersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOrderTracking as jest.Mock).mockReturnValue({
      orders: mockOrders,
      isLoading: false,
      error: null,
      refreshOrders: jest.fn()
    });
    (usePlasticCollection as jest.Mock).mockReturnValue({
      updatePickupStatus: jest.fn(),
      calculateCredits: jest.fn()
    });
  });

  it('renders orders list correctly', () => {
    const { getByText, getAllByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByText('ECO-2024-001')).toBeTruthy();
    expect(getByText('ECO-2024-002')).toBeTruthy();
    expect(getAllByTestId('order-card')).toHaveLength(2);
  });

  it('displays correct order status with appropriate styling', () => {
    const { getByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    const inProgressStatus = getByTestId('status-in_progress');
    const completedStatus = getByTestId('status-completed');

    expect(inProgressStatus).toHaveStyle({ backgroundColor: '#FFA500' });
    expect(completedStatus).toHaveStyle({ backgroundColor: '#4CAF50' });
  });

  it('shows plastic pickup information when scheduled', () => {
    const { getByText, getAllByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    const plasticPickupBadges = getAllByTestId('plastic-pickup-badge');
    expect(plasticPickupBadges).toHaveLength(2);
    expect(getByText('2.5 kg expected')).toBeTruthy();
    expect(getByText('3.2 kg collected')).toBeTruthy();
  });

  it('handles tab switching correctly', async () => {
    const { getByText, queryByText } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    // Switch to completed tab
    fireEvent.press(getByText('Completed'));
    await waitFor(() => {
      expect(queryByText('ECO-2024-001')).toBeNull();
      expect(queryByText('ECO-2024-002')).toBeTruthy();
    });

    // Switch back to in progress
    fireEvent.press(getByText('In Progress'));
    await waitFor(() => {
      expect(queryByText('ECO-2024-001')).toBeTruthy();
      expect(queryByText('ECO-2024-002')).toBeNull();
    });
  });

  it('shows delivery personnel information for in-progress orders', () => {
    const { getByText, getByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByTestId('call-driver-button')).toBeTruthy();
  });

  it('displays earned credits for completed pickups', () => {
    const { getByText } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByText('32 credits earned')).toBeTruthy();
  });

  it('handles refresh functionality', async () => {
    const mockRefreshOrders = jest.fn();
    (useOrderTracking as jest.Mock).mockReturnValue({
      orders: mockOrders,
      isLoading: false,
      error: null,
      refreshOrders: mockRefreshOrders
    });

    const { getByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    fireEvent.scroll(getByTestId('orders-list'), {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000, width: 100 },
        layoutMeasurement: { height: 500, width: 100 },
        zoomScale: 1,
        timestamp: 10,
      },
    });
    expect(mockRefreshOrders).toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      orders: [],
      isLoading: true,
      error: null,
      refreshOrders: jest.fn()
    });

    const { getByTestId } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('handles error states appropriately', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      orders: [],
      isLoading: false,
      error: 'Failed to fetch orders',
      refreshOrders: jest.fn()
    });

    const { getByText } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByText('Failed to fetch orders')).toBeTruthy();
    expect(getByText('Tap to retry')).toBeTruthy();
  });

  it('shows empty state message when no orders', () => {
    (useOrderTracking as jest.Mock).mockReturnValue({
      orders: [],
      isLoading: false,
      error: null,
      refreshOrders: jest.fn()
    });

    const { getByText } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    expect(getByText('No orders found')).toBeTruthy();
  });

  it('provides accessibility labels for interactive elements', () => {
    const { getAllByRole } = render(
      <OrdersScreen navigation={mockNavigation} />
    );

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button).toHaveProperty('accessibilityLabel');
    });
  });
}); 