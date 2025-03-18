import { WeightEstimator } from '@/components/collection/WeightEstimator';
import { CollectionMaterials } from '@/types/Collection';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock the useTheme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#34C759',
        background: '#FFFFFF',
        text: {
          primary: '#000000',
          secondary: '#8E8E93',
        },
      },
    },
  }),
}));

describe('WeightEstimator', () => {
  const mockMaterials: CollectionMaterials[] = [
    {
      id: '1',
      material: {
        name: 'Plastic Bottles',
        type: 'PET',
        icon: 'bottle-soda',
        creditPerKg: 10,
      },
    },
    {
      id: '2',
      material: {
        name: 'Glass',
        type: 'GLASS',
        icon: 'bottle-wine',
        creditPerKg: 5,
      },
    },
  ];
  const mockOnWeightEstimate = jest.fn();

  beforeEach(() => {
    mockOnWeightEstimate.mockClear();
  });

  it('renders correctly with no materials selected', () => {
    const { getByText } = render(
      <WeightEstimator
        materials={[]}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    expect(getByText('Weight Estimation')).toBeTruthy();
    expect(getByText('Please select materials to estimate weight')).toBeTruthy();
  });

  it('renders weight input fields for selected materials', () => {
    const { getByText, getAllByPlaceholderText } = render(
      <WeightEstimator
        materials={mockMaterials}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    expect(getByText('Plastic Bottles')).toBeTruthy();
    expect(getByText('Glass')).toBeTruthy();
    expect(getAllByPlaceholderText('0.0')).toHaveLength(2);
  });

  it('calls onWeightEstimate when weight is entered', () => {
    const { getAllByPlaceholderText } = render(
      <WeightEstimator
        materials={mockMaterials}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    const inputs = getAllByPlaceholderText('0.0');
    fireEvent.changeText(inputs[0], '5.5');
    fireEvent.changeText(inputs[1], '3.2');

    expect(mockOnWeightEstimate).toHaveBeenCalledWith(8.7);
  });

  it('displays total weight correctly', () => {
    const { getByText, getAllByPlaceholderText } = render(
      <WeightEstimator
        materials={mockMaterials}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    const inputs = getAllByPlaceholderText('0.0');
    fireEvent.changeText(inputs[0], '5.5');
    fireEvent.changeText(inputs[1], '3.2');

    expect(getByText('8.70 kg')).toBeTruthy();
  });

  it('filters non-numeric input', () => {
    const { getAllByPlaceholderText } = render(
      <WeightEstimator
        materials={mockMaterials}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    const input = getAllByPlaceholderText('0.0')[0];
    fireEvent.changeText(input, 'abc12.34def');

    expect(input.props.value).toBe('12.34');
  });

  it('handles decimal point correctly', () => {
    const { getAllByPlaceholderText } = render(
      <WeightEstimator
        materials={mockMaterials}
        onWeightEstimate={mockOnWeightEstimate}
      />
    );

    const input = getAllByPlaceholderText('0.0')[0];
    fireEvent.changeText(input, '12.34');

    expect(mockOnWeightEstimate).toHaveBeenCalledWith(12.34);
  });
}); 