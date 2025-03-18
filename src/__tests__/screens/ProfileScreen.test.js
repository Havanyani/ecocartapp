import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ProfileScreen from '../../screens/ProfileScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockNavigation.navigate.mockClear();
  });

  it('renders user profile information', () => {
    const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
  });

  it('displays correct stats', () => {
    const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);
    expect(getByText('52.4kg')).toBeTruthy();
    expect(getByText('R 262')).toBeTruthy();
  });

  it('navigates to settings', () => {
    const { getByText } = render(<ProfileScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Settings'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
  });
}); 