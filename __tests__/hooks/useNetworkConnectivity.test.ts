import NetInfo from '@react-native-community/netinfo';
import { act, renderHook } from '@testing-library/react-hooks';
import { useNetworkConnectivity } from '../../src/hooks/useNetworkConnectivity';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn()
}));

describe('useNetworkConnectivity', () => {
  const mockNetInfoFetch = NetInfo.fetch as jest.Mock;
  const mockNetInfoAddEventListener = NetInfo.addEventListener as jest.Mock;
  let removeListenerMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    removeListenerMock = jest.fn();
    mockNetInfoAddEventListener.mockReturnValue(removeListenerMock);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useNetworkConnectivity());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isConnected).toBe(false);
  });

  it('should update connection status when network state changes', async () => {
    // Mock initial network state
    mockNetInfoFetch.mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {
        isConnectionExpensive: false,
        cellularGeneration: null
      }
    });

    const { result, waitForNextUpdate } = renderHook(() => useNetworkConnectivity());
    
    // Wait for initial network check to complete
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.networkInfo.type).toBe('wifi');
    
    // Simulate network change event
    const listenerCallback = mockNetInfoAddEventListener.mock.calls[0][0];
    act(() => {
      listenerCallback({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {
          isConnectionExpensive: false,
          cellularGeneration: null
        }
      });
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.networkInfo.type).toBe('none');
  });

  it('should handle null network state gracefully', async () => {
    mockNetInfoFetch.mockResolvedValueOnce(null);
    
    const { result, waitForNextUpdate } = renderHook(() => useNetworkConnectivity());
    
    // Wait for initial network check to complete
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnected).toBe(false);
  });

  it('should cleanup listener on unmount', () => {
    const { unmount } = renderHook(() => useNetworkConnectivity());
    
    unmount();
    
    expect(removeListenerMock).toHaveBeenCalled();
  });

  it('should handle manual refresh check', async () => {
    // Initial state
    mockNetInfoFetch.mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
      details: {
        isConnectionExpensive: false,
        cellularGeneration: null
      }
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useNetworkConnectivity());
    
    // Wait for initial network check to complete
    await waitForNextUpdate();
    
    expect(result.current.isConnected).toBe(false);
    
    // Mock updated network state for manual check
    mockNetInfoFetch.mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
      details: {
        isConnectionExpensive: true,
        cellularGeneration: '4g'
      }
    });
    
    // Trigger manual check
    act(() => {
      result.current.checkConnection();
    });
    
    // Wait for manual check to complete
    await waitForNextUpdate();
    
    expect(result.current.isConnected).toBe(true);
    expect(result.current.networkInfo.type).toBe('cellular');
    expect(result.current.networkInfo.isConnectionExpensive).toBe(true);
    expect(result.current.networkInfo.cellularGeneration).toBe('4g');
  });
}); 