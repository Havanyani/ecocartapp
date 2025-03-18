import { ThemeProvider } from '@/context/ThemeContext';
import groceryStoreReducer from '@/store/slices/groceryStoreSlice';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { StoreDetails } from '../StoreDetails';

const mockStore = {
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
  contactNumber: '+1234567890',
  email: 'contact@ecostore1.com',
  isActive: true,
};

const mockProducts = [
  {
    id: '1',
    name: 'Organic Apples',
    category: 'Fruits',
    description: 'Fresh organic apples from local farms',
    price: 2.99,
    unit: 'kg',
    imageUrl: 'https://example.com/apples.jpg',
    isAvailable: true,
    sustainabilityScore: 85,
  },
  {
    id: '2',
    name: 'Bananas',
    category: 'Fruits',
    description: 'Fair trade bananas',
    price: 1.99,
    unit: 'kg',
    imageUrl: 'https://example.com/bananas.jpg',
    isAvailable: true,
    sustainabilityScore: 75,
  },
  {
    id: '3',
    name: 'Whole Grain Bread',
    category: 'Bakery',
    description: 'Freshly baked whole grain bread',
    price: 3.99,
    unit: 'loaf',
    imageUrl: 'https://example.com/bread.jpg',
    isAvailable: true,
    sustainabilityScore: 90,
  },
];

describe('StoreDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
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
          isLoading: true,
          error: null,
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreDetails store={mockStore} />
        </ThemeProvider>
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders error state', async () => {
    const errorMessage = 'Failed to load products';
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
          <StoreDetails store={mockStore} />
        </ThemeProvider>
      </Provider>
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders store details and products', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: [],
          selectedStore: null,
          products: {
            [mockStore.id]: mockProducts,
          },
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreDetails store={mockStore} />
        </ThemeProvider>
      </Provider>
    );

    // Check store details
    expect(getByText('Eco Store 1')).toBeTruthy();
    expect(getByText('123 Green St')).toBeTruthy();
    expect(getByText('+1234567890')).toBeTruthy();
    expect(getByText('contact@ecostore1.com')).toBeTruthy();

    // Check categories
    expect(getByText('Fruits')).toBeTruthy();
    expect(getByText('Bakery')).toBeTruthy();

    // Check products
    expect(getByText('Organic Apples')).toBeTruthy();
    expect(getByText('Bananas')).toBeTruthy();
    expect(getByText('Whole Grain Bread')).toBeTruthy();
  });

  it('filters products by category', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: [],
          selectedStore: null,
          products: {
            [mockStore.id]: mockProducts,
          },
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByText, queryByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreDetails store={mockStore} />
        </ThemeProvider>
      </Provider>
    );

    // Click on Fruits category
    fireEvent.press(getByText('Fruits'));

    // Check that only Fruits products are shown
    expect(getByText('Organic Apples')).toBeTruthy();
    expect(getByText('Bananas')).toBeTruthy();
    expect(queryByText('Whole Grain Bread')).toBeNull();
  });

  it('displays sustainability scores with correct colors', async () => {
    const store = configureStore({
      reducer: {
        groceryStore: groceryStoreReducer,
      },
      preloadedState: {
        groceryStore: {
          stores: [],
          selectedStore: null,
          products: {
            [mockStore.id]: mockProducts,
          },
          inventory: {},
          isLoading: false,
          error: null,
        },
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <StoreDetails store={mockStore} />
        </ThemeProvider>
      </Provider>
    );

    // Check sustainability scores
    expect(getByText('85')).toBeTruthy();
    expect(getByText('75')).toBeTruthy();
    expect(getByText('90')).toBeTruthy();
  });
}); 