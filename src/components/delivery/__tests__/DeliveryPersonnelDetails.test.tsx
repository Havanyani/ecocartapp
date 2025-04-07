import { useDeliveryPersonnel } from '@/hooks/useDeliveryPersonnel';
import { useTheme } from '@/theme';
import deliveryPersonnelReducer from '@/store/slices/deliveryPersonnelSlice';
import { DeliveryPersonnel, DeliveryStatus } from '@/types/DeliveryPersonnel';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import { DeliveryPersonnelDetails } from '../DeliveryPersonnelDetails';
import { NotificationHistory } from '../NotificationHistory';

const mockPersonnel: DeliveryPersonnel = {
  id: '1',
  name: 'John Doe',
  phoneNumber: '+1234567890',
  email: 'john@example.com',
  status: 'AVAILABLE' as const,
  currentLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date(),
  },
  rating: 4.5,
  totalDeliveries: 100,
  activeDeliveries: ['order1', 'order2'],
  vehicle: {
    type: 'BIKE',
    registrationNumber: 'BIKE123',
    capacity: 10,
  },
};

const mockDeliveryStatuses: Record<string, DeliveryStatus> = {
  order1: {
    orderId: 'order1',
    personnelId: '1',
    status: 'IN_TRANSIT',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date(),
    },
    estimatedDeliveryTime: new Date(),
    notes: 'On the way to customer',
  },
  order2: {
    orderId: 'order2',
    personnelId: '1',
    status: 'PICKED_UP',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      timestamp: new Date(),
    },
    estimatedDeliveryTime: new Date(),
    notes: 'Picked up from store',
  },
};

const mockStore = configureStore({
  reducer: {
    deliveryPersonnel: deliveryPersonnelReducer,
  },
  preloadedState: {
    deliveryPersonnel: {
      personnel: [],
      selectedPersonnel: null,
      deliveryStatuses: mockDeliveryStatuses,
      isLoading: false,
      error: null,
    },
  },
});

// Mock the hooks
jest.mock('@/hooks/useDeliveryPersonnel', () => ({
  useDeliveryPersonnel: jest.fn(),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../NotificationHistory', () => ({
  NotificationHistory: jest.fn(),
}));

describe('DeliveryPersonnelDetails', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      border: '#E5E5EA',
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      text: '#000000',
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: mockPersonnel,
      isLoading: false,
      error: null,
    });
    (NotificationHistory as jest.Mock).mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: null,
      isLoading: true,
      error: null,
    });

    const { getByText } = render(<DeliveryPersonnelDetails personnelId="1" />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders error state', () => {
    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    const { getByText } = render(<DeliveryPersonnelDetails personnelId="1" />);
    expect(getByText('Error loading delivery personnel details')).toBeTruthy();
  });

  it('renders personnel details correctly', () => {
    const { getByText, getByTestId } = render(<DeliveryPersonnelDetails personnelId="1" />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Vehicle')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Active Deliveries')).toBeTruthy();
    expect(getByText('Notification Preferences')).toBeTruthy();
    expect(getByText('BIKE - BIKE123')).toBeTruthy();
    expect(getByText('37.7749, -122.4194')).toBeTruthy();
    expect(getByText('Delivery #1')).toBeTruthy();
    expect(getByText('in transit')).toBeTruthy();
    expect(getByTestId('status-indicator')).toBeTruthy();
  });

  it('renders empty state for active deliveries', () => {
    const personnelWithoutDeliveries = {
      ...mockPersonnel,
      activeDeliveries: [],
    };

    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: personnelWithoutDeliveries,
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<DeliveryPersonnelDetails personnelId="1" />);
    expect(getByText('No active deliveries')).toBeTruthy();
  });

  it('renders notification history component', () => {
    render(<DeliveryPersonnelDetails personnelId="1" />);
    expect(NotificationHistory).toHaveBeenCalledWith(
      { personnelId: '1' },
      expect.any(Object)
    );
  });

  it('displays correct status color based on personnel status', () => {
    const { getByTestId } = render(<DeliveryPersonnelDetails personnelId="1" />);
    const statusIndicator = getByTestId('status-indicator');

    // Test active status
    expect(statusIndicator.props.style).toContainEqual({
      backgroundColor: mockTheme.colors.success,
    });

    // Test inactive status
    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: { ...mockPersonnel, status: 'inactive' },
      isLoading: false,
      error: null,
    });
    const { getByTestId: getByTestIdInactive } = render(
      <DeliveryPersonnelDetails personnelId="1" />
    );
    expect(getByTestIdInactive('status-indicator').props.style).toContainEqual({
      backgroundColor: mockTheme.colors.error,
    });

    // Test on_delivery status
    (useDeliveryPersonnel as jest.Mock).mockReturnValue({
      personnel: { ...mockPersonnel, status: 'on_delivery' },
      isLoading: false,
      error: null,
    });
    const { getByTestId: getByTestIdOnDelivery } = render(
      <DeliveryPersonnelDetails personnelId="1" />
    );
    expect(getByTestIdOnDelivery('status-indicator').props.style).toContainEqual({
      backgroundColor: mockTheme.colors.warning,
    });
  });
}); 