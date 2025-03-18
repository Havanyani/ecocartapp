import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { WeightTracker } from '../../components/collection/WeightTracker';
import { formatWeight } from '../../utils/formatters';

// Mock chart component
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart'
}));

// Mock icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

// Mock formatters
jest.mock('../../utils/formatters', () => ({
  formatWeight: jest.fn(weight => `${weight}kg`)
}));

describe('WeightTracker', () => {
  const mockOnWeightChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <WeightTracker
        onWeightChange={mockOnWeightChange}
        onSubmit={mockOnSubmit}
        currentWeight={0}
      />
    );
    expect(getByTestId('weight-tracker')).toBeTruthy();
  });

  it('handles weight input', () => {
    const { getByTestId } = render(
      <WeightTracker
        onWeightChange={mockOnWeightChange}
        onSubmit={mockOnSubmit}
        currentWeight={0}
      />
    );

    const input = getByTestId('weight-input');
    fireEvent.changeText(input, '5.5');
    expect(mockOnWeightChange).toHaveBeenCalledWith(5.5);
  });

  it('handles submit button press', () => {
    const { getByTestId } = render(
      <WeightTracker
        onWeightChange={mockOnWeightChange}
        onSubmit={mockOnSubmit}
        currentWeight={5.5}
      />
    );

    fireEvent.press(getByTestId('submit-button'));
    expect(mockOnSubmit).toHaveBeenCalledWith(5.5);
  });

  it('displays current weight correctly', () => {
    const { getByTestId } = render(
      <WeightTracker
        onWeightChange={mockOnWeightChange}
        onSubmit={mockOnSubmit}
        currentWeight={10.2}
      />
    );

    const input = getByTestId('weight-input');
    expect(input.props.value).toBe('10.2');
  });

  it('validates weight input', () => {
    const { getByTestId } = render(
      <WeightTracker
        onWeightChange={mockOnWeightChange}
        onSubmit={mockOnSubmit}
        currentWeight={0}
      />
    );

    const input = getByTestId('weight-input');
    fireEvent.changeText(input, '-1');
    expect(mockOnWeightChange).toHaveBeenCalledWith(0);
  });

  const mockData = {
    currentWeight: 50,
    weeklyGoal: 75,
    monthlyGoal: 300,
    history: [
      { date: '2024-02-01', weight: 45 },
      { date: '2024-02-08', weight: 48 },
      { date: '2024-02-15', weight: 50 }
    ]
  };

  it('displays current weight and goals', () => {
    const { getByTestId } = render(<WeightTracker data={mockData} />);

    expect(getByTestId('current-weight')).toHaveTextContent('50kg');
    expect(getByTestId('weekly-goal')).toHaveTextContent('75kg');
    expect(getByTestId('monthly-goal')).toHaveTextContent('300kg');
  });

  it('shows progress towards goals', () => {
    const { getByTestId } = render(<WeightTracker data={mockData} />);

    expect(getByTestId('weekly-progress')).toHaveTextContent('66.7%'); // 50/75
    expect(getByTestId('monthly-progress')).toHaveTextContent('16.7%'); // 50/300
  });

  it('renders weight history chart', () => {
    const { getByTestId } = render(<WeightTracker data={mockData} />);

    const chart = getByTestId('weight-history-chart');
    expect(chart).toBeTruthy();
    expect(chart.props.data).toEqual(
      expect.arrayContaining([45, 48, 50])
    );
  });

  it('provides accessible information', () => {
    const { getByLabelText } = render(<WeightTracker data={mockData} />);

    expect(getByLabelText('Current weight: 50 kilograms')).toBeTruthy();
    expect(getByLabelText('Weekly goal: 75 kilograms')).toBeTruthy();
    expect(getByLabelText('Monthly goal: 300 kilograms')).toBeTruthy();
  });

  it('handles empty history', () => {
    const emptyData = {
      ...mockData,
      history: []
    };

    const { getByText } = render(<WeightTracker data={emptyData} />);
    expect(getByText('No weight history available')).toBeTruthy();
  });

  it('formats weights correctly', () => {
    render(<WeightTracker data={mockData} />);
    expect(formatWeight).toHaveBeenCalledWith(mockData.currentWeight);
  });

  it('displays trend indicators', () => {
    const { getByTestId } = render(<WeightTracker data={mockData} />);
    
    const trendIcon = getByTestId('trend-icon');
    expect(trendIcon).toBeTruthy();
    // Trend is upward since last weight (50) is higher than previous (48)
    expect(trendIcon.props.name).toBe('trending-up');
  });

  it('applies correct styling', () => {
    const { getByTestId } = render(<WeightTracker data={mockData} />);

    const container = getByTestId('weight-tracker-container');
    expect(container).toHaveStyle({
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 8
    });
  });
}); 