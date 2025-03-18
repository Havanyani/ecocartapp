# Testing Guide for AdvancedAnalytics

This guide covers testing strategies and best practices for the AdvancedAnalytics component, including unit tests, integration tests, and end-to-end tests.

## Testing Architecture

### 1. Test Setup

```typescript
// test-setup.ts
import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-reanimated');
jest.mock('../../services/analytics');

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
```

### 2. Test Utils

```typescript
// test-utils.ts
import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../theme';

const AllTheProviders = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const customRender = (ui, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
```

## Unit Testing

### 1. Component Rendering

```typescript
describe('AdvancedAnalytics Component', () => {
  const mockResults = [
    {
      id: '1',
      name: 'CPU Usage',
      value: 45,
      timestamp: Date.now(),
      thresholds: { warning: 70, critical: 90 },
    },
  ];

  it('renders correctly with data', () => {
    const { getByText, getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    expect(getByText('CPU Usage')).toBeTruthy();
    expect(getByTestId('metric-value-1')).toHaveTextContent('45');
  });

  it('renders loading state', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics results={[]} isLoading />
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
```

### 2. User Interactions

```typescript
describe('User Interactions', () => {
  const mockOnMetricSelect = jest.fn();

  it('handles metric selection', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics
        results={mockResults}
        onMetricSelect={mockOnMetricSelect}
      />
    );

    fireEvent.press(getByTestId('metric-card-1'));
    expect(mockOnMetricSelect).toHaveBeenCalledWith('1');
  });

  it('handles export action', async () => {
    const { getByText, getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    fireEvent.press(getByText('Export'));
    
    // Wait for export modal
    await waitFor(() => {
      expect(getByTestId('export-modal')).toBeTruthy();
    });
  });
});
```

### 3. State Management

```typescript
describe('State Management', () => {
  it('updates selected metrics', () => {
    const { getByTestId, rerender } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Select metric
    fireEvent.press(getByTestId('metric-card-1'));
    expect(getByTestId('metric-card-1')).toHaveStyle({
      borderColor: theme.colors.primary,
    });

    // Update data
    const updatedResults = [...mockResults];
    updatedResults[0].value = 60;

    rerender(<AdvancedAnalytics results={updatedResults} />);
    expect(getByTestId('metric-value-1')).toHaveTextContent('60');
  });
});
```

## Integration Testing

### 1. Data Flow

```typescript
describe('Data Flow Integration', () => {
  it('integrates with analytics service', async () => {
    const mockAnalytics = jest.spyOn(analyticsService, 'trackMetric');
    
    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    fireEvent.press(getByTestId('metric-card-1'));
    
    await waitFor(() => {
      expect(mockAnalytics).toHaveBeenCalledWith({
        metricId: '1',
        value: 45,
      });
    });
  });

  it('handles data updates', async () => {
    const mockFetch = jest.spyOn(api, 'fetchMetrics');
    mockFetch.mockResolvedValueOnce({ data: mockResults });

    const { getByTestId, rerender } = render(
      <AdvancedAnalytics />
    );

    await waitFor(() => {
      expect(getByTestId('metric-value-1')).toHaveTextContent('45');
    });

    // Simulate data update
    mockFetch.mockResolvedValueOnce({
      data: [{ ...mockResults[0], value: 55 }],
    });

    rerender(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(getByTestId('metric-value-1')).toHaveTextContent('55');
    });
  });
});
```

### 2. Component Integration

```typescript
describe('Component Integration', () => {
  it('integrates with chart components', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const chart = getByTestId('metric-chart-1');
    expect(chart.props.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 45,
        }),
      ])
    );
  });

  it('integrates with export functionality', async () => {
    const mockExport = jest.spyOn(exportService, 'exportData');
    
    const { getByText, getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    fireEvent.press(getByText('Export'));
    fireEvent.press(getByTestId('export-csv-button'));

    await waitFor(() => {
      expect(mockExport).toHaveBeenCalledWith(
        mockResults,
        'CSV'
      );
    });
  });
});
```

## Performance Testing

### 1. Render Performance

```typescript
describe('Performance', () => {
  it('renders efficiently with large datasets', () => {
    const start = performance.now();
    
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      name: `Metric ${i}`,
      value: Math.random() * 100,
      timestamp: Date.now(),
      thresholds: { warning: 70, critical: 90 },
    }));

    const { getAllByTestId } = render(
      <AdvancedAnalytics results={largeDataset} />
    );

    const end = performance.now();
    expect(end - start).toBeLessThan(1000); // Should render in less than 1s

    const metrics = getAllByTestId(/metric-card/);
    expect(metrics).toHaveLength(1000);
  });

  it('handles frequent updates efficiently', async () => {
    const { rerender } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const updates = Array.from({ length: 10 }, () => ({
      ...mockResults[0],
      value: Math.random() * 100,
    }));

    const start = performance.now();

    for (const update of updates) {
      rerender(<AdvancedAnalytics results={[update]} />);
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(100); // Updates should be fast
  });
});
```

### 2. Memory Usage

```typescript
describe('Memory Usage', () => {
  it('cleans up resources properly', () => {
    const { unmount } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Get initial memory usage
    const initialMemory = process.memoryUsage().heapUsed;

    // Unmount and cleanup
    unmount();

    // Check memory after cleanup
    const finalMemory = process.memoryUsage().heapUsed;
    expect(finalMemory - initialMemory).toBeLessThan(1000000); // Less than 1MB difference
  });
});
```

## Accessibility Testing

### 1. Screen Reader Support

```typescript
describe('Accessibility', () => {
  it('provides proper accessibility labels', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const metricCard = getByTestId('metric-card-1');
    expect(metricCard).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('CPU Usage')
    );
  });

  it('announces metric changes', () => {
    const announceMessage = jest.fn();
    jest.spyOn(Accessibility, 'announce').mockImplementation(announceMessage);

    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    fireEvent.press(getByTestId('metric-card-1'));
    
    expect(announceMessage).toHaveBeenCalledWith(
      expect.stringContaining('Selected CPU Usage')
    );
  });
});
```

### 2. Keyboard Navigation

```typescript
describe('Keyboard Navigation', () => {
  it('supports tab navigation', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const elements = getAllFocusableElements();
    expect(elements.length).toBeGreaterThan(0);

    elements.forEach(element => {
      expect(element).toHaveProp('tabIndex', expect.any(Number));
    });
  });

  it('maintains proper focus order', () => {
    const { getByTestId } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const focusableElements = getAllFocusableElements();
    const focusOrder = focusableElements.map(el => el.props.tabIndex);
    
    expect(focusOrder).toEqual([...focusOrder].sort((a, b) => a - b));
  });
});
```

## End-to-End Testing

```typescript
describe('End-to-End Flow', () => {
  it('completes full user journey', async () => {
    const { getByTestId, getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Select metric
    fireEvent.press(getByTestId('metric-card-1'));
    expect(getByTestId('metric-card-1')).toHaveStyle({
      borderColor: theme.colors.primary,
    });

    // Change time range
    fireEvent.press(getByText('Last 7 Days'));
    await waitFor(() => {
      expect(getByTestId('chart-container')).toHaveStyle({
        opacity: 1,
      });
    });

    // Export data
    fireEvent.press(getByText('Export'));
    fireEvent.press(getByTestId('export-csv-button'));
    
    await waitFor(() => {
      expect(getByText('Export Successful')).toBeTruthy();
    });
  });
});
```

## Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mock Management**
   - Mock external dependencies
   - Use meaningful mock data
   - Reset mocks between tests

3. **Async Testing**
   - Use proper async/await patterns
   - Handle timeouts appropriately
   - Test loading states

4. **Performance Testing**
   - Monitor render times
   - Test with large datasets
   - Check memory usage

5. **Accessibility Testing**
   - Test screen reader support
   - Verify keyboard navigation
   - Check ARIA attributes

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Best Practices](https://reactnative.dev/docs/testing-overview)
- [Accessibility Testing](https://reactnative.dev/docs/accessibility) 