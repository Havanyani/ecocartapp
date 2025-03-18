import type { RootStackParamList } from '@/navigation/types';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SyncService } from '@/services/SyncService';
import { WebSocketService } from '@/services/WebSocketService';
import { PerformanceMonitor } from '@/utils/PerformanceMonitoring';
import type { RouteProp } from '@react-navigation/native';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/services/SyncService');
jest.mock('@/services/WebSocketService');
jest.mock('@/utils/Performance');
jest.mock('@/components/CommunityBoard', () => ({
  CommunityBoard: () => null
}));
jest.mock('@/components/DebugMenu', () => ({
  DebugMenu: () => null
}));
jest.mock('@/components/LoyaltyProgram', () => ({
  LoyaltyProgram: () => null
}));
jest.mock('@/components/sustainability/SustainabilityMetrics', () => ({
  default: () => null
}));

interface MockNavigation {
  navigate: jest.Mock;
}

const mockNavigation: MockNavigation = {
  navigate: jest.fn(),
};

const mockRoute: RouteProp<RootStackParamList, 'Profile'> = {
  key: 'Profile',
  name: 'Profile',
  params: undefined
};

describe('ProfileScreen', () => {
  const mockUserId = '123';
  const mockUserData = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    credits: 100,
    loyalty: {
      points: 750,
      level: 'Silver'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SyncService.syncUserData as jest.Mock).mockResolvedValue({
      data: mockUserData,
      timestamp: Date.now(),
      status: 'success'
    });
    (WebSocketService.subscribe as jest.Mock).mockReturnValue(jest.fn());
    mockNavigation.navigate.mockClear();
  });

  it('renders user profile information', async () => {
    const { getByText, getByTestId } = render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getByTestId('profile-screen')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
  });

  it('loads user data on mount', async () => {
    render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(SyncService.syncUserData).toHaveBeenCalledWith(mockUserId);
  });

  it('subscribes to WebSocket events', async () => {
    render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(WebSocketService.subscribe).toHaveBeenCalledWith('creditsUpdate', expect.any(Function));
    expect(WebSocketService.subscribe).toHaveBeenCalledWith('newAchievement', expect.any(Function));
  });

  it('handles navigation to other screens', async () => {
    const { getByText } = render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(getByText('Collection History'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CollectionHistory');

    fireEvent.press(getByText('Payment Methods'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('PaymentMethods');

    fireEvent.press(getByText('Settings'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
  });

  it('handles sync error gracefully', async () => {
    const error = new Error('Sync failed');
    (SyncService.syncUserData as jest.Mock).mockRejectedValue(error);

    render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(PerformanceMonitor.captureError).toHaveBeenCalledWith(error);
  });

  it('updates user data on WebSocket events', async () => {
    let creditsCallback: Function;
    let achievementCallback: Function;

    (WebSocketService.subscribe as jest.Mock)
      .mockImplementation((event: string, callback: Function) => {
        if (event === 'creditsUpdate') creditsCallback = callback;
        if (event === 'newAchievement') achievementCallback = callback;
        return jest.fn();
      });

    const { getByText } = render(
      <ProfileScreen 
        navigation={mockNavigation}
        route={mockRoute}
        userId={mockUserId}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Test credits update
    act(() => {
      creditsCallback(200);
    });

    // Test achievement update
    act(() => {
      achievementCallback({ points: 50 });
    });

    // Add expectations for updated values once implemented
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