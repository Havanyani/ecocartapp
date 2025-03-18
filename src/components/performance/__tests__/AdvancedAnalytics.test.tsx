import { ExtendedProfileResult } from '@/types/Performance';
import { errorHandler } from '@/utils/ErrorHandler';
import { PerformanceAnalytics } from '@/utils/PerformanceAnalytics';
import { PerformanceExporter } from '@/utils/PerformanceExporter';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo, InteractionManager } from 'react-native';
import { act } from 'react-test-renderer';
import { AdvancedAnalytics } from '../AdvancedAnalytics';

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: jest.fn(cb => cb()),
  createInteractionHandle: jest.fn(),
  clearInteractionHandle: jest.fn(),
  setDeadline: jest.fn(),
}));

// Mock AccessibilityInfo
jest.mock('react-native/Libraries/Utilities/AccessibilityInfo', () => ({
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(true)),
  announceForAccessibility: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the dependencies
jest.mock('@/utils/PerformanceAnalytics');
jest.mock('@/utils/PerformanceExporter');
jest.mock('@/utils/ErrorHandler');
jest.mock('victory-native', () => ({
  VictoryChart: 'VictoryChart',
  VictoryLine: 'VictoryLine',
  VictoryBar: 'VictoryBar',
  VictoryAxis: 'VictoryAxis',
}));

describe('AdvancedAnalytics', () => {
  const mockResults: ExtendedProfileResult[] = [
    {
      id: '1',
      name: 'Test Run 1',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 100,
        cpu: 50,
        fps: 60,
        renderTime: 16,
        networkCalls: 5,
        diskOperations: 2,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
    {
      id: '2',
      name: 'Test Run 2',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 120,
        cpu: 55,
        fps: 58,
        renderTime: 18,
        networkCalls: 6,
        diskOperations: 3,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
  ];

  const mockInsights = [
    {
      type: 'trend',
      metric: 'memory',
      importance: 'high',
      description: 'Memory usage is increasing',
      recommendation: 'Consider optimizing memory usage',
      relatedMetrics: [
        { metric: 'cpu', correlation: 0.8 },
      ],
    },
  ];

  const mockTrends = [
    {
      metric: 'memory',
      currentValue: 120,
      predictedValue: 140,
      confidence: 0.9,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (PerformanceAnalytics.generateInsights as jest.Mock).mockResolvedValue(mockInsights);
    (PerformanceAnalytics.analyzeTrends as jest.Mock).mockResolvedValue(mockTrends);
  });

  it('renders correctly with data', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Check if main sections are rendered
    expect(getByText('Performance Insights')).toBeTruthy();
    expect(getByText('Trend Analysis')).toBeTruthy();

    // Check if metrics are displayed
    expect(getByText('Memory')).toBeTruthy();
    expect(getByText('CPU')).toBeTruthy();
    expect(getByText('FPS')).toBeTruthy();

    // Check if charts are rendered
    const charts = getAllByRole('image', { name: /performance chart/i });
    expect(charts.length).toBeGreaterThan(0);
  });

  it('handles metric selection', async () => {
    const onMetricSelect = jest.fn();
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} onMetricSelect={onMetricSelect} />
    );

    // Click on a metric button
    fireEvent.press(getByText('Memory'));
    expect(onMetricSelect).toHaveBeenCalledWith('memory');
  });

  it('handles export functionality', async () => {
    const { getByText, getByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open export modal
    fireEvent.press(getByText('Export'));

    // Check if export modal is displayed
    expect(getByRole('dialog', { name: /export data/i })).toBeTruthy();

    // Select export format and confirm
    fireEvent.press(getByText('CSV'));
    fireEvent.press(getByText('Confirm'));

    // Verify export function was called
    expect(PerformanceExporter.export).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    // Mock error in generating insights
    (PerformanceAnalytics.generateInsights as jest.Mock).mockRejectedValue(
      new Error('Failed to generate insights')
    );

    const { getByText, queryByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Wait for error handling
    await waitFor(() => {
      expect(getByText(/error generating insights/i)).toBeTruthy();
      expect(queryByText('Memory usage is increasing')).toBeNull();
    });

    // Verify error was logged
    expect(errorHandler.handleError).toHaveBeenCalled();
  });

  it('updates time range correctly', async () => {
    const { getByText, getByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open time range selector
    fireEvent.press(getByRole('button', { name: /time range/i }));

    // Select a different time range
    fireEvent.press(getByText('Last 7 Days'));

    // Verify insights are regenerated
    await waitFor(() => {
      expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ timeRange: '7d' })
      );
    });
  });

  it('renders accessibility properties correctly', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Check if main sections have proper accessibility roles and labels
    const sections = getAllByRole('region');
    expect(sections[0].props.accessibilityLabel).toBe('Performance Insights Section');
    expect(sections[1].props.accessibilityLabel).toBe('Trend Analysis Section');

    // Check if charts have proper accessibility roles and labels
    const charts = getAllByRole('image', { name: /performance chart/i });
    charts.forEach(chart => {
      expect(chart.props.accessibilityLabel).toMatch(/performance chart/i);
    });
  });

  it('handles export modal options correctly', async () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open export modal
    fireEvent.press(getByText('Export'));

    // Toggle options
    fireEvent.press(getByText('Include Insights'));
    fireEvent.press(getByText('Include Charts'));

    // Verify export is called with correct options
    fireEvent.press(getByText('Confirm'));
    expect(PerformanceExporter.export).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        includeInsights: false,  // Since we toggled it off
        includeCharts: true,     // Since we toggled it on
      })
    );
  });

  it('filters charts based on selected metric', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Wait for charts to render
    await waitFor(() => {
      const initialCharts = getAllByRole('image', { name: /performance chart/i });
      expect(initialCharts.length).toBeGreaterThan(1);
    });

    // Get initial chart count
    const initialCharts = getAllByRole('image', { name: /performance chart/i });
    const initialCount = initialCharts.length;

    // Select specific metric
    fireEvent.press(getByText('Memory'));

    // Should now only show one chart
    const filteredCharts = getAllByRole('image', { name: /performance chart/i });
    expect(filteredCharts.length).toBe(1);
    expect(filteredCharts[0].props.accessibilityLabel).toMatch(/memory/i);

    // Verify that filtering reduced the number of charts
    expect(filteredCharts.length).toBeLessThan(initialCount);
  });

  it('renders error boundary when component crashes', () => {
    // Mock console.error to prevent noise in test output
    const originalError = console.error;
    console.error = jest.fn();

    // Mock a component crash
    (PerformanceAnalytics.generateInsights as jest.Mock).mockImplementation(() => {
      throw new Error('Component crash');
    });

    const { getByText, getByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Should show error boundary
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText('Component crash')).toBeTruthy();

    // Should have retry button
    const retryButton = getByRole('button', { name: /retry/i });
    expect(retryButton).toBeTruthy();

    // Verify error boundary has correct accessibility role
    const errorContainer = getByRole('alert');
    expect(errorContainer).toBeTruthy();

    // Restore console.error
    console.error = originalError;
  });

  it('handles modal accessibility correctly', async () => {
    const { getByText, getByRole, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open export modal
    fireEvent.press(getByText('Export'));

    // Check modal accessibility
    const modal = getByRole('dialog');
    expect(modal.props.accessibilityViewIsModal).toBe(true);
    expect(modal.props.accessible).toBe(true);

    // Check format buttons accessibility
    const formatButtons = getAllByRole('button', { name: /(JSON|CSV) format/i });
    expect(formatButtons).toHaveLength(2);
    formatButtons.forEach(button => {
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityState).toBeDefined();
    });

    // Check action buttons accessibility
    const cancelButton = getByRole('button', { name: /cancel export/i });
    expect(cancelButton.props.accessibilityHint).toBe('Close the export dialog');

    const exportButton = getByRole('button', { name: /export data/i });
    expect(exportButton.props.accessibilityHint).toBe('Start the export process');
    expect(exportButton.props.accessibilityState).toEqual({ disabled: false });
  });

  it('handles export modal cancellation', () => {
    const { getByText, queryByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open export modal
    fireEvent.press(getByText('Export'));
    expect(queryByRole('dialog')).toBeTruthy();

    // Cancel export
    fireEvent.press(getByText('Cancel'));
    expect(queryByRole('dialog')).toBeNull();

    // Export function should not have been called
    expect(PerformanceExporter.export).not.toHaveBeenCalled();
  });

  it('disables export button while exporting', async () => {
    // Mock export to be slow
    (PerformanceExporter.export as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, getByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open export modal and start export
    fireEvent.press(getByText('Export'));
    fireEvent.press(getByText('Confirm'));

    // Check if export button is disabled and shows loading state
    const exportButton = getByRole('button', { name: /exporting\.\.\./i });
    expect(exportButton.props.accessibilityState.disabled).toBe(true);

    // Wait for export to complete
    await waitFor(() => {
      expect(PerformanceExporter.export).toHaveBeenCalled();
    });
  });

  describe('Data Variations', () => {
    it('handles empty results array', () => {
      const { getByText } = render(
        <AdvancedAnalytics results={[]} />
      );

      expect(getByText('No performance data available')).toBeTruthy();
    });

    it('handles null metric values', () => {
      const resultsWithNull: ExtendedProfileResult[] = [
        {
          ...mockResults[0],
          metrics: {
            ...mockResults[0].metrics,
            memory: null as unknown as number,
          }
        }
      ];

      const { getByText } = render(
        <AdvancedAnalytics results={resultsWithNull} />
      );

      expect(getByText('No memory data available')).toBeTruthy();
    });

    it('handles different time ranges', async () => {
      const { getByText, getAllByRole } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      // Test hour range
      fireEvent.press(getByText('Hour'));
      await waitFor(() => {
        expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ timeRange: 'hour' })
        );
      });

      // Test day range
      fireEvent.press(getByText('Day'));
      await waitFor(() => {
        expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ timeRange: 'day' })
        );
      });

      // Test week range
      fireEvent.press(getByText('Week'));
      await waitFor(() => {
        expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ timeRange: 'week' })
        );
      });
    });
  });

  describe('Integration Tests', () => {
    it('updates insights when metric selection changes', async () => {
      const { getByText } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      // Select CPU metric
      fireEvent.press(getByText('CPU'));

      await waitFor(() => {
        expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({ metric: 'cpu' })
        );
      });
    });

    it('maintains state during export process', async () => {
      const { getByText, getByRole } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      // Select specific metric and time range
      fireEvent.press(getByText('Memory'));
      fireEvent.press(getByText('Day'));

      // Open export and start export
      fireEvent.press(getByText('Export'));
      fireEvent.press(getByText('Confirm'));

      // Verify state is maintained
      expect(getByText('Memory')).toHaveStyle({ backgroundColor: expect.any(String) });
      expect(getByText('Day')).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it('syncs chart data with selected time range', async () => {
      const { getByText, getAllByRole } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      // Change time range
      fireEvent.press(getByText('Week'));

      // Verify charts are updated
      await waitFor(() => {
        const charts = getAllByRole('image', { name: /performance chart/i });
        charts.forEach(chart => {
          expect(chart.props.accessibilityLabel).toMatch(/week/i);
        });
      });
    });
  });

  describe('Performance Tests', () => {
    it('defers heavy calculations until after interactions', async () => {
      render(<AdvancedAnalytics results={mockResults} />);

      expect(InteractionManager.runAfterInteractions).toHaveBeenCalled();
    });

    it('optimizes chart updates', async () => {
      const { getByText, getAllByRole } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      // Get initial render time
      const startTime = performance.now();
      
      // Trigger chart update
      fireEvent.press(getByText('Memory'));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Ensure render time is reasonable (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });

    it('handles rapid metric switching without performance degradation', async () => {
      const { getByText } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      const metrics = ['Memory', 'CPU', 'FPS'];
      
      // Rapidly switch between metrics
      await act(async () => {
        for (const metric of metrics) {
          fireEvent.press(getByText(metric));
        }
      });

      // Verify analytics calls are debounced
      expect(PerformanceAnalytics.generateInsights).toHaveBeenCalledTimes(1);
    });

    it('maintains smooth scrolling during chart rendering', async () => {
      const { getByRole } = render(
        <AdvancedAnalytics results={mockResults} />
      );

      const scrollView = getByRole('adjustable');
      
      // Simulate scroll event
      await act(async () => {
        fireEvent.scroll(scrollView, {
          nativeEvent: {
            contentOffset: { y: 100 },
            contentSize: { height: 1000, width: 100 },
            layoutMeasurement: { height: 100, width: 100 }
          }
        });
      });

      // Verify no performance degradation
      expect(InteractionManager.createInteractionHandle).toHaveBeenCalled();
      expect(InteractionManager.clearInteractionHandle).toHaveBeenCalled();
    });
  });
});

describe('Screen Reader Accessibility', () => {
  const mockResults: ExtendedProfileResult[] = [
    {
      id: '1',
      name: 'Test Run 1',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 100,
        cpu: 50,
        fps: 60,
        renderTime: 16,
        networkCalls: 5,
        diskOperations: 2,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
    {
      id: '2',
      name: 'Test Run 2',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 120,
        cpu: 55,
        fps: 58,
        renderTime: 18,
        networkCalls: 6,
        diskOperations: 3,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
  ];

  beforeEach(() => {
    (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockImplementation(() => 
      Promise.resolve(true)
    );
  });

  it('announces metric changes to screen reader', async () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Select a different metric
    fireEvent.press(getByText('CPU'));

    // Verify announcement was made
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('CPU metric selected')
    );
  });

  it('announces chart data for screen readers', async () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const charts = getAllByRole('image', { name: /performance chart/i });
    
    charts.forEach(chart => {
      // Simulate focus on chart
      fireEvent(chart, 'accessibilityFocus');
      
      // Verify data announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringMatching(/current value.*trend.*prediction/i)
      );
    });
  });

  it('provides accessible navigation order', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const elements = getAllByRole('button');
    
    // Verify elements have correct accessibility traits
    elements.forEach(element => {
      expect(element.props.accessibilityRole).toBeDefined();
      expect(element.props.accessibilityLabel).toBeDefined();
      expect(element.props.accessibilityHint).toBeDefined();
    });

    // Verify tab order matches visual order
    const tabIndexes = elements
      .map(element => element.props.accessibilityValue?.now)
      .filter(Boolean);
    
    expect(tabIndexes).toEqual([...tabIndexes].sort((a, b) => a - b));
  });

  it('announces loading states to screen reader', async () => {
    // Mock export to be slow
    (PerformanceExporter.export as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Start export
    fireEvent.press(getByText('Export'));
    fireEvent.press(getByText('Confirm'));

    // Verify loading announcement
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Exporting data'
    );

    // Wait for export to complete
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Export complete'
      );
    });
  });

  it('announces error states to screen reader', async () => {
    // Mock error in generating insights
    (PerformanceAnalytics.generateInsights as jest.Mock).mockRejectedValue(
      new Error('Failed to generate insights')
    );

    const { getByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Wait for error boundary to show
    await waitFor(() => {
      const errorContainer = getByRole('alert');
      expect(errorContainer).toBeTruthy();
    });

    // Verify error announcement
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('error occurred')
    );
  });

  it('provides accessible descriptions for charts', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const charts = getAllByRole('image', { name: /performance chart/i });
    
    charts.forEach(chart => {
      // Verify chart has detailed accessibility label
      expect(chart.props.accessibilityLabel).toMatch(
        /performance chart showing .* trends/i
      );
      
      // Verify chart has value information
      expect(chart.props.accessibilityValue).toBeDefined();
      expect(chart.props.accessibilityValue.text).toMatch(
        /current value:.*predicted value:/i
      );
    });
  });

  it('handles screen reader focus changes', async () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const elements = getAllByRole('button');
    
    // Simulate screen reader focus movement
    for (const element of elements) {
      fireEvent(element, 'accessibilityFocus');
      
      // Verify focus announcement
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining(element.props.accessibilityLabel)
      );
    }
  });
});

describe('Keyboard Navigation', () => {
  const mockResults: ExtendedProfileResult[] = [
    {
      id: '1',
      name: 'Test Run 1',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 100,
        cpu: 50,
        fps: 60,
        renderTime: 16,
        networkCalls: 5,
        diskOperations: 2,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
  ];

  it('supports tab navigation through all interactive elements', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const interactiveElements = getAllByRole('button');
    
    // Verify all interactive elements are focusable
    interactiveElements.forEach(element => {
      expect(element.props.focusable).toBe(true);
      expect(element.props.tabIndex).toBeDefined();
    });
  });

  it('maintains logical tab order', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const interactiveElements = getAllByRole('button');
    
    // Verify elements are in DOM order
    const tabIndexes = interactiveElements.map(element => element.props.tabIndex);
    expect(tabIndexes).toEqual([...tabIndexes].sort((a, b) => a - b));
  });

  it('handles keyboard selection of metrics', () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const metricButton = getByText('Memory');
    
    // Simulate keyboard selection using press events
    fireEvent.press(metricButton);
    
    // Verify button responds to selection
    expect(metricButton.props.accessibilityState.selected).toBe(true);
  });

  it('supports keyboard navigation in export modal', () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    const exportButton = getByText('Export');
    fireEvent.press(exportButton);

    // Get all focusable elements in modal
    const modalButtons = getAllByRole('button');
    
    // Verify first element is focused
    expect(modalButtons[0].props.accessibilityState.focused).toBe(true);

    // Close modal
    fireEvent(modalButtons[0], 'accessibilityAction', { action: 'escape' });
    expect(getByText('Export')).toBeTruthy(); // Modal closed, export button visible
  });

  it('handles keyboard interactions with charts', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const charts = getAllByRole('image', { name: /performance chart/i });
    
    charts.forEach(chart => {
      // Verify chart is keyboard focusable
      expect(chart.props.focusable).toBe(true);
      expect(chart.props.tabIndex).toBeDefined();

      // Simulate focus
      fireEvent(chart, 'accessibilityFocus');
      expect(chart.props.accessibilityState.focused).toBe(true);
    });
  });

  it('supports keyboard shortcuts', () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Test shortcuts using accessibility actions
    fireEvent(getByText('Export'), 'accessibilityAction', { action: 'activate' });
    expect(getByText('Export Performance Data')).toBeTruthy();

    fireEvent(getByText('Export Performance Data'), 'accessibilityAction', { action: 'escape' });
    expect(getByText('Export')).toBeTruthy();
  });

  it('maintains focus trap in modal', () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    const modalButtons = getAllByRole('button');
    const firstButton = modalButtons[0];
    const lastButton = modalButtons[modalButtons.length - 1];

    // Verify focus trap using accessibility actions
    fireEvent(lastButton, 'accessibilityAction', { action: 'magicTap' });
    expect(firstButton.props.accessibilityState.focused).toBe(true);

    fireEvent(firstButton, 'accessibilityAction', { action: 'magicTap' });
    expect(lastButton.props.accessibilityState.focused).toBe(true);
  });

  it('restores focus when modal closes', () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const exportButton = getByText('Export');
    
    // Open and close modal
    fireEvent.press(exportButton);
    fireEvent.press(getByText('Cancel'));

    // Verify focus returns to export button
    expect(exportButton.props.accessibilityState.focused).toBe(true);
  });

  it('handles keyboard navigation through time ranges', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const timeRanges = getAllByRole('button', { name: /(hour|day|week)/i });
    
    timeRanges.forEach(range => {
      // Verify keyboard navigation using accessibility actions
      fireEvent(range, 'accessibilityAction', { action: 'activate' });
      expect(range.props.accessibilityState.selected).toBe(true);

      // Verify next/previous navigation
      fireEvent(range, 'accessibilityAction', { action: 'increment' });
      expect(range.props.accessibilityState.focused).toBe(false);
      expect(timeRanges[(timeRanges.indexOf(range) + 1) % timeRanges.length].props.accessibilityState.focused).toBe(true);
    });
  });
});

describe('Color Contrast and Visual Accessibility', () => {
  const mockResults: ExtendedProfileResult[] = [
    {
      id: '1',
      name: 'Test Run 1',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 100,
        cpu: 50,
        fps: 60,
        renderTime: 16,
        networkCalls: 5,
        diskOperations: 2,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
  ];

  it('maintains sufficient color contrast for text elements', () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Check text elements for sufficient contrast
    const textElements = getAllByRole('text');
    textElements.forEach(element => {
      const styles = element.props.style || {};
      const backgroundColor = styles.backgroundColor || '#FFFFFF'; // Default background
      const color = styles.color || '#000000'; // Default text color
      
      // Calculate relative luminance (simplified WCAG formula)
      const getRelativeLuminance = (color: string) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const L1 = getRelativeLuminance(backgroundColor);
      const L2 = getRelativeLuminance(color);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

      // WCAG 2.1 Level AA requires 4.5:1 for normal text
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('provides sufficient contrast for interactive elements', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      const styles = button.props.style || {};
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.color).toBeDefined();
    });
  });

  it('maintains contrast in different states', () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const button = getByText('Export');
    const initialStyles = button.props.style || {};

    // Check hover state
    fireEvent(button, 'accessibilityAction', { action: 'activate' });
    const activeStyles = button.props.style || {};

    expect(activeStyles.backgroundColor).not.toBe(initialStyles.backgroundColor);
    expect(activeStyles.color).toBeDefined();
  });

  it('provides visual feedback for focus state', () => {
    const { getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const interactiveElements = getAllByRole('button');
    interactiveElements.forEach(element => {
      // Simulate focus
      fireEvent(element, 'focus');
      const focusStyles = element.props.style || {};

      // Check for focus indicator (outline or equivalent)
      expect(
        focusStyles.outline ||
        focusStyles.borderColor ||
        focusStyles.backgroundColor
      ).toBeDefined();
    });
  });
});

describe('Modal Focus Management', () => {
  const mockResults: ExtendedProfileResult[] = [
    {
      id: '1',
      name: 'Test Run 1',
      timestamp: Date.now(),
      duration: 1000,
      metrics: {
        memory: 100,
        cpu: 50,
        fps: 60,
        renderTime: 16,
        networkCalls: 5,
        diskOperations: 2,
      },
      thresholds: {
        memory: 200,
        cpu: 80,
        fps: 30,
        renderTime: 33,
        networkCalls: 10,
        diskOperations: 5,
      },
      traces: [],
    },
  ];

  it('automatically focuses first interactive element when modal opens', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    // Wait for modal animation
    await waitFor(() => {
      const firstFocusableElement = getAllByRole('button')[0];
      expect(firstFocusableElement.props.accessibilityState.focused).toBe(true);
    });
  });

  it('maintains focus within modal while open', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    const modalButtons = getAllByRole('button');
    const lastButton = modalButtons[modalButtons.length - 1];

    // Simulate tab press on last element
    fireEvent(lastButton, 'accessibilityAction', { action: 'magicTap' });

    // Verify focus wraps to first element
    await waitFor(() => {
      expect(modalButtons[0].props.accessibilityState.focused).toBe(true);
    });
  });

  it('handles backward tab navigation in modal', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    const modalButtons = getAllByRole('button');
    const firstButton = modalButtons[0];

    // Simulate shift+tab on first element
    fireEvent(firstButton, 'accessibilityAction', { action: 'magicTap' });

    // Verify focus wraps to last element
    await waitFor(() => {
      expect(modalButtons[modalButtons.length - 1].props.accessibilityState.focused).toBe(true);
    });
  });

  it('restores focus to trigger element when modal closes', async () => {
    const { getByText } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    const exportButton = getByText('Export');
    
    // Store initial focus state
    const initialFocusState = exportButton.props.accessibilityState.focused;

    // Open and close modal
    fireEvent.press(exportButton);
    fireEvent.press(getByText('Cancel'));

    // Verify focus returns to export button
    await waitFor(() => {
      expect(exportButton.props.accessibilityState.focused).toBe(true);
      expect(exportButton.props.accessibilityState.focused).not.toBe(initialFocusState);
    });
  });

  it('maintains focus history when modal closes', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Focus a metric button first
    const metricButton = getByText('Memory');
    fireEvent(metricButton, 'accessibilityFocus');

    // Open and close modal
    fireEvent.press(getByText('Export'));
    fireEvent.press(getByText('Cancel'));

    // Verify focus returns to last focused element before modal
    await waitFor(() => {
      expect(metricButton.props.accessibilityState.focused).toBe(true);
    });
  });

  it('handles focus with nested interactive elements', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    // Get all focusable elements including nested ones
    const allFocusableElements = getAllByRole('button')
      .concat(getAllByRole('checkbox'))
      .concat(getAllByRole('radio'));

    // Verify each element can receive focus
    for (const element of allFocusableElements) {
      fireEvent(element, 'accessibilityFocus');
      await waitFor(() => {
        expect(element.props.accessibilityState.focused).toBe(true);
      });
    }
  });

  it('maintains focus when modal content updates', async () => {
    const { getByText, getAllByRole } = render(
      <AdvancedAnalytics results={mockResults} />
    );

    // Open modal
    fireEvent.press(getByText('Export'));

    // Focus a specific element
    const formatButton = getByText('CSV');
    fireEvent(formatButton, 'accessibilityFocus');

    // Toggle an option that updates modal content
    fireEvent.press(getByText('Include Charts'));

    // Verify focus remains on the same element
    await waitFor(() => {
      expect(formatButton.props.accessibilityState.focused).toBe(true);
    });
  });
}); 