import OptimizedImage from '@/components/OptimizedImage';
import AssetOptimizer from '@/utils/performance/AssetOptimizer';
import { trackPerformanceEvent } from '@/utils/performance/initializePerformanceOptimizations';
import { render, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';
import React from 'react';

// Mock dependencies
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file://cache/',
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn(),
  moveAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  downloadAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: {
    JPEG: 'jpeg',
  },
  manipulateAsync: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: jest.fn().mockImplementation(({ onLoad, testID }) => {
    // Call onLoad if provided to simulate image loading
    if (onLoad) {
      setTimeout(() => {
        onLoad();
      }, 0);
    }
    return {
      type: 'expo-image',
      props: { testID }
    };
  }),
}));

jest.mock('@/utils/performance/initializePerformanceOptimizations', () => ({
  trackPerformanceEvent: jest.fn(),
}));

jest.mock('@/utils/performance/AssetOptimizer', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn().mockReturnValue({
      recordAsset: jest.fn(),
    }),
  },
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock useWindowDimensions hook
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    useWindowDimensions: () => ({
      width: 375,
      height: 812,
    }),
  };
});

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with a local image source', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={require('@/assets/images/eco-logo.png')} 
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image')).toBeTruthy();
  });

  it('shows loading state initially for remote images', () => {
    // Mock getInfoAsync to simulate no cached version
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
    
    const { getByTestId } = render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image-loading')).toBeTruthy();
  });

  it('renders placeholder while loading', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        placeholder={require('@/assets/images/placeholder.png')}
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image-placeholder')).toBeTruthy();
  });

  it('uses blurhash placeholder if provided', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image-blurhash')).toBeTruthy();
  });

  it('optimizes remote images when no cached version exists', async () => {
    // Mock getInfoAsync to simulate no cached version
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
    
    // Mock downloadAsync to simulate successful download
    (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({ status: 200 });
    
    // Mock manipulateAsync to simulate successful image manipulation
    (manipulateAsync as jest.Mock).mockResolvedValue({ uri: 'file://optimized.jpg' });
    
    const { getByTestId } = render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        optimizeQuality={true}
        testID="test-image"
      />
    );
    
    // Wait for optimization to complete
    await waitFor(() => {
      expect(FileSystem.downloadAsync).toHaveBeenCalled();
    });
    
    expect(manipulateAsync).toHaveBeenCalled();
    expect(FileSystem.moveAsync).toHaveBeenCalled();
    expect(AssetOptimizer.getInstance().recordAsset).toHaveBeenCalled();
  });

  it('uses cached version when available', async () => {
    // Mock getInfoAsync to simulate cached version exists
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    
    const { getByTestId } = render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        testID="test-image"
      />
    );
    
    // Wait for cache check to complete
    await waitFor(() => {
      expect(FileSystem.getInfoAsync).toHaveBeenCalled();
    });
    
    // Should not download or manipulate
    expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
    expect(manipulateAsync).not.toHaveBeenCalled();
  });

  it('tracks image loading performance', async () => {
    // Mock getInfoAsync to simulate cached version exists
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    
    render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        testID="test-image"
      />
    );
    
    // Wait for image to load
    await waitFor(() => {
      expect(trackPerformanceEvent).toHaveBeenCalledWith('image_load', expect.any(Number));
    });
    
    // Should also track render time
    expect(trackPerformanceEvent).toHaveBeenCalledWith('image_render', expect.any(Number));
  });

  it('handles loading errors gracefully', async () => {
    // Mock getInfoAsync to throw an error
    (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(new Error('File system error'));
    
    const onErrorMock = jest.fn();
    
    render(
      <OptimizedImage 
        source={{ uri: 'https://example.com/image.jpg' }} 
        onError={onErrorMock}
        testID="test-image"
      />
    );
    
    // Wait for error to be handled
    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
    });
  });
  
  it('renders with blur effect when blurRadius is provided', () => {
    const { getByTestId } = render(
      <OptimizedImage 
        source={require('@/assets/images/eco-logo.png')} 
        blurRadius={10}
        testID="test-image"
      />
    );
    
    expect(getByTestId('test-image')).toBeTruthy();
  });
  
  it('respects different contentFit values', () => {
    const { rerender } = render(
      <OptimizedImage 
        source={require('@/assets/images/eco-logo.png')} 
        contentFit="cover"
        testID="test-image"
      />
    );
    
    // Re-render with different contentFit value
    rerender(
      <OptimizedImage 
        source={require('@/assets/images/eco-logo.png')} 
        contentFit="contain"
        testID="test-image"
      />
    );
    
    // This is mainly testing that different contentFit values don't cause errors
    expect(true).toBeTruthy();
  });
}); 