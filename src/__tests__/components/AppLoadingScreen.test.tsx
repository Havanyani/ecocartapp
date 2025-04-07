import AppLoadingScreen from '@/components/AppLoadingScreen';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Animated, Image } from 'react-native';

// Mock hooks
jest.mock('@/hooks/useTheme', () => ({
  __esModule: true,
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        textSecondary: '#666666',
        primary: '#0066CC',
        border: '#EEEEEE',
      }
    },
    isDark: false,
  }),
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock progress animations
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  const AnimatedMock = {
    ...reactNative.Animated,
    timing: jest.fn().mockReturnValue({
      start: jest.fn(callback => callback && callback()),
    }),
    Value: jest.fn(() => ({
      interpolate: jest.fn().mockReturnValue({
        __getValue: () => '50%',
        _listeners: {},
      }),
    })),
    View: reactNative.Animated.createAnimatedComponent(reactNative.View),
  };

  return {
    ...reactNative,
    Animated: AnimatedMock,
  };
});

describe('AppLoadingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default props', () => {
    const { getByText, getByTestId } = render(
      <AppLoadingScreen testID="loading-screen" />
    );
    
    expect(getByText('EcoCart')).toBeTruthy();
    expect(getByText('Making sustainability simple')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders with custom message', () => {
    const { getByText } = render(
      <AppLoadingScreen 
        message="Custom loading message" 
        testID="loading-screen" 
      />
    );
    
    expect(getByText('Custom loading message')).toBeTruthy();
  });

  it('updates progress bar width based on progress prop', () => {
    const { rerender } = render(
      <AppLoadingScreen 
        progress={25} 
        testID="loading-screen" 
      />
    );
    
    // Animated timing should have been called with progress/100
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 0.25,
        duration: 300,
        useNativeDriver: false,
      })
    );
    
    // Update progress and verify animation updates
    rerender(
      <AppLoadingScreen 
        progress={75} 
        testID="loading-screen" 
      />
    );
    
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 0.75,
        duration: 300,
        useNativeDriver: false,
      })
    );
  });

  it('fades out when isFinished is true', async () => {
    const onFinishMock = jest.fn();
    
    render(
      <AppLoadingScreen 
        isFinished={true}
        onFinishAnimationComplete={onFinishMock}
        testID="loading-screen" 
      />
    );
    
    // Should not call onFinish immediately (has delay + animation)
    expect(onFinishMock).not.toHaveBeenCalled();
    
    // Fast-forward past delay
    jest.advanceTimersByTime(500);
    
    // Verify fade animation was triggered
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    );
    
    // Callback should have been called after animation completes
    await waitFor(() => {
      expect(onFinishMock).toHaveBeenCalled();
    });
  });

  it('does not fade out when isFinished is false', () => {
    const onFinishMock = jest.fn();
    
    render(
      <AppLoadingScreen 
        isFinished={false}
        onFinishAnimationComplete={onFinishMock}
        testID="loading-screen" 
      />
    );
    
    // Fast-forward past the usual delay
    jest.advanceTimersByTime(1000);
    
    // Should not have triggered fade out animation
    expect(Animated.timing).not.toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    );
    
    // Callback should not have been called
    expect(onFinishMock).not.toHaveBeenCalled();
  });

  it('displays the app logo', () => {
    const { UNSAFE_getByType } = render(
      <AppLoadingScreen testID="loading-screen" />
    );
    
    // Check that Image component is rendering the logo
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toBeDefined();
    expect(image.props.style).toMatchObject({
      width: 120,
      height: 120,
      marginBottom: 20,
    });
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <AppLoadingScreen testID="loading-screen" />
    );
    
    // Container should use background color from theme
    const container = getByTestId('loading-screen');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#FFFFFF',
      })
    );
  });
}); 