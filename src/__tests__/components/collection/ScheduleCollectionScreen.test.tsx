import { ScheduleCollectionScreen } from '@/screens/collection/ScheduleCollectionScreen';
import { act, fireEvent, render } from '@testing-library/react-native';
import { format } from 'date-fns';
import React from 'react';

// Mock the hooks
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

jest.mock('@/hooks/useCollectionSchedule', () => ({
  useCollectionSchedule: () => ({
    scheduleCollection: jest.fn(),
    availableSlots: [
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
        available: true,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe('ScheduleCollectionScreen', () => {
  it('renders initial state correctly', () => {
    const { getByText } = render(<ScheduleCollectionScreen />);

    expect(getByText('Schedule Collection')).toBeTruthy();
    expect(getByText('Select Materials')).toBeTruthy();
  });

  it('enables schedule button only when all fields are filled', async () => {
    const { getByText, getAllByText } = render(<ScheduleCollectionScreen />);
    const scheduleButton = getByText('Schedule Collection');
    expect(scheduleButton.props.disabled).toBeTruthy();

    // Select a date
    const today = format(new Date(), 'yyyy-MM-dd');
    await act(async () => {
      fireEvent.press(getByText(today.split('-')[2])); // Press today's date
    });

    // Select a time slot
    await act(async () => {
      fireEvent.press(getByText('09:00'));
    });

    // Select a material
    await act(async () => {
      fireEvent.press(getByText('Plastic Bottles'));
    });

    // Enter weight
    const weightInput = getAllByText('0.0')[0];
    await act(async () => {
      fireEvent.changeText(weightInput, '5.5');
    });

    expect(scheduleButton.props.disabled).toBeFalsy();
  });

  it('shows collection summary when all selections are made', async () => {
    const { getByText, getAllByText } = render(<ScheduleCollectionScreen />);

    // Make all selections
    const today = format(new Date(), 'yyyy-MM-dd');
    await act(async () => {
      fireEvent.press(getByText(today.split('-')[2]));
      fireEvent.press(getByText('09:00'));
      fireEvent.press(getByText('Plastic Bottles'));
      const weightInput = getAllByText('0.0')[0];
      fireEvent.changeText(weightInput, '5.5');
    });

    expect(getByText('Collection Summary')).toBeTruthy();
    expect(getByText('5.50 kg')).toBeTruthy();
    expect(getByText('55 credits')).toBeTruthy(); // 10 credits/kg * 5.5 kg
  });

  it('handles multiple material selections', async () => {
    const { getByText } = render(<ScheduleCollectionScreen />);

    await act(async () => {
      fireEvent.press(getByText('Plastic Bottles'));
      fireEvent.press(getByText('Glass'));
    });

    expect(getByText('10 credits/kg')).toBeTruthy();
    expect(getByText('5 credits/kg')).toBeTruthy();
  });

  it('updates total credits when weight changes', async () => {
    const { getByText, getAllByText } = render(<ScheduleCollectionScreen />);

    // Select materials and enter weights
    await act(async () => {
      fireEvent.press(getByText('Plastic Bottles'));
      fireEvent.press(getByText('Glass'));
      
      const weightInputs = getAllByText('0.0');
      fireEvent.changeText(weightInputs[0], '2.5');
      fireEvent.changeText(weightInputs[1], '1.5');
    });

    // Calculate expected credits: (10 * 2.5) + (5 * 1.5) = 32.5 rounded to 33
    expect(getByText('33 credits')).toBeTruthy();
  });
}); 