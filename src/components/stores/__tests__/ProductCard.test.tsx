import { ThemeProvider } from '@/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Organic Apples',
  category: 'Fruits',
  description: 'Fresh organic apples from local farms',
  price: 2.99,
  unit: 'kg',
  imageUrl: 'https://example.com/apples.jpg',
  isAvailable: true,
  sustainabilityScore: 85,
};

describe('ProductCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ProductCard product={mockProduct} />
      </ThemeProvider>
    );

    expect(getByText('Organic Apples')).toBeTruthy();
    expect(getByText('Fruits')).toBeTruthy();
    expect(getByText('Fresh organic apples from local farms')).toBeTruthy();
    expect(getByText('$2.99')).toBeTruthy();
    expect(getByText('kg')).toBeTruthy();
    expect(getByText('85')).toBeTruthy();
  });

  it('renders product without description', () => {
    const productWithoutDescription = {
      ...mockProduct,
      description: undefined,
    };

    const { queryByText } = render(
      <ThemeProvider>
        <ProductCard product={productWithoutDescription} />
      </ThemeProvider>
    );

    expect(queryByText('Fresh organic apples from local farms')).toBeNull();
  });

  it('renders product without sustainability score', () => {
    const productWithoutScore = {
      ...mockProduct,
      sustainabilityScore: undefined,
    };

    const { queryByText } = render(
      <ThemeProvider>
        <ProductCard product={productWithoutScore} />
      </ThemeProvider>
    );

    expect(queryByText('85')).toBeNull();
  });

  it('renders product without image', () => {
    const productWithoutImage = {
      ...mockProduct,
      imageUrl: undefined,
    };

    const { queryByTestId } = render(
      <ThemeProvider>
        <ProductCard product={productWithoutImage} />
      </ThemeProvider>
    );

    expect(queryByTestId('product-image')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ProductCard product={mockProduct} onPress={mockOnPress} />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('product-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  it('displays correct sustainability badge color based on score', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ProductCard product={mockProduct} />
      </ThemeProvider>
    );

    const badge = getByTestId('sustainability-badge');
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#4CAF50', // Green for score >= 80
      })
    );
  });

  it('displays yellow badge for medium sustainability score', () => {
    const mediumScoreProduct = {
      ...mockProduct,
      sustainabilityScore: 75,
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <ProductCard product={mediumScoreProduct} />
      </ThemeProvider>
    );

    const badge = getByTestId('sustainability-badge');
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#FFC107', // Yellow for score >= 60
      })
    );
  });

  it('displays red badge for low sustainability score', () => {
    const lowScoreProduct = {
      ...mockProduct,
      sustainabilityScore: 55,
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <ProductCard product={lowScoreProduct} />
      </ThemeProvider>
    );

    const badge = getByTestId('sustainability-badge');
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#F44336', // Red for score < 60
      })
    );
  });
}); 