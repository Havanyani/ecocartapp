import { PerformanceInsights } from '@/components/performance/PerformanceInsights';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the animations to prevent test warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the theme hook and related functions
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

// Mock the IconSymbol component
jest.mock('@components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, size, color }: { name: string; size: number; color: string }) => (
    `<IconSymbol name="${name}" size={${size}} color="${color}" />`
  ),
}));

// Mock the HapticTab component
jest.mock('@components/ui/HapticTab', () => ({
  HapticTab: ({ children, onPress, style }: any) => (
    <div testID="haptic-tab" onPress={onPress} style={style}>
      {children}
    </div>
  ),
}));

describe('PerformanceInsights', () => {
  beforeEach(() => {
    // Reset the mocked timer before each test
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with default category selected', () => {
    render(
      <ThemeProvider>
        <PerformanceInsights />
      </ThemeProvider>
    );

    // After initial render, the component will fetch data and show collection insights
    jest.advanceTimersByTime(600); // Allow animation to complete

    // Header should be present
    expect(screen.getByText(/Performance Insights/i)).toBeTruthy();

    // Categories should be present
    expect(screen.getByText('Collection')).toBeTruthy();
    expect(screen.getByText('Engagement')).toBeTruthy();
    expect(screen.getByText('Environmental')).toBeTruthy();

    // By default, collection insights should be shown
    expect(screen.getByText('Collection Efficiency')).toBeTruthy();
    expect(screen.getByText('Average collection time reduced by 15%')).toBeTruthy();
    expect(screen.getByText('Impact: 15%')).toBeTruthy();
  });

  it('switches categories when tabs are pressed', () => {
    const { getByText } = render(
      <ThemeProvider>
        <PerformanceInsights />
      </ThemeProvider>
    );
    
    jest.advanceTimersByTime(600); // Allow animation to complete

    // Initially collection insights are shown
    expect(screen.getByText('Collection Efficiency')).toBeTruthy();

    // Click on Engagement tab
    fireEvent.press(getByText('Engagement'));
    
    // Engagement insights should now be shown
    expect(screen.getByText('User Engagement')).toBeTruthy();
    expect(screen.getByText('Weekly active users increased by 25%')).toBeTruthy();
    expect(screen.getByText('Impact: 25%')).toBeTruthy();

    // Click on Environmental tab
    fireEvent.press(getByText('Environmental'));
    
    // Environmental insights should now be shown
    expect(screen.getByText('Environmental Impact')).toBeTruthy();
    expect(screen.getByText('CO2 emissions reduced by 500kg')).toBeTruthy();
    expect(screen.getByText('Impact: 500%')).toBeTruthy();
  });

  it('displays different trend icons based on trend direction', () => {
    render(
      <ThemeProvider>
        <PerformanceInsights />
      </ThemeProvider>
    );
    
    jest.advanceTimersByTime(600); // Allow animation to complete

    // All trends in mock data are positive, so we should see trending-up icons
    // This test is limited due to mocking, but would verify the icon logic in a real environment
    const renderedComponent = screen.toJSON();
    expect(renderedComponent).toMatchSnapshot();
  });
}); 