import { render } from '@testing-library/react-native';
import React from 'react';
import OfflineNotice from '../../../src/components/ui/OfflineNotice';
import { useNetworkConnectivity } from '../../../src/hooks/useNetworkConnectivity';

// Mock the useNetworkConnectivity hook
jest.mock('../../../src/hooks/useNetworkConnectivity');

describe('OfflineNotice', () => {
  const mockUseNetworkConnectivity = useNetworkConnectivity as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render offline notice when not connected', () => {
    // Mock the hook to return disconnected state
    mockUseNetworkConnectivity.mockReturnValue({
      isConnected: false,
      isLoading: false,
      networkInfo: {
        type: 'none',
        isInternetReachable: false
      },
      checkConnection: jest.fn()
    });
    
    const { getByTestId, getByText } = render(<OfflineNotice />);
    
    expect(getByTestId('offline-notice')).toBeTruthy();
    expect(getByText('You are offline')).toBeTruthy();
  });
  
  it('should not render when connected', () => {
    // Mock the hook to return connected state
    mockUseNetworkConnectivity.mockReturnValue({
      isConnected: true,
      isLoading: false,
      networkInfo: {
        type: 'wifi',
        isInternetReachable: true
      },
      checkConnection: jest.fn()
    });
    
    const { queryByTestId } = render(<OfflineNotice />);
    
    expect(queryByTestId('offline-notice')).toBeNull();
  });
  
  it('should not render when loading', () => {
    // Mock the hook to return loading state
    mockUseNetworkConnectivity.mockReturnValue({
      isConnected: false,
      isLoading: true,
      networkInfo: {
        type: 'unknown',
        isInternetReachable: false
      },
      checkConnection: jest.fn()
    });
    
    const { queryByTestId } = render(<OfflineNotice />);
    
    expect(queryByTestId('offline-notice')).toBeNull();
  });
}); 