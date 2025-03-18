import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { DebugMenu } from '../../components/DebugMenu';
import { BenchmarkScenarios } from '../../utils/BenchmarkScenarios';
import { PerformanceMonitor } from '../../utils/PerformanceMonitoring';

jest.mock('../../utils/BenchmarkScenarios');
jest.mock('../../utils/Performance');

describe('DebugMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnClearCache = jest.fn();
  const mockOnResetApp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (BenchmarkScenarios.runScenario as jest.Mock).mockResolvedValue({
      latency: 100,
      throughput: 1000,
      errorRate: 0.01
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <DebugMenu
        visible={true}
        onClose={mockOnClose}
        onClearCache={mockOnClearCache}
        onResetApp={mockOnResetApp}
      />
    );

    expect(getByText('Debug Menu')).toBeTruthy();
    expect(getByText('Clear Cache')).toBeTruthy();
    expect(getByText('Reset App')).toBeTruthy();
  });

  it('handles close button press', () => {
    const { getByTestId } = render(
      <DebugMenu
        visible={true}
        onClose={mockOnClose}
        onClearCache={mockOnClearCache}
        onResetApp={mockOnResetApp}
      />
    );

    fireEvent.press(getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles clear cache press', () => {
    const { getByText } = render(
      <DebugMenu
        visible={true}
        onClose={mockOnClose}
        onClearCache={mockOnClearCache}
        onResetApp={mockOnResetApp}
      />
    );

    fireEvent.press(getByText('Clear Cache'));
    expect(mockOnClearCache).toHaveBeenCalled();
  });

  it('handles reset app press', () => {
    const { getByText } = render(
      <DebugMenu
        visible={true}
        onClose={mockOnClose}
        onClearCache={mockOnClearCache}
        onResetApp={mockOnResetApp}
      />
    );

    fireEvent.press(getByText('Reset App'));
    expect(mockOnResetApp).toHaveBeenCalled();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <DebugMenu
        visible={false}
        onClose={mockOnClose}
        onClearCache={mockOnClearCache}
        onResetApp={mockOnResetApp}
      />
    );

    expect(queryByText('Debug Menu')).toBeNull();
  });

  it('renders debug options', () => {
    const { getByText } = render(<DebugMenu />);

    expect(getByText('Run Performance Test')).toBeTruthy();
    expect(getByText('Export Metrics')).toBeTruthy();
    expect(getByText('Clear Data')).toBeTruthy();
  });

  it('runs performance test', async () => {
    const { getByText, findByText } = render(<DebugMenu />);

    fireEvent.press(getByText('Run Performance Test'));

    expect(await findByText('Latency: 100ms')).toBeTruthy();
    expect(await findByText('Throughput: 1000/s')).toBeTruthy();
  });

  it('exports metrics', async () => {
    const { getByText } = render(<DebugMenu />);

    fireEvent.press(getByText('Export Metrics'));

    expect(PerformanceMonitor.getMetrics).toHaveBeenCalled();
  });

  it('clears performance data', async () => {
    const { getByText } = render(<DebugMenu />);

    fireEvent.press(getByText('Clear Data'));

    expect(PerformanceMonitor.resetMetrics).toHaveBeenCalled();
  });

  it('handles test errors', async () => {
    const error = new Error('Test failed');
    (BenchmarkScenarios.runScenario as jest.Mock).mockRejectedValue(error);

    const { getByText, findByText } = render(<DebugMenu />);
    
    fireEvent.press(getByText('Run Performance Test'));
    
    expect(await findByText('Test failed')).toBeTruthy();
  });

  it('provides accessible buttons', () => {
    const { getByRole } = render(<DebugMenu />);

    expect(getByRole('button', { name: 'Run Performance Test' })).toBeTruthy();
    expect(getByRole('button', { name: 'Export Metrics' })).toBeTruthy();
    expect(getByRole('button', { name: 'Clear Data' })).toBeTruthy();
  });

  it('shows loading state during test', async () => {
    const { getByText, findByText } = render(<DebugMenu />);

    fireEvent.press(getByText('Run Performance Test'));

    expect(await findByText('Running test...')).toBeTruthy();
  });

  it('displays test results in correct format', async () => {
    const { getByText, findByText } = render(<DebugMenu />);

    fireEvent.press(getByText('Run Performance Test'));

    expect(await findByText('Latency: 100ms')).toBeTruthy();
    expect(await findByText('Throughput: 1000/s')).toBeTruthy();
    expect(await findByText('Error Rate: 1%')).toBeTruthy();
  });
}); 