import { CollectionSummary } from '@/components/collection/CollectionSummary';
import { CollectionMaterials } from '@/types/Collection';
import { render } from '@testing-library/react-native';
import { format } from 'date-fns';
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

describe('CollectionSummary', () => {
  const mockDate = '2024-03-20';
  const mockTimeSlot = '09:00 - 11:00';
  const mockMaterials: CollectionMaterials[] = [
    {
      id: '1',
      material: {
        name: 'Plastic Bottles',
        icon: 'bottle-soda',
        creditPerKg: 10,
      },
    },
    {
      id: '2',
      material: {
        name: 'Glass',
        icon: 'bottle-wine',
        creditPerKg: 5,
      },
    },
  ];
  const mockEstimatedWeight = 8.5;

  it('renders collection details correctly', () => {
    const { getByText } = render(
      <CollectionSummary
        date={mockDate}
        timeSlot={mockTimeSlot}
        materials={mockMaterials}
        estimatedWeight={mockEstimatedWeight}
      />
    );

    expect(getByText('Collection Summary')).toBeTruthy();
    expect(getByText(format(new Date(mockDate), 'MMMM d, yyyy'))).toBeTruthy();
    expect(getByText(mockTimeSlot)).toBeTruthy();
  });

  it('displays all selected materials', () => {
    const { getByText } = render(
      <CollectionSummary
        date={mockDate}
        timeSlot={mockTimeSlot}
        materials={mockMaterials}
        estimatedWeight={mockEstimatedWeight}
      />
    );

    expect(getByText('Plastic Bottles')).toBeTruthy();
    expect(getByText('Glass')).toBeTruthy();
    expect(getByText('10 credits/kg')).toBeTruthy();
    expect(getByText('5 credits/kg')).toBeTruthy();
  });

  it('calculates and displays total weight correctly', () => {
    const { getByText } = render(
      <CollectionSummary
        date={mockDate}
        timeSlot={mockTimeSlot}
        materials={mockMaterials}
        estimatedWeight={mockEstimatedWeight}
      />
    );

    expect(getByText('8.50 kg')).toBeTruthy();
  });

  it('calculates and displays estimated credits correctly', () => {
    const { getByText } = render(
      <CollectionSummary
        date={mockDate}
        timeSlot={mockTimeSlot}
        materials={mockMaterials}
        estimatedWeight={mockEstimatedWeight}
      />
    );

    // Expected credits: (10 + 5) * 8.5 = 127.5, rounded to 128
    expect(getByText('128 credits')).toBeTruthy();
  });

  it('handles zero weight correctly', () => {
    const { getByText } = render(
      <CollectionSummary
        date={mockDate}
        timeSlot={mockTimeSlot}
        materials={mockMaterials}
        estimatedWeight={0}
      />
    );

    expect(getByText('0.00 kg')).toBeTruthy();
    expect(getByText('0 credits')).toBeTruthy();
  });
}); 