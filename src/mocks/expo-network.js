/**
 * Mock implementation of expo-network for web platform
 */

export const getNetworkStateAsync = async () => {
  return {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };
};

export const getIpAddressAsync = async () => {
  return '127.0.0.1';
};

export const getMacAddressAsync = async () => {
  return '00:00:00:00:00:00';
};

export const getNetworkState = () => {
  return {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };
}; 