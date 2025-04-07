import { ThemeProvider } from '@/providers/ThemeProvider';
import MaterialDetailScreen from '@/screens/materials/MaterialDetailScreen';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Share } from 'react-native';

// Mock the native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
}));

// Mock the navigation and route
const mockNavigation = {
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    id: 'material-1',
    material: {
      id: 'material-1',
      name: 'Cardboard',
      description: 'Recyclable cardboard packaging',
      category: 'Paper Products',
      recyclingRate: 75,
      acceptedForms: ['Boxes', 'Packaging', 'Cardboard tubes'],
      isHazardous: false,
      imageUrl: 'https://example.com/cardboard.jpg',
    }
  }
};

// Mock the theme hook
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000000',
        textSecondary: '#666666',
        background: '#FFFFFF',
        card: '#F5F5F5',
        border: '#E0E0E0',
        primary: '#2E7D32',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        white: '#FFFFFF',
        black: '#000000',
      },
      dark: false,
    },
    toggleTheme: jest.fn(),
  }),
  getColor: (theme: any, color: string) => theme.colors[color],
  getSpacing: (theme: any, spacing: string) => 8,
}));

// Mock the API hook
jest.mock('@/api/MaterialsApi', () => ({
  useMaterials: () => ({
    getMaterial: jest.fn(() => Promise.resolve({
      id: 'material-1',
      name: 'Cardboard',
      description: 'Recyclable cardboard packaging',
      category: 'Paper Products',
      recyclingRate: 75,
      acceptedForms: ['Boxes', 'Packaging', 'Cardboard tubes'],
      isHazardous: false,
      imageUrl: 'https://example.com/cardboard.jpg',
    })),
  }),
  Material: jest.requireActual('@/api/MaterialsApi').Material,
}));

// Mock the network status hook
jest.mock('@/hooks/useNetworkStatus', () => ({
  __esModule: true,
  default: () => ({
    isOnline: true,
  }),
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: { name: string; size: number; color: string }) => (
    `<Ionicons name="${name}" size={${size}} color="${color}" />`
  ),
}));

describe('MaterialDetailScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders material details when material is provided in route params', () => {
    render(
      <ThemeProvider>
        <MaterialDetailScreen 
          route={mockRoute} 
          navigation={mockNavigation} 
        />
      </ThemeProvider>
    );

    // Check that main content sections are rendered
    expect(screen.getByText('Cardboard')).toBeTruthy();
    expect(screen.getByText('Paper Products')).toBeTruthy();
    expect(screen.getByText('Recycling Rate')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Description')).toBeTruthy();
    expect(screen.getByText('Recyclable cardboard packaging')).toBeTruthy();
    expect(screen.getByText('Accepted Forms')).toBeTruthy();
    expect(screen.getByText('Boxes')).toBeTruthy();
    expect(screen.getByText('Packaging')).toBeTruthy();
    expect(screen.getByText('Cardboard tubes')).toBeTruthy();
    expect(screen.getByText('Recycling Instructions')).toBeTruthy();
  });

  it('handles the share action when share button is pressed', async () => {
    render(
      <ThemeProvider>
        <MaterialDetailScreen 
          route={mockRoute} 
          navigation={mockNavigation} 
        />
      </ThemeProvider>
    );

    // Find and press the share button
    const shareButton = screen.getByRole('button', { name: /share-outline/i });
    fireEvent.press(shareButton);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        title: 'Cardboard',
        message: expect.stringContaining('Check out how to recycle Cardboard:'),
      });
    });
  });

  it('navigates back when back button is pressed', () => {
    render(
      <ThemeProvider>
        <MaterialDetailScreen 
          route={mockRoute} 
          navigation={mockNavigation} 
        />
      </ThemeProvider>
    );

    // Find and press the back button
    const backButton = screen.getByRole('button', { name: /arrow-back/i });
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows hazardous warning for hazardous materials', () => {
    const hazardousMockRoute = {
      params: {
        id: 'material-2',
        material: {
          ...mockRoute.params.material,
          id: 'material-2',
          name: 'Battery',
          isHazardous: true,
        }
      }
    };

    render(
      <ThemeProvider>
        <MaterialDetailScreen 
          route={hazardousMockRoute} 
          navigation={mockNavigation} 
        />
      </ThemeProvider>
    );

    expect(screen.getByText('This material is hazardous and requires special handling')).toBeTruthy();
    expect(screen.getByText('This item requires special disposal. Do not place in regular recycling bins.')).toBeTruthy();
  });
}); 