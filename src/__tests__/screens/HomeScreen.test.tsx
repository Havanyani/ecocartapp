import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { HomeScreen } from '../../screens/HomeScreen';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/dateUtils';

// Mock the necessary dependencies
jest.mock('../../services/UserService');
jest.mock('../../services/PickupService');

type MockNavigation = Partial<NativeStackNavigationProp<RootStackParamList, 'Home'>>;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const mockProps: Partial<Props> = {
  navigation: {
    navigate: jest.fn(),
  } as any,
  route: {
    key: 'Home',
    name: 'Home'
  } as any
};

describe('HomeScreen', () => {
  const mockPickup = {
    date: new Date('2024-02-20'),
    status: 'scheduled',
    weight: 5
  };

  const mockUserData = {
    credits: 100,
    upcomingPickups: [mockPickup]
  };

  beforeEach(() => {
    (mockProps.navigation?.navigate as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);

    expect(getByText('Welcome to EcoCart')).toBeTruthy();
    expect(getByText('Available Credits: $100.00')).toBeTruthy();
    expect(getByText('Upcoming Pickups')).toBeTruthy();
    expect(getByText(formatDate(mockPickup.date))).toBeTruthy();
  });

  it('loads user data on mount', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);
    expect(getByText('Available Credits: $100.00')).toBeTruthy();
  });

  it('displays pickup details', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);
    
    expect(getByText(`Status: ${mockPickup.status}`)).toBeTruthy();
    expect(getByText(`Weight: ${mockPickup.weight}kg`)).toBeTruthy();
  });

  it('formats currency correctly', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);
    expect(getByText('Available Credits: $100.00')).toBeTruthy();
  });

  it('renders welcome message', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);
    expect(getByText('Welcome back!')).toBeTruthy();
  });

  it('navigates to schedule screen', () => {
    const { getByText } = render(<HomeScreen {...mockProps as Props} />);
    fireEvent.press(getByText('Schedule Collection'));
    expect(mockProps.navigation?.navigate).toHaveBeenCalledWith('Schedule');
  });
}); 