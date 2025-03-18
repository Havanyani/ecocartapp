import { TimeSlotSelector } from '@/components/collection/TimeSlotSelector';
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
        disabled: '#E5E5EA',
        text: {
          primary: '#000000',
          secondary: '#8E8E93',
        },
      },
    },
  }),
}));

describe('TimeSlotSelector', () => {
  const mockDate = '2024-03-20';
  const mockAvailableSlots = [
    {
      id: '1',
      startTime: '09:00',
      endTime: '11:00',
      available: true,
    },
    {
      id: '2',
      startTime: '11:00',
      endTime: '13:00',
      available: false,
    },
    {
      id: '3',
      startTime: '14:00',
      endTime: '16:00',
      available: true,
    },
  ];
  const mockOnSelectSlot = jest.fn();

  beforeEach(() => {
    mockOnSelectSlot.mockClear();
  });

  it('renders correctly with available slots', () => {
    const { getByText } = render(
      <TimeSlotSelector
        date={mockDate}
        availableSlots={mockAvailableSlots}
        selectedSlot=""
        onSelectSlot={mockOnSelectSlot}
      />
    );

    expect(getByText('Available Time Slots')).toBeTruthy();
    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('11:00')).toBeTruthy();
  });

  it('shows unavailable status for unavailable slots', () => {
    const { getByText } = render(
      <TimeSlotSelector
        date={mockDate}
        availableSlots={mockAvailableSlots}
        selectedSlot=""
        onSelectSlot={mockOnSelectSlot}
      />
    );

    expect(getByText('Unavailable')).toBeTruthy();
  });

  it('calls onSelectSlot when an available slot is pressed', () => {
    const { getByText } = render(
      <TimeSlotSelector
        date={mockDate}
        availableSlots={mockAvailableSlots}
        selectedSlot=""
        onSelectSlot={mockOnSelectSlot}
      />
    );

    fireEvent.press(getByText('09:00'));
    expect(mockOnSelectSlot).toHaveBeenCalledWith('1');
  });

  it('does not call onSelectSlot when an unavailable slot is pressed', () => {
    const { getByText } = render(
      <TimeSlotSelector
        date={mockDate}
        availableSlots={mockAvailableSlots}
        selectedSlot=""
        onSelectSlot={mockOnSelectSlot}
      />
    );

    fireEvent.press(getByText('11:00'));
    expect(mockOnSelectSlot).not.toHaveBeenCalled();
  });

  it('highlights the selected slot', () => {
    const { getByText } = render(
      <TimeSlotSelector
        date={mockDate}
        availableSlots={mockAvailableSlots}
        selectedSlot="1"
        onSelectSlot={mockOnSelectSlot}
      />
    );

    const slot = getByText('09:00').parent;
    expect(slot?.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#34C759', // primary color
      })
    );
  });
}); 