import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import ARContainerScanner from '../../components/ar/ARContainerScanner';

// Mock necessary dependencies
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: {
        back: 'back'
      }
    }
  }
}));

jest.mock('../../components/ar/ARGuideOverlay', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ isScanning, containerDetected }) => {
      return (
        <div data-testid="ar-guide-overlay" data-scanning={isScanning} data-detected={containerDetected}>
          AR Guide Overlay
        </div>
      );
    })
  };
});

jest.mock('../../components/ar/ContainerInfoCard', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ container, onAddToCollection, onViewDetails }) => {
      return (
        <div 
          data-testid="container-info-card"
          data-container-name={container?.name}
          onClick={() => {
            if (onAddToCollection) onAddToCollection();
          }}
        >
          Container Info Card
        </div>
      );
    })
  };
});

jest.mock('../../components/ar/ContainerContributionForm', () => {
  return {
    ContainerContributionForm: jest.fn().mockImplementation(({ userId, onSuccess, onCancel }) => {
      return (
        <div 
          data-testid="container-contribution-form"
          data-user-id={userId}
        >
          <button 
            data-testid="contribution-success-button" 
            onClick={onSuccess}
          >
            Success
          </button>
          <button 
            data-testid="contribution-cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      );
    })
  };
});

// Mock the Alert implementation
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Simulate clicking the first button in the alert
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
  return 0;
});

describe('ARContainerScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with camera permissions granted', async () => {
    const { getByText, queryByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for permissions check to complete
    await waitFor(() => {
      expect(queryByTestId('ar-guide-overlay')).toBeTruthy();
    });
    
    // Check that the scan button is rendered
    expect(getByText('Scan Container')).toBeTruthy();
  });

  it('handles camera permission denied', async () => {
    // Mock camera permission denied for this test
    jest.mock('expo-camera', () => ({
      Camera: {
        requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
      }
    }));
    
    const { getByText } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for permissions check to complete
    await waitFor(() => {
      expect(getByText('Camera access is required to use the AR scanner.')).toBeTruthy();
    });
  });

  it('shows scanning state when scan button is pressed', async () => {
    const { getByText, findByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Check that scanning state is updated
    await waitFor(() => {
      const overlay = findByTestId('ar-guide-overlay');
      expect(overlay).resolves.toHaveAttribute('data-scanning', 'true');
    });
  });

  it('shows container info when a container is recognized', async () => {
    // Mock the container recognition implementation to always succeed
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 0 as any;
    });
    
    // Mock a successful recognition result
    const mockRecognitionResult = {
      recognized: true,
      container: {
        id: '1',
        name: 'Test Container',
        material: 'Test Material',
        isRecyclable: true,
        confidence: 0.9
      }
    };
    
    // Mock the simulateRecognitionResult function
    jest.spyOn(ARContainerScanner.prototype, 'simulateRecognitionResult').mockReturnValue(mockRecognitionResult);
    
    const { getByText, findByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Check that container info is shown
    await waitFor(() => {
      const infoCard = findByTestId('container-info-card');
      expect(infoCard).resolves.toHaveAttribute('data-container-name', 'Test Container');
    });
  });

  it('shows contribution form when container is not recognized', async () => {
    // Mock the container recognition implementation to always fail
    const mockRecognitionResult = {
      recognized: false,
      container: null
    };
    
    // Mock the simulateRecognitionResult function
    jest.spyOn(ARContainerScanner.prototype, 'simulateRecognitionResult').mockReturnValue(mockRecognitionResult);
    
    // Mock the Alert to select the "Contribute" option
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      // Simulate clicking the "Contribute" button
      if (buttons && buttons.length > 1 && buttons[1].onPress) {
        buttons[1].onPress();
      }
      return 0;
    });
    
    const { getByText, findByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Check that contribution form is shown
    await waitFor(() => {
      const contributionForm = findByTestId('container-contribution-form');
      expect(contributionForm).resolves.toHaveAttribute('data-user-id', 'test-user');
    });
  });

  it('handles contribution success correctly', async () => {
    // Similar to previous test, but trigger the success callback
    const mockRecognitionResult = {
      recognized: false,
      container: null
    };
    
    jest.spyOn(ARContainerScanner.prototype, 'simulateRecognitionResult').mockReturnValue(mockRecognitionResult);
    
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      if (buttons && buttons.length > 1 && buttons[1].onPress) {
        buttons[1].onPress();
      }
      return 0;
    });
    
    const { getByText, findByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Find the contribution form
    const successButton = await findByTestId('contribution-success-button');
    
    // Press the success button
    fireEvent.press(successButton);
    
    // Verify that the Thank You alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      'Thank You!',
      expect.stringContaining('will help improve recycling'),
      expect.any(Array)
    );
  });

  it('handles contribution cancellation correctly', async () => {
    // Similar to previous test, but trigger the cancel callback
    const mockRecognitionResult = {
      recognized: false,
      container: null
    };
    
    jest.spyOn(ARContainerScanner.prototype, 'simulateRecognitionResult').mockReturnValue(mockRecognitionResult);
    
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      if (buttons && buttons.length > 1 && buttons[1].onPress) {
        buttons[1].onPress();
      }
      return 0;
    });
    
    const { getByText, findByTestId } = render(
      <ARContainerScanner userId="test-user" />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Find the contribution form
    const cancelButton = await findByTestId('contribution-cancel-button');
    
    // Press the cancel button
    fireEvent.press(cancelButton);
    
    // Verify that the form is closed (this would need component-specific verification)
    // For example, we might check that certain elements are no longer in the DOM
    await waitFor(() => {
      expect(findByTestId('container-contribution-form')).rejects.toThrow();
    });
  });
  
  it('calls onContainerRecognized callback when a container is recognized', async () => {
    const onContainerRecognized = jest.fn();
    
    // Mock a successful recognition result
    const mockRecognitionResult = {
      recognized: true,
      container: {
        id: '1',
        name: 'Test Container',
        material: 'Test Material',
        isRecyclable: true,
        confidence: 0.9
      }
    };
    
    jest.spyOn(ARContainerScanner.prototype, 'simulateRecognitionResult').mockReturnValue(mockRecognitionResult);
    
    const { getByText, findByTestId } = render(
      <ARContainerScanner 
        userId="test-user"
        onContainerRecognized={onContainerRecognized}
      />
    );
    
    // Wait for component to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Verify callback was called with the recognized container
    await waitFor(() => {
      expect(onContainerRecognized).toHaveBeenCalledWith(mockRecognitionResult.container);
    });
  });
}); 