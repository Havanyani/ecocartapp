import { ThemeProvider } from '@/context/ThemeContext';
import deliveryPersonnelReducer from '@/store/slices/deliveryPersonnelSlice';
import { DeliveryPersonnel } from '@/types/DeliveryPersonnel';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { DeliveryPersonnelList } from '../DeliveryPersonnelList';

const mockPersonnel: DeliveryPersonnel[] = [
  {
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
  },
  {
    id: '2',
    name: 'Jane Smith',
    phoneNumber: '+1987654321',
    email: 'jane@example.com',
    status: 'ON_DELIVERY' as const,
    currentLocation: {
      latitude: 37.7833,
      longitude: -122.4167,
      timestamp: new Date(),
    },
    rating: 4.8,
    totalDeliveries: 150,
    activeDeliveries: ['order3'],
    vehicle: {
      type: 'CAR',
      registrationNumber: 'CAR456',
      capacity: 20,
    },
  },
];

const mockStore = configureStore({
  reducer: {
    deliveryPersonnel: deliveryPersonnelReducer,
  },
  preloadedState: {
    deliveryPersonnel: {
      personnel: mockPersonnel,
      selectedPersonnel: null,
      deliveryStatuses: {},
      isLoading: false,
      error: null,
    },
  },
});

describe('DeliveryPersonnelList', () => {
  it('renders loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        deliveryPersonnel: deliveryPersonnelReducer,
      },
      preloadedState: {
        deliveryPersonnel: {
          personnel: [],
          selectedPersonnel: null,
          deliveryStatuses: {},
          isLoading: true,
          error: null,
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={loadingStore}>
        <ThemeProvider>
          <DeliveryPersonnelList />
        </ThemeProvider>
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders error state', () => {
    const errorStore = configureStore({
      reducer: {
        deliveryPersonnel: deliveryPersonnelReducer,
      },
      preloadedState: {
        deliveryPersonnel: {
          personnel: [],
          selectedPersonnel: null,
          deliveryStatuses: {},
          isLoading: false,
          error: 'Failed to load personnel',
        },
      },
    });

    const { getByText } = render(
      <Provider store={errorStore}>
        <ThemeProvider>
          <DeliveryPersonnelList />
        </ThemeProvider>
      </Provider>
    );

    expect(getByText('Failed to load personnel')).toBeTruthy();
  });

  it('renders personnel list', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ThemeProvider>
          <DeliveryPersonnelList />
        </ThemeProvider>
      </Provider>
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('BIKE • BIKE123')).toBeTruthy();
    expect(getByText('CAR • CAR456')).toBeTruthy();
  });

  it('handles search input', async () => {
    const { getByPlaceholderText } = render(
      <Provider store={mockStore}>
        <ThemeProvider>
          <DeliveryPersonnelList />
        </ThemeProvider>
      </Provider>
    );

    const searchInput = getByPlaceholderText('Search delivery personnel...');
    fireEvent.changeText(searchInput, 'John');

    await waitFor(() => {
      expect(searchInput.props.value).toBe('John');
    });
  });

  it('calls onPersonnelSelect when personnel is selected', () => {
    const onPersonnelSelect = jest.fn();
    const { getByText } = render(
      <Provider store={mockStore}>
        <ThemeProvider>
          <DeliveryPersonnelList onPersonnelSelect={onPersonnelSelect} />
        </ThemeProvider>
      </Provider>
    );

    fireEvent.press(getByText('John Doe'));

    expect(onPersonnelSelect).toHaveBeenCalledWith(mockPersonnel[0]);
  });

  it('displays correct status colors', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ThemeProvider>
          <DeliveryPersonnelList />
        </ThemeProvider>
      </Provider>
    );

    const availableStatus = getByText('AVAILABLE');
    const onDeliveryStatus = getByText('ON DELIVERY');

    expect(availableStatus.props.style[1].color).toBe('#34C759'); // success color
    expect(onDeliveryStatus.props.style[1].color).toBe('#FF9500'); // warning color
  });
}); 