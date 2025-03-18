import { MaterialSelector } from '@/components/collection/MaterialSelector';
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
        card: '#F2F2F7',
        text: {
          primary: '#000000',
          secondary: '#8E8E93',
        },
        success: '#28CD41',
      },
    },
  }),
}));

describe('MaterialSelector', () => {
  const mockSelectedMaterials: CollectionMaterials[] = [
    {
      id: '1',
      material: {
        name: 'Plastic Bottles',
        type: 'PET',
        icon: 'bottle-soda',
        creditPerKg: 10,
      },
    },
  ];
  const mockOnSelectMaterials = jest.fn();

  beforeEach(() => {
    mockOnSelectMaterials.mockClear();
  });

  it('renders correctly with material options', () => {
    const { getByText } = render(
      <MaterialSelector
        selectedMaterials={[]}
        onSelectMaterials={mockOnSelectMaterials}
      />
    );

    expect(getByText('Select Materials')).toBeTruthy();
    expect(getByText('Plastic Bottles')).toBeTruthy();
    expect(getByText('Glass')).toBeTruthy();
    expect(getByText('Paper')).toBeTruthy();
    expect(getByText('Aluminum Cans')).toBeTruthy();
  });

  it('shows selected materials with different styling', () => {
    const { getByText } = render(
      <MaterialSelector
        selectedMaterials={mockSelectedMaterials}
        onSelectMaterials={mockOnSelectMaterials}
      />
    );

    const materialItem = getByText('Plastic Bottles').parent;
    expect(materialItem?.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#34C759', // primary color
      })
    );
  });

  it('calls onSelectMaterials when a material is selected', () => {
    const { getByText } = render(
      <MaterialSelector
        selectedMaterials={[]}
        onSelectMaterials={mockOnSelectMaterials}
      />
    );

    fireEvent.press(getByText('Plastic Bottles'));
    expect(mockOnSelectMaterials).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        material: expect.objectContaining({
          name: 'Plastic Bottles',
        }),
      }),
    ]);
  });

  it('calls onSelectMaterials to deselect when a selected material is pressed', () => {
    const { getByText } = render(
      <MaterialSelector
        selectedMaterials={mockSelectedMaterials}
        onSelectMaterials={mockOnSelectMaterials}
      />
    );

    fireEvent.press(getByText('Plastic Bottles'));
    expect(mockOnSelectMaterials).toHaveBeenCalledWith([]);
  });

  it('displays credit information for each material', () => {
    const { getByText } = render(
      <MaterialSelector
        selectedMaterials={[]}
        onSelectMaterials={mockOnSelectMaterials}
      />
    );

    expect(getByText('10 credits/kg')).toBeTruthy();
    expect(getByText('5 credits/kg')).toBeTruthy();
    expect(getByText('3 credits/kg')).toBeTruthy();
    expect(getByText('15 credits/kg')).toBeTruthy();
  });
}); 