import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Camera from 'expo-camera';
import React from 'react';
import { Alert } from 'react-native';
import ARContainerScanner from '../../../components/ar/ARContainerScanner';

// Mock the camera component and permissions
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      Type: {
        back: 'back',
      },
      FlashMode: {
        off: 'off',
        on: 'on',
      },
    },
  },
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the ContributionContributionForm component
jest.mock('../../../components/ar/ContainerContributionForm', () => {
  return jest.fn().mockImplementation(({ onSuccess, onCancel }) => (
    <div data-testid="mock-contribution-form">
      <button data-testid="mock-submit" onClick={onSuccess}>Submit</button>
      <button data-testid="mock-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ));
});

describe('ARContainerScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the camera permission request if permission is not yet granted', async () => {
    // Mock camera permission not granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'undetermined' 
    });

    const { getByText } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      expect(getByText('Camera permission is required to scan containers')).toBeTruthy();
    });
  });

  it('renders the camera view when permission is granted', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      expect(getByTestId('ar-camera-view')).toBeTruthy();
    });
  });

  it('simulates container recognition when scan button is pressed', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it('displays scanner controls when in scanning state', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      expect(getByTestId('scanner-controls')).toBeTruthy();
    });
  });

  it('shows the contribution form for unrecognized containers', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    // Mock the Alert.alert to trigger the "Contribute" option
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // Find the "Contribute" button and call its onPress
      const contributeButton = buttons?.find(button => button.text === 'Contribute');
      if (contributeButton && contributeButton.onPress) {
        contributeButton.onPress();
      }
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
    });

    await waitFor(() => {
      expect(getByTestId('mock-contribution-form')).toBeTruthy();
    });
  });

  it('handles contribution success', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    // Mock the Alert.alert to trigger the "Contribute" option
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // Find the "Contribute" button and call its onPress
      const contributeButton = buttons?.find(button => button.text === 'Contribute');
      if (contributeButton && contributeButton.onPress) {
        contributeButton.onPress();
      }
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
    });

    await waitFor(() => {
      const submitButton = getByTestId('mock-submit');
      fireEvent.press(submitButton);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Thank you for your contribution! It will be reviewed and added to our database.',
        expect.anything()
      );
    });
  });

  it('handles contribution cancellation', async () => {
    // Mock camera permission granted
    (Camera.Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ 
      status: 'granted' 
    });

    // Mock the Alert.alert to trigger the "Contribute" option
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // Find the "Contribute" button and call its onPress
      const contributeButton = buttons?.find(button => button.text === 'Contribute');
      if (contributeButton && contributeButton.onPress) {
        contributeButton.onPress();
      }
    });

    const { getByTestId } = render(<ARContainerScanner userId="user123" />);

    await waitFor(() => {
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
    });

    await waitFor(() => {
      const cancelButton = getByTestId('mock-cancel');
      fireEvent.press(cancelButton);
      // After cancellation, we should be back to the scanner state
      expect(getByTestId('scanner-controls')).toBeTruthy();
    });
  });
}); 