import AppInitializationWrapper from '@/components/AppInitializationWrapper';
import AppLoadingScreen from '@/components/AppLoadingScreen';
import { appInitializer } from '@/utils/performance/AppInitializer';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { act } from 'react-test-renderer';

// Mock dependencies
jest.mock('@/utils/performance/AppInitializer', () => ({
  appInitializer: {
    initialize: jest.fn().mockResolvedValue(undefined),
    hideSplashScreen: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/utils/PerformanceMonitoring', () => ({
  PerformanceMonitor: {
    startMetricsCollection: jest.fn(),
    stopMetricsCollection: jest.fn(),
  },
}));

jest.mock('@/components/AppLoadingScreen', () => {
  // Return a function component for easier testing
  return jest.fn().mockImplementation(({ isFinished, onFinishAnimationComplete }) => {
    // Call onFinishAnimationComplete immediately if isFinished is true
    React.useEffect(() => {
      if (isFinished && onFinishAnimationComplete) {
        setTimeout(() => {
          onFinishAnimationComplete();
        }, 0);
      }
    }, [isFinished, onFinishAnimationComplete]);
    
    return <div data-testid="app-loading-screen" />;
  });
});

// Mock hooks
jest.mock('@/hooks/useTheme', () => ({
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

describe('AppInitializationWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading screen initially', () => {
    const { getByTestId } = render(
      <AppInitializationWrapper>
        <div data-testid="app-content">App content</div>
      </AppInitializationWrapper>
    );
    
    // Loading screen should be displayed
    expect(getByTestId('app-loading-screen')).toBeTruthy();
    
    // App content should not be displayed yet
    expect(() => getByTestId('app-content')).toThrow();
  });

  it('initializes the app and hides splash screen', async () => {
    render(
      <AppInitializationWrapper>
        <div data-testid="app-content">App content</div>
      </AppInitializationWrapper>
    );
    
    // Initialization sequence should have started
    expect(PerformanceMonitor.startMetricsCollection).toHaveBeenCalledWith('app_initialization_sequence');
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(appInitializer.initialize).toHaveBeenCalled();
      expect(appInitializer.hideSplashScreen).toHaveBeenCalled();
    });
  });

  it('updates progress during initialization steps', async () => {
    render(
      <AppInitializationWrapper>
        <div data-testid="app-content">App content</div>
      </AppInitializationWrapper>
    );
    
    // First step should be completed (splash)
    expect(AppLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: expect.any(Number),
        message: 'Starting EcoCart...',
      }),
      expect.anything()
    );
    
    // Advance timers to simulate initialization steps
    await act(async () => {
      // Advance to assets step
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    
    // Check for asset loading message
    expect(AppLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Loading'),
      }),
      expect.anything()
    );
    
    // Complete initialization
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    // Progress should be 100% at the end
    expect(AppLoadingScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: 100,
        message: 'Ready!',
        isFinished: true,
      }),
      expect.anything()
    );
  });

  it('renders children after initialization completes', async () => {
    const { getByTestId, queryByTestId } = render(
      <AppInitializationWrapper>
        <div data-testid="app-content">App content</div>
      </AppInitializationWrapper>
    );
    
    // Initially, loading screen is shown and children are not
    expect(getByTestId('app-loading-screen')).toBeTruthy();
    expect(queryByTestId('app-content')).toBeNull();
    
    // Complete initialization
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    
    // Once animation completes, children should be rendered
    await waitFor(() => {
      expect(queryByTestId('app-loading-screen')).toBeNull();
      expect(getByTestId('app-content')).toBeTruthy();
    });
  });

  it('handles initialization errors gracefully', async () => {
    // Mock an error during initialization
    (appInitializer.initialize as jest.Mock).mockRejectedValueOnce(new Error('Initialization error'));
    
    const { getByTestId } = render(
      <AppInitializationWrapper>
        <div data-testid="app-content">App content</div>
      </AppInitializationWrapper>
    );
    
    // Even with an error, initialization should complete
    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });
    
    // Should still render children after error
    await waitFor(() => {
      expect(getByTestId('app-content')).toBeTruthy();
    });
  });
}); 