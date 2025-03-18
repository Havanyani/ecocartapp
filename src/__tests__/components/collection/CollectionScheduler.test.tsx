import '@testing-library/jest-native/extend-expect';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import CollectionScheduler from '../../../../components/CollectionScheduler';
import { useTheme } from '../../../hooks/useTheme';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium'
  }
}));

// Mock theme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn()
}));

const mockTheme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    disabled: '#CCCCCC'
  },
  spacing: {
    base: 8,
    large: 16
  }
};

describe('CollectionScheduler', () => {
  const mockTimeSlots = [
    { id: '1', time: '09:00-12:00', available: true },
    { id: '2', time: '12:00-15:00', available: true },
    { id: '3', time: '15:00-18:00', available: false }
  ];

  const mockOnSchedule = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders all time slots', () => {
    const { getAllByRole } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    const slots = getAllByRole('button');
    expect(slots).toHaveLength(mockTimeSlots.length);
  });

  it('handles time slot selection with haptic feedback', async () => {
    const { getByTestId } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    const slot = getByTestId('time-slot-1');
    
    await act(async () => {
      fireEvent.press(slot);
    });

    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(mockOnSchedule).toHaveBeenCalledWith(mockTimeSlots[0]);
  });

  it('disables unavailable time slots', () => {
    const { getByTestId } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    const unavailableSlot = getByTestId('time-slot-3');
    expect(unavailableSlot).toBeDisabled();
  });

  it('provides accessible time selection', () => {
    const { getByTestId } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    const slot = getByTestId('time-slot-1');
    expect(slot).toHaveProp('accessibilityRole', 'button');
    expect(slot).toHaveProp('accessibilityLabel', expect.stringContaining('Select time slot'));
    expect(slot).toHaveAccessibilityState({ disabled: false });
  });

  it('shows selected state for chosen time slot', async () => {
    const { getByTestId } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    const slot = getByTestId('time-slot-1');
    
    await act(async () => {
      fireEvent.press(slot);
    });

    expect(slot).toHaveStyle({ 
      backgroundColor: expect.any(String),
      opacity: expect.any(Number)
    });
  });

  it('displays time slots in correct format', () => {
    const { getByText } = render(
      <CollectionScheduler 
        timeSlots={mockTimeSlots}
        onSchedule={mockOnSchedule}
      />
    );

    mockTimeSlots.forEach(slot => {
      expect(getByText(slot.time)).toBeTruthy();
    });
  });
}); 