import createLazyScreen, { createScreenLazyLoader } from '@/components/LazyScreen';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import BundleSplitter from '@/utils/performance/BundleSplitter';
import { render, waitFor } from '@testing-library/react-native';
import React, { Suspense } from 'react';

// Mock dependencies
jest.mock('@/utils/PerformanceMonitoring', () => ({
  PerformanceMonitor: {
    startMetricsCollection: jest.fn(),
    stopMetricsCollection: jest.fn(),
    captureError: jest.fn(),
  },
}));

jest.mock('@/utils/performance/BundleSplitter', () => ({
  __esModule: true,
  default: {
    registerLazyComponent: jest.fn().mockImplementation((name, importFunc, options) => {
      // Create a simple component that just renders its props
      return (props: any) => {
        const Component = React.lazy(() => 
          // Simulate a delay for async loading
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ default: () => <div data-testid={`lazy-${name}`} {...props} /> });
            }, 10);
          })
        );
        
        // Render with Suspense fallback if provided
        return (
          <Suspense fallback={options?.loadingComponent || null}>
            <Component {...props} />
          </Suspense>
        );
      };
    }),
  },
}));

// Test component to be lazy loaded
const TestComponent = (props: any) => <div data-testid="test-component" {...props} />;

describe('LazyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a lazy-loaded component with default options', async () => {
    // Create a lazy component
    const LazyTestComponent = createLazyScreen(
      'TestScreen',
      () => Promise.resolve({ default: TestComponent }),
      {}
    );
    
    // Render the lazy component
    const { getByTestId } = render(<LazyTestComponent testProp="value" />);
    
    // Wait for lazy component to load
    await waitFor(() => {
      expect(getByTestId('lazy-TestScreen')).toBeTruthy();
    });
    
    // Should have registered the component with BundleSplitter
    expect(BundleSplitter.registerLazyComponent).toHaveBeenCalledWith(
      'TestScreen',
      expect.any(Function),
      expect.objectContaining({
        preload: false,
      })
    );
    
    // Should have tracked performance
    expect(PerformanceMonitor.startMetricsCollection).toHaveBeenCalledWith('screen_load_TestScreen');
    expect(PerformanceMonitor.startMetricsCollection).toHaveBeenCalledWith('screen_render_TestScreen');
  });

  it('passes props to the lazy-loaded component', async () => {
    // Create a lazy component
    const LazyTestComponent = createLazyScreen(
      'TestScreen',
      () => Promise.resolve({ default: TestComponent }),
      {}
    );
    
    // Render with props
    const { getByTestId } = render(<LazyTestComponent customProp="test-value" />);
    
    // Wait for lazy component to load
    await waitFor(() => {
      const lazyComponent = getByTestId('lazy-TestScreen');
      expect(lazyComponent.props.customProp).toBe('test-value');
    });
  });

  it('shows custom loading component when provided', async () => {
    // Create a lazy component with custom loading component
    const CustomLoadingComponent = () => <div data-testid="custom-loading" />;
    
    const LazyTestComponent = createLazyScreen(
      'TestScreen',
      () => Promise.resolve({ default: TestComponent }),
      { loadingComponent: <CustomLoadingComponent /> }
    );
    
    // Render the lazy component
    const { getByTestId } = render(<LazyTestComponent />);
    
    // Should show the loading component initially
    expect(getByTestId('custom-loading')).toBeTruthy();
    
    // Wait for lazy component to load
    await waitFor(() => {
      expect(getByTestId('lazy-TestScreen')).toBeTruthy();
    });
  });

  it('handles errors during loading', async () => {
    // Mock error in import function
    const importFunc = () => Promise.reject(new Error('Failed to load'));
    
    // Create a lazy component
    const LazyTestComponent = createLazyScreen(
      'ErrorScreen',
      importFunc,
      {}
    );
    
    // Render the lazy component (will throw an error, but we'll catch it)
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      render(<LazyTestComponent />);
    } catch (error) {
      // Expected error
    }
    
    // Wait for error handling
    await waitFor(() => {
      expect(PerformanceMonitor.captureError).toHaveBeenCalled();
      expect(PerformanceMonitor.stopMetricsCollection).toHaveBeenCalledWith('screen_load_ErrorScreen');
    });
    
    console.error.mockRestore();
  });

  it('preloads component when preload option is true', async () => {
    // Create a lazy component with preload enabled
    const LazyTestComponent = createLazyScreen(
      'PreloadScreen',
      () => Promise.resolve({ default: TestComponent }),
      { preload: true }
    );
    
    // Should have registered with preload=true
    expect(BundleSplitter.registerLazyComponent).toHaveBeenCalledWith(
      'PreloadScreen',
      expect.any(Function),
      expect.objectContaining({
        preload: true,
      })
    );
    
    // Render the lazy component
    const { getByTestId } = render(<LazyTestComponent />);
    
    // Wait for lazy component to load
    await waitFor(() => {
      expect(getByTestId('lazy-PreloadScreen')).toBeTruthy();
    });
  });

  describe('createScreenLazyLoader', () => {
    it('creates a factory with global options', async () => {
      // Create a factory with global options
      const createLazyTestScreen = createScreenLazyLoader({
        preload: true,
        trackPerformance: false,
      });
      
      // Create a lazy component using the factory
      const LazyTestComponent = createLazyTestScreen(
        'FactoryScreen',
        () => Promise.resolve({ default: TestComponent }),
        {}
      );
      
      // Should have registered with global options
      expect(BundleSplitter.registerLazyComponent).toHaveBeenCalledWith(
        'FactoryScreen',
        expect.any(Function),
        expect.objectContaining({
          preload: true,
          trackPerformance: false,
        })
      );
      
      // Render the lazy component
      const { getByTestId } = render(<LazyTestComponent />);
      
      // Wait for lazy component to load
      await waitFor(() => {
        expect(getByTestId('lazy-FactoryScreen')).toBeTruthy();
      });
    });

    it('overrides global options with local options', async () => {
      // Create a factory with global options
      const createLazyTestScreen = createScreenLazyLoader({
        preload: true,
        trackPerformance: false,
      });
      
      // Create a lazy component with local options that override global ones
      const LazyTestComponent = createLazyTestScreen(
        'OverrideScreen',
        () => Promise.resolve({ default: TestComponent }),
        { preload: false }
      );
      
      // Should have registered with overridden options
      expect(BundleSplitter.registerLazyComponent).toHaveBeenCalledWith(
        'OverrideScreen',
        expect.any(Function),
        expect.objectContaining({
          preload: false,
          trackPerformance: false,
        })
      );
      
      // Render the lazy component
      const { getByTestId } = render(<LazyTestComponent />);
      
      // Wait for lazy component to load
      await waitFor(() => {
        expect(getByTestId('lazy-OverrideScreen')).toBeTruthy();
      });
    });
  });
}); 