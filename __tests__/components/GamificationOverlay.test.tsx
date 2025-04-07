import { GamificationOverlay } from '@/components/GamificationOverlay';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the animations
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

// Mock the HapticTab component
jest.mock('@/components/ui/HapticTab', () => ({
  HapticTab: ({ children, onPress, style }: any) => (
    <button onClick={onPress} style={style} accessibilityLabel="haptic-tab-button">
      {children}
    </button>
  ),
}));

// Mock the IconSymbol component
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, size, color }: { name: string; size: number; color: string }) => (
    <div data-testid={`icon-${name}`} style={{ width: size, height: size, color }}>
      {name}
    </div>
  ),
}));

// Mock the ThemedText component
jest.mock('@/components/ui/ThemedText', () => ({
  ThemedText: ({ children, style }: any) => (
    <span style={style}>{children}</span>
  ),
}));

// Mock the ThemedView component
jest.mock('@/components/ui/ThemedView', () => ({
  ThemedView: ({ children, style }: any) => (
    <div style={style}>{children}</div>
  ),
}));

describe('GamificationOverlay', () => {
  const mockAchievement = {
    id: '1',
    title: 'Paper Recycler',
    description: 'Recycled your first paper item',
    type: 'recycling' as const,
    points: 100,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with achievement data', () => {
    render(
      <ThemeProvider>
        <GamificationOverlay 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
        />
      </ThemeProvider>
    );

    // Check that key elements are present
    expect(screen.getByText('Achievement Unlocked!')).toBeTruthy();
    expect(screen.getByText('Paper Recycler')).toBeTruthy();
    expect(screen.getByText('Recycled your first paper item')).toBeTruthy();
    expect(screen.getByText('+100 points')).toBeTruthy();
    expect(screen.getByText('Awesome!')).toBeTruthy();
    expect(screen.getByTestId('icon-trophy')).toBeTruthy();
  });

  it('should not render when achievement is null', () => {
    const { container } = render(
      <ThemeProvider>
        <GamificationOverlay 
          achievement={null} 
          onClose={mockOnClose} 
        />
      </ThemeProvider>
    );

    // Container should be empty since nothing should render
    expect(container.children.length).toBe(0);
  });

  it('calls onClose after animation is complete', () => {
    render(
      <ThemeProvider>
        <GamificationOverlay 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
        />
      </ThemeProvider>
    );

    // Initially, onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward through animation sequence
    // 500ms for fade in + 2000ms delay + 500ms for fade out
    jest.advanceTimersByTime(3000);

    // After animation completes, onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Awesome!" button is clicked', () => {
    render(
      <ThemeProvider>
        <GamificationOverlay 
          achievement={mockAchievement} 
          onClose={mockOnClose} 
        />
      </ThemeProvider>
    );

    // Click the "Awesome!" button
    const button = screen.getByText('Awesome!');
    button.click();

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 