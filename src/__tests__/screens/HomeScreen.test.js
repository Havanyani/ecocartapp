import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../../screens/HomeScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigation.navigate.mockClear();
  });

  it('renders welcome message', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Welcome back!')).toBeTruthy();
  });

  it('navigates to schedule screen', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Schedule Collection'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Schedule');
  });
}); 