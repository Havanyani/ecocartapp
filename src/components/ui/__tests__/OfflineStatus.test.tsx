import { useOfflineState } from '@/hooks/useOfflineState';
import { useTheme } from '@/hooks/useTheme';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { OfflineStatus } from '../OfflineStatus';

// Mock the hooks
jest.mock('@/hooks/useOfflineState');
jest.mock('@/hooks/useTheme');

describe('OfflineStatus', () => {
  const mockUseOfflineState = useOfflineState as jest.MockedFunction<typeof useOfflineState>;
  const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default theme mock
    mockUseTheme.mockReturnValue({
      theme: {
        colors: {
          error: '#FF0000',
          warning: '#FFA500',
        },
      },
    } as any);
  });

  it('should not render when online with no pending or failed actions', () => {
    mockUseOfflineState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      pendingActions: 0,
      failedActions: 0,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { container } = render(<OfflineStatus />);
    expect(container.children.length).toBe(0);
  });

  it('should render offline message when disconnected', () => {
    mockUseOfflineState.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: null,
      pendingActions: 0,
      failedActions: 0,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { getByText } = render(<OfflineStatus />);
    expect(getByText("You're offline")).toBeTruthy();
  });

  it('should render pending actions message', () => {
    mockUseOfflineState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      pendingActions: 3,
      failedActions: 0,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { getByText } = render(<OfflineStatus />);
    expect(getByText('3 actions pending sync')).toBeTruthy();
  });

  it('should render failed actions message', () => {
    mockUseOfflineState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      pendingActions: 0,
      failedActions: 2,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { getByText } = render(<OfflineStatus />);
    expect(getByText('2 actions failed')).toBeTruthy();
  });

  it('should call onRetry when failed actions message is pressed', async () => {
    const mockOnRetry = jest.fn();
    mockUseOfflineState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      pendingActions: 0,
      failedActions: 1,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { getByText } = render(<OfflineStatus onRetry={mockOnRetry} />);
    
    fireEvent.press(getByText('1 action failed'));
    
    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('should render both pending and failed actions messages', () => {
    mockUseOfflineState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      pendingActions: 3,
      failedActions: 2,
      syncPendingActions: jest.fn(),
      retryFailedActions: jest.fn(),
    });

    const { getByText } = render(<OfflineStatus />);
    expect(getByText('3 actions pending sync')).toBeTruthy();
    expect(getByText('2 actions failed')).toBeTruthy();
  });
}); 