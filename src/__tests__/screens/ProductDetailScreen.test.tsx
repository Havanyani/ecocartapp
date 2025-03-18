import { useCart } from '@/hooks/useCart';
import { RootStackParamList } from '@/navigation/types';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fireEvent, render } from '@testing-library/react-native';

// Mock the hooks
jest.mock('@/hooks/useCart');
jest.mock('@react-navigation/native');

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  navigateDeprecated: jest.fn(),
  preload: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(),
  dangerouslyGetParent: jest.fn(),
  dangerouslyGetState: jest.fn(),
  dangerouslyGetIndex: jest.fn(),
} as unknown as StackNavigationProp<RootStackParamList, 'ProductDetail'>;

// Mock product data
const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 9.99,
  description: 'Test Description',
  image: 'test-image.jpg',
  category: 'Test Category',
  stock: 10,
  ecoFriendly: {
    isEcoFriendly: true,
    packagingType: 'recyclable' as const,
    plasticReduction: 50
  },
  nutritionInfo: {
    calories: 100,
    protein: 10,
    carbs: 20,
    fat: 5
  },
  ratings: {
    average: 4.5,
    count: 100
  }
};

// Mock route with proper type
const mockRoute = {
  key: 'ProductDetail',
  name: 'ProductDetail',
  params: {
    product: mockProduct
  }
} as unknown as RouteProp<RootStackParamList, 'ProductDetail'>;

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({
      addToCart: jest.fn()
    });
  });

  it('renders product details correctly', () => {
    const { getByText, getByTestId } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Organic Milk')).toBeTruthy();
    expect(getByText('R 24.99')).toBeTruthy();
    expect(getByText('Fresh organic milk in eco-friendly packaging')).toBeTruthy();
    expect(getByText('4.5 (128 reviews)')).toBeTruthy();
  });

  it('displays eco-friendly badge for eligible products', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Eco-Friendly Product')).toBeTruthy();
  });

  it('handles quantity changes correctly', () => {
    const { getByLabelText, getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    const increaseButton = getByLabelText('Increase quantity');
    const decreaseButton = getByLabelText('Decrease quantity');

    fireEvent.press(increaseButton);
    expect(getByText('2')).toBeTruthy();

    fireEvent.press(decreaseButton);
    expect(getByText('1')).toBeTruthy();

    // Shouldn't go below 1
    fireEvent.press(decreaseButton);
    expect(getByText('1')).toBeTruthy();
  });

  it('displays all packaging options', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Standard Packaging')).toBeTruthy();
    expect(getByText('Recyclable')).toBeTruthy();
    expect(getByText('Biodegradable')).toBeTruthy();
    expect(getByText('Reusable Container')).toBeTruthy();
  });

  it('calculates total price with packaging option', () => {
    const { getByText, getByLabelText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Select recyclable packaging (+R2)
    fireEvent.press(getByText('Recyclable'));
    
    // Increase quantity to 2
    fireEvent.press(getByLabelText('Increase quantity'));

    // Base price: 24.99 * 2 + packaging: 2 * 2
    expect(getByText('R 53.98')).toBeTruthy();
  });

  it('shows environmental impact information', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText(/helping reduce plastic waste/)).toBeTruthy();
  });

  it('displays nutrition information when available', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Nutrition Information')).toBeTruthy();
    expect(getByText('120')).toBeTruthy(); // Calories
    expect(getByText('8g')).toBeTruthy(); // Protein
    expect(getByText('12g')).toBeTruthy(); // Carbs
    expect(getByText('4g')).toBeTruthy(); // Fat
  });

  it('handles add to cart action', () => {
    const mockAddToCart = jest.fn();
    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart
    });

    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.press(getByText('Add to Cart'));

    expect(mockAddToCart).toHaveBeenCalledWith(
      mockProduct,
      1, // quantity
      'standard' // default packaging
    );
  });

  it('updates environmental impact based on packaging selection', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Select reusable packaging (50% reduction)
    fireEvent.press(getByText('Reusable Container'));

    expect(getByText(/reduce plastic waste by 50%/)).toBeTruthy();
  });

  it('handles products without nutrition info', () => {
    const productWithoutNutrition = {
      ...mockProduct,
      nutritionInfo: undefined
    };

    const { queryByText } = render(
      <ProductDetailScreen 
        route={{
          key: 'ProductDetail',
          name: 'ProductDetail',
          params: { product: productWithoutNutrition }
        }} 
        navigation={mockNavigation} 
      />
    );

    expect(queryByText('Nutrition Information')).toBeNull();
  });

  it('shows correct additional costs for eco-friendly packaging', () => {
    const { getByText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    fireEvent.press(getByText('Reusable Container'));
    expect(getByText('+R 5.00')).toBeTruthy();
  });

  it('maintains selected packaging when changing quantity', async () => {
    const { getByText, getByLabelText } = render(
      <ProductDetailScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Select reusable packaging
    fireEvent.press(getByText('Reusable Container'));
    
    // Increase quantity
    fireEvent.press(getByLabelText('Increase quantity'));

    // Should still show reusable packaging info
    expect(getByText(/reusable container/i)).toBeTruthy();
  });
}); 