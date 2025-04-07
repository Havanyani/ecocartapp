import { CollectionSummary } from '@/components/collection/CollectionSummary';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { CollectionLocation, CollectionMaterials, TimeSlot } from '@/types/Collection';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock the theme hook and related functions
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000000',
        textSecondary: '#666666',
        background: '#FFFFFF',
        card: '#F5F5F5',
        border: '#E0E0E0',
        primary: '#2E7D32',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        white: '#FFFFFF',
        black: '#000000',
      },
      dark: false,
    },
    toggleTheme: jest.fn(),
  }),
  getColor: (theme: any, color: string) => theme.colors[color],
  getSpacing: (theme: any, spacing: string) => 8,
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'MockedIonicons',
}));

describe('CollectionSummary', () => {
  const mockProps = {
    date: new Date('2023-10-01T12:00:00Z'),
    timeSlot: {
      id: '1',
      startTime: '09:00',
      endTime: '12:00',
    } as TimeSlot,
    materials: [
      {
        id: '1',
        material: {
          id: '1',
          name: 'Paper',
          description: 'Recyclable paper',
          category: 'Paper',
          creditPerKg: 2,
          icon: 'document',
        },
      },
      {
        id: '2',
        material: {
          id: '2',
          name: 'Glass',
          description: 'Glass bottles',
          category: 'Glass',
          creditPerKg: 1.5,
          icon: 'flask',
        },
      },
    ] as CollectionMaterials[],
    location: {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      isDefault: true,
    } as CollectionLocation,
    estimatedWeight: 5,
    notes: 'Please collect after 10 AM',
    onNotesChange: jest.fn(),
  };

  it('renders correctly with all props', () => {
    render(
      <ThemeProvider>
        <CollectionSummary {...mockProps} />
      </ThemeProvider>
    );

    // Check for key elements
    expect(screen.getByText('Collection Summary')).toBeTruthy();
    expect(screen.getByText('Date & Time')).toBeTruthy();
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.getByText('Materials (2)')).toBeTruthy();
    expect(screen.getByText('Estimated Credits')).toBeTruthy();
    expect(screen.getByText('Additional Notes')).toBeTruthy();
    
    // Check for specific data
    expect(screen.getByText('Sunday, October 1, 2023')).toBeTruthy();
    expect(screen.getByText('09:00 - 12:00')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('Springfield, IL 62701')).toBeTruthy();
    expect(screen.getByText('Paper')).toBeTruthy();
    expect(screen.getByText('Glass')).toBeTruthy();
    expect(screen.getByText('5.0 kg')).toBeTruthy();
    
    // Check for notes
    const notesInput = screen.getByDisplayValue('Please collect after 10 AM');
    expect(notesInput).toBeTruthy();
  });

  it('displays error message when required information is missing', () => {
    const incompleteProps = {
      ...mockProps,
      timeSlot: null,
    };

    render(
      <ThemeProvider>
        <CollectionSummary {...incompleteProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('Missing required information. Please complete all previous steps.')).toBeTruthy();
  });

  it('calculates credits correctly based on material weight', () => {
    render(
      <ThemeProvider>
        <CollectionSummary {...mockProps} />
      </ThemeProvider>
    );

    // Total credits calculation:
    // Paper: 2 credits/kg * 2.5kg = 5 credits
    // Glass: 1.5 credits/kg * 2.5kg = 3.75 credits
    // Total: 8.75 credits, rounded to 9
    expect(screen.getByText('9 credits')).toBeTruthy();
  });
}); 