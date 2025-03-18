import { ThemeProvider } from '@/context/ThemeContext';
import groceryStoreReducer from '@/store/slices/groceryStoreSlice';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { StoreList } from '../StoreList';

const mockStore = configureStore({
  reducer: {
    groceryStore: groceryStoreReducer,
  },
});

const mockStores = [
  {
    id: '1',
    name: 'Eco Store 1',
    address: '123 Green St',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    operatingHours: [
      {
        day: 'MONDAY',
        open: '09:00',
        close: '17:00',
      },
    ],
    isActive: true,
  },
  {
    id: '2',
    name: 'Eco Store 2',
    address: '456 Sustainable Ave',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
    },
    operatingHours: [
      {
        day: 'MONDAY',
        open: '09:00',
        close: '17:00',
      },
    ],
    isActive: true,
  },
];

describe('StoreList', () => {
  const mockOnStoreSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ThemeProvider>
          <StoreList onStoreSelect={mockOnStoreSelect} />
        </ThemeProvider>
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders error state', async () => {
    const errorMessage = 'Failed to load stores';
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: [],
          selectedStore: null,
          products: {},
          inventory: {},
          isLoading: false,
          error: errorMessage,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreList onStoreSelect={mockOnStoreSelect} />
        </ThemeProvider>
      </Provider>
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders store list', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: mockStores,
          selectedStore: null,
          products: {},
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreList onStoreSelect={mockOnStoreSelect} />
        </ThemeProvider>
      </Provider>
    );

    expect(getByText('Eco Store 1')).toBeTruthy();
    expect(getByText('Eco Store 2')).toBeTruthy();
  });

  it('handles store selection', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: mockStores,
          selectedStore: null,
          products: {},
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreList onStoreSelect={mockOnStoreSelect} />
        </ThemeProvider>
      </Provider>
    );

    fireEvent.press(getByText('Eco Store 1'));
    expect(mockOnStoreSelect).toHaveBeenCalledWith(mockStores[0]);
  });

  it('handles search', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: mockStores,
          selectedStore: null,
          products: {},
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreList onStoreSelect={mockOnStoreSelect} />
        </ThemeProvider>
      </Provider>
    );

    const searchInput = getByPlaceholderText('Search stores...');
    fireEvent.changeText(searchInput, 'Eco');

    await waitFor(() => {
      expect(store.getState().groceryStore.stores).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining('Eco'),
          }),
        ])
      );
    });
  });
}); 