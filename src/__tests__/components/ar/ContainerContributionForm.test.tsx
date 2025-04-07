import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';
import ContainerContributionForm from '../../../components/ar/ContainerContributionForm';
import * as MaterialsContributionService from '../../../services/MaterialsContributionService';

// Mock the services
jest.mock('../../../services/MaterialsContributionService', () => ({
  submitContribution: jest.fn(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  },
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('ContainerContributionForm', () => {
  const mockProps = {
    userId: 'user123',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  const mockImage = {
    cancelled: false,
    assets: [{ uri: 'file:///test/image.jpg' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MaterialsContributionService.submitContribution as jest.Mock).mockResolvedValue({
      success: true,
      contributionId: 'contrib123',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImage);
  });

  it('renders the form with initial empty state', () => {
    const { getByPlaceholderText, getByText, queryByTestId } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    expect(getByPlaceholderText('Container name')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByText('Material Type')).toBeTruthy();
    expect(getByText('No')).toBeTruthy(); // Default recyclable value is false
    expect(queryByTestId('container-image')).toBeNull(); // No image initially
  });

  it('allows selecting an image from gallery', async () => {
    const { getByTestId } = render(<ContainerContributionForm {...mockProps} />);
    
    const galleryButton = getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(getByTestId('container-image')).toBeTruthy();
    });
  });

  it('allows toggling the camera view', async () => {
    const { getByTestId, queryByTestId } = render(<ContainerContributionForm {...mockProps} />);
    
    const cameraButton = getByTestId('camera-button');
    fireEvent.press(cameraButton);
    
    await waitFor(() => {
      expect(Camera.Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(queryByTestId('camera-view')).toBeTruthy();
    });
    
    // Toggle it back off
    const closeButton = getByTestId('close-camera-button');
    fireEvent.press(closeButton);
    
    await waitFor(() => {
      expect(queryByTestId('camera-view')).toBeNull();
    });
  });

  it('updates form fields correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    const nameInput = getByPlaceholderText('Container name');
    fireEvent.changeText(nameInput, 'Test Container');
    expect(nameInput.props.value).toBe('Test Container');
    
    const descriptionInput = getByPlaceholderText('Description');
    fireEvent.changeText(descriptionInput, 'This is a test container');
    expect(descriptionInput.props.value).toBe('This is a test container');
    
    // Toggle recyclable to Yes
    const yesButton = getByText('Yes');
    fireEvent.press(yesButton);
    expect(yesButton.props.style).toEqual(expect.objectContaining({ 
      backgroundColor: expect.any(String) 
    }));
  });

  it('shows validation errors for empty required fields', async () => {
    const { getByTestId } = render(<ContainerContributionForm {...mockProps} />);
    
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Information',
        expect.stringContaining('Please provide a container name'),
        expect.anything()
      );
    });
  });

  it('shows validation error for missing image', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    // Fill in name but no image
    const nameInput = getByPlaceholderText('Container name');
    fireEvent.changeText(nameInput, 'Test Container');
    
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Information',
        expect.stringContaining('Please take or select an image'),
        expect.anything()
      );
    });
  });

  it('submits the form with valid data', async () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    // Add an image
    const galleryButton = getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    // Fill in required fields
    const nameInput = getByPlaceholderText('Container name');
    fireEvent.changeText(nameInput, 'Test Container');
    
    const descriptionInput = getByPlaceholderText('Description');
    fireEvent.changeText(descriptionInput, 'This is a test container');
    
    // Select material
    const materialPicker = getByTestId('material-picker');
    fireEvent(materialPicker, 'onValueChange', 'plastic');
    
    // Set recyclable to true
    const yesButton = getByText('Yes');
    fireEvent.press(yesButton);
    
    // Instructions and location (optional)
    const instructionsInput = getByPlaceholderText('Recycling instructions (optional)');
    fireEvent.changeText(instructionsInput, 'Rinse before recycling');
    
    const locationInput = getByPlaceholderText('Location found (optional)');
    fireEvent.changeText(locationInput, 'Test Location');
    
    await waitFor(() => {
      // Submit the form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(MaterialsContributionService.submitContribution).toHaveBeenCalledWith({
        containerName: 'Test Container',
        material: 'plastic',
        isRecyclable: true,
        description: 'This is a test container',
        instructions: 'Rinse before recycling',
        location: 'Test Location',
        imageUri: 'file:///test/image.jpg',
        userId: 'user123'
      });
      
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission errors', async () => {
    (MaterialsContributionService.submitContribution as jest.Mock).mockRejectedValue(
      new Error('Submission failed')
    );
    
    const { getByTestId, getByPlaceholderText } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    // Add an image
    const galleryButton = getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    // Fill required fields
    const nameInput = getByPlaceholderText('Container name');
    fireEvent.changeText(nameInput, 'Test Container');
    
    await waitFor(() => {
      // Submit the form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);
    });
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to submit contribution: Submission failed',
        expect.anything()
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(<ContainerContributionForm {...mockProps} />);
    
    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('disables form submission during submission process', async () => {
    // Make the submission function delay to simulate network request
    (MaterialsContributionService.submitContribution as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    
    const { getByTestId, getByPlaceholderText } = render(
      <ContainerContributionForm {...mockProps} />
    );
    
    // Add an image
    const galleryButton = getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    // Fill required fields
    const nameInput = getByPlaceholderText('Container name');
    fireEvent.changeText(nameInput, 'Test Container');
    
    // Submit the form
    const submitButton = getByTestId('submit-button');
    fireEvent.press(submitButton);
    
    // Check submit button is disabled during submission
    expect(submitButton.props.disabled).toBe(true);
    
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });
}); 