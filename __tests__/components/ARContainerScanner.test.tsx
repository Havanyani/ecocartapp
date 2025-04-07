import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import ARContainerScanner from '../../src/components/ar/ARContainerScanner';

// Mock dependencies
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
    Constants: { Type: { back: 'back' } },
  },
  requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock MaterialsContributionService
jest.mock('../../src/services/MaterialsContributionService', () => {
  return {
    submitContribution: jest.fn(() => Promise.resolve({ success: true })),
  };
});

describe('ARContainerScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful camera permissions
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    // Mock successful media library permissions
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
  });

  it('renders loading state initially', () => {
    const { getByTestId } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    expect(getByTestId('loading-container')).toBeTruthy();
  });

  it('requests camera permissions on mount', async () => {
    render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('shows permission denied message when camera permission is rejected', async () => {
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });
    
    const { getByText } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByText(/camera permission/i)).toBeTruthy();
    });
  });

  it('renders camera view when permissions are granted', async () => {
    const { getByTestId } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      expect(getByTestId('camera-view')).toBeTruthy();
    });
  });

  it('shows scanning UI elements when camera is ready', async () => {
    const { getByTestId } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    // Simulate camera ready
    await act(async () => {
      const cameraView = await waitFor(() => getByTestId('camera-view'));
      fireEvent(cameraView, 'onCameraReady');
    });
    
    expect(getByTestId('scan-button')).toBeTruthy();
    expect(getByTestId('guide-overlay')).toBeTruthy();
  });

  it('toggles to photo library when gallery button is pressed', async () => {
    const { getByTestId } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    await waitFor(() => {
      const galleryButton = getByTestId('gallery-button');
      fireEvent.press(galleryButton);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('detects container when scan button is pressed', async () => {
    const { getByTestId, getByText } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    // Simulate camera ready
    await act(async () => {
      const cameraView = await waitFor(() => getByTestId('camera-view'));
      fireEvent(cameraView, 'onCameraReady');
    });
    
    // Press scan button
    const scanButton = getByTestId('scan-button');
    fireEvent.press(scanButton);
    
    // Should show processing state
    expect(getByText(/analyzing/i)).toBeTruthy();
    
    // Wait for detection to complete (simulated detection takes time)
    await waitFor(() => {
      expect(getByTestId('container-detected')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('navigates to contribution form when container is recognized and contribute button is pressed', async () => {
    const { getByTestId } = render(<ARContainerScanner navigation={mockNavigation as any} />);
    
    // Simulate camera ready
    await act(async () => {
      const cameraView = await waitFor(() => getByTestId('camera-view'));
      fireEvent(cameraView, 'onCameraReady');
    });
    
    // Press scan button to detect container
    const scanButton = getByTestId('scan-button');
    fireEvent.press(scanButton);
    
    // Wait for detection
    await waitFor(() => {
      const contributeButton = getByTestId('contribute-button');
      fireEvent.press(contributeButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'ContainerContributionForm',
        expect.objectContaining({
          imageData: expect.any(String),
        })
      );
    }, { timeout: 3000 });
  });

  it('shows error message when recognition fails', async () => {
    // Override the default container detection for this test
    jest.useFakeTimers();
    
    const { getByTestId, getByText, queryByTestId } = render(
      <ARContainerScanner navigation={mockNavigation as any} failRecognition={true} />
    );
    
    // Simulate camera ready
    await act(async () => {
      const cameraView = waitFor(() => getByTestId('camera-view'));
      fireEvent(cameraView, 'onCameraReady');
    });
    
    // Press scan button
    const scanButton = getByTestId('scan-button');
    fireEvent.press(scanButton);
    
    // Fast-forward timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Should show error message
    expect(getByText(/couldn't recognize/i)).toBeTruthy();
    expect(queryByTestId('container-detected')).toBeNull();
    
    jest.useRealTimers();
  });
}); 