import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert, Text, View } from 'react-native';
import ARContainerScanner from '../../components/ar/ARContainerScanner';
import { ContributionVerificationPanel } from '../../components/ar/ContributionVerificationPanel';
import {
    getPendingContributions,
    submitContribution,
    verifyContribution
} from '../../services/MaterialsContributionService';

// Mock the required modules
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

// Mock the MaterialsContributionService
jest.mock('../../services/MaterialsContributionService', () => {
  // Mock data for our tests
  const mockContributions = [];
  
  return {
    submitContribution: jest.fn((contributionData, imageUri) => {
      const newContribution = {
        id: `contrib_${Date.now()}`,
        containerName: contributionData.containerName,
        material: contributionData.material,
        isRecyclable: contributionData.isRecyclable,
        uploadedBy: contributionData.uploadedBy,
        uploadedAt: new Date(),
        status: 'pending',
        imageUri: imageUri,
        verificationCount: 0
      };
      
      mockContributions.push(newContribution);
      
      return Promise.resolve({
        success: true,
        message: 'Contribution submitted successfully',
        contributionId: newContribution.id
      });
    }),
    
    getPendingContributions: jest.fn(() => {
      return Promise.resolve(mockContributions.filter(c => c.status === 'pending'));
    }),
    
    verifyContribution: jest.fn((contributionId, verifiedBy) => {
      const contribution = mockContributions.find(c => c.id === contributionId);
      
      if (!contribution) {
        return Promise.resolve({
          success: false,
          message: 'Contribution not found'
        });
      }
      
      contribution.verificationCount += 1;
      
      // Auto-approve if enough verifications (3)
      if (contribution.verificationCount >= 3) {
        contribution.status = 'approved';
      }
      
      return Promise.resolve({
        success: true,
        message: contribution.status === 'approved' 
          ? 'Contribution verified and approved' 
          : 'Contribution verified',
        contributionId
      });
    })
  };
});

// Mock the UI components we depend on but aren't directly testing
jest.mock('../../components/ar/ARGuideOverlay', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ isScanning, containerDetected }) => {
      return (
        <View data-testid="ar-guide-overlay" data-scanning={isScanning} data-detected={containerDetected}>
          <Text>AR Guide Overlay</Text>
        </View>
      );
    })
  };
});

// Wrap components in a test wrapper that simulates our app context
const TestWrapper = ({ children }) => {
  return (
    <View>
      {children}
    </View>
  );
};

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && buttons.length > 0) {
    // By default, simulate pressing the first button
    buttons[0].onPress?.();
  }
  return 0;
});

describe('Container Recognition Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  it('completes full container recognition and contribution flow', async () => {
    // Step 1: Render the AR scanner
    const { getByText, findByTestId, queryByTestId } = render(
      <TestWrapper>
        <ARContainerScanner userId="test-user-123" />
      </TestWrapper>
    );
    
    // Wait for the scanner to initialize
    await waitFor(() => {
      expect(queryByTestId('ar-guide-overlay')).toBeTruthy();
    });
    
    // Step 2: Mock a failed recognition
    // Change the alert mock to select "Contribute" option
    Alert.alert.mockImplementation((title, message, buttons) => {
      if (title === 'Container Not Recognized' && buttons?.length > 1) {
        // Press the "Contribute" button
        buttons[1].onPress?.();
      }
      return 0;
    });
    
    // Mock image capture
    const mockImageUri = 'file:///mock/image/path.jpg';
    jest.spyOn(ARContainerScanner.prototype, 'simulateContainerRecognition').mockImplementation(async function() {
      this.setCapturedImageUri(mockImageUri);
      this.setIsScanning(true);
      this.setContainerDetected(true);
      
      // Simulate the alert that would normally appear
      Alert.alert(
        'Container Not Recognized',
        'We couldn\'t identify this container. Would you like to contribute information about it to help improve our database?',
        [
          { text: 'No, Thanks', style: 'cancel' },
          { text: 'Contribute', onPress: () => this.setShowContribution(true) }
        ]
      );
      
      this.setIsScanning(false);
      this.setContainerDetected(false);
    });
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Step 3: Verify contribution form appears
    await waitFor(() => {
      expect(queryByTestId('container-contribution-form')).toBeTruthy();
    });
    
    // Step 4: Fill out and submit the contribution form
    const contributionForm = await findByTestId('container-contribution-form');
    
    // Fill form fields
    const containerNameInput = await findByTestId('container-name-input');
    const materialInput = await findByTestId('material-input');
    const recyclableSwitch = await findByTestId('recyclable-switch');
    const submitButton = await findByTestId('submit-button');
    
    fireEvent.changeText(containerNameInput, 'Glass Yogurt Jar');
    fireEvent.changeText(materialInput, 'Glass');
    fireEvent.valueChange(recyclableSwitch, true);
    
    // Submit the form
    fireEvent.press(submitButton);
    
    // Verify the contribution was submitted
    await waitFor(() => {
      expect(submitContribution).toHaveBeenCalledWith(
        expect.objectContaining({
          containerName: 'Glass Yogurt Jar',
          material: 'Glass',
          isRecyclable: true,
          uploadedBy: 'test-user-123'
        }),
        mockImageUri
      );
    });
    
    // Verify the success message
    expect(Alert.alert).toHaveBeenCalledWith(
      'Thank You!',
      expect.stringContaining('improve recycling for everyone'),
      expect.any(Array)
    );
    
    // Step 5: Now test the verification flow
    // Render the verification panel
    const { findByText, getAllByTestId } = render(
      <TestWrapper>
        <ContributionVerificationPanel userId="test-verifier-456" />
      </TestWrapper>
    );
    
    // Wait for pending contributions to load
    await waitFor(() => {
      expect(getPendingContributions).toHaveBeenCalled();
    });
    
    // Find the contributed container in the list
    const contributionItems = await getAllByTestId('contribution-item');
    expect(contributionItems.length).toBeGreaterThan(0);
    
    // Find the Glass Yogurt Jar contribution
    const yogurtJarItem = contributionItems.find(item => 
      item.props['data-container-name'] === 'Glass Yogurt Jar'
    );
    expect(yogurtJarItem).toBeTruthy();
    
    // Verify the contribution
    const verifyButton = await findByTestId('verify-button-' + yogurtJarItem.props['data-id']);
    fireEvent.press(verifyButton);
    
    // Check that verification was called
    await waitFor(() => {
      expect(verifyContribution).toHaveBeenCalledWith(
        yogurtJarItem.props['data-id'],
        'test-verifier-456'
      );
    });
    
    // Simulate multiple verifications to reach approval threshold
    await act(async () => {
      // Get the contribution ID
      const contributionId = yogurtJarItem.props['data-id'];
      
      // Add two more verifications (total of 3)
      await verifyContribution(contributionId, 'test-verifier-789');
      await verifyContribution(contributionId, 'test-verifier-999');
      
      // Refresh the contributions list
      await getPendingContributions();
    });
    
    // After 3 verifications, the item should be approved and no longer pending
    const updatedPendingItems = await getAllByTestId('contribution-item');
    const approvedItem = updatedPendingItems.find(item => 
      item.props['data-container-name'] === 'Glass Yogurt Jar'
    );
    
    // Since it's approved, it should no longer be in the pending list
    expect(approvedItem).toBeUndefined();
  });
  
  it('handles contribution rejection correctly', async () => {
    // Similar to previous test, but test the rejection path
    // First add a contribution to reject
    await submitContribution({
      containerName: 'Styrofoam Cup',
      material: 'Polystyrene',
      isRecyclable: false,
      uploadedBy: 'test-user-789'
    }, 'file:///mock/styrofoam.jpg');
    
    // Render the admin panel
    const { findByTestId, getAllByTestId } = render(
      <TestWrapper>
        <AdminMaterialsDatabaseScreen />
      </TestWrapper>
    );
    
    // Wait for contributions to load
    await waitFor(() => {
      expect(getPendingContributions).toHaveBeenCalled();
    });
    
    // Find the Styrofoam Cup contribution
    const contributionItems = await getAllByTestId('contribution-item');
    const styrofoamItem = contributionItems.find(item => 
      item.props['data-container-name'] === 'Styrofoam Cup'
    );
    expect(styrofoamItem).toBeTruthy();
    
    // Find and press the reject button
    const rejectButton = await findByTestId('reject-button-' + styrofoamItem.props['data-id']);
    fireEvent.press(rejectButton);
    
    // Verify rejection modal appears
    const rejectionModal = await findByTestId('rejection-modal');
    expect(rejectionModal).toBeTruthy();
    
    // Fill in rejection reason
    const reasonInput = await findByTestId('rejection-reason-input');
    fireEvent.changeText(reasonInput, 'Insufficient information provided');
    
    // Confirm rejection
    const confirmButton = await findByTestId('confirm-rejection-button');
    fireEvent.press(confirmButton);
    
    // Verify rejection was called
    await waitFor(() => {
      expect(rejectContribution).toHaveBeenCalledWith(
        styrofoamItem.props['data-id'],
        'admin',
        'Insufficient information provided'
      );
    });
    
    // Verify the contribution is no longer in the pending list
    await waitFor(() => {
      const updatedContributions = getAllByTestId('contribution-item');
      const rejectedItem = updatedContributions.find(item => 
        item.props['data-container-name'] === 'Styrofoam Cup'
      );
      expect(rejectedItem).toBeUndefined();
    });
  });
  
  it('displays machine learning recognition results correctly', async () => {
    // Mock a real ML-based recognition (simulated)
    const mockMLResult = {
      containerType: 'Plastic Bottle',
      material: 'HDPE',
      isRecyclable: true,
      confidence: 0.92,
      environmentalImpact: {
        co2Saved: 0.3,
        waterSaved: 1.8
      }
    };
    
    // Mock the ML recognition service
    jest.mock('../../services/MLRecognitionService', () => ({
      recognizeContainerFromImage: jest.fn().mockResolvedValue(mockMLResult)
    }));
    
    // Mock the camera scanner to use our ML service
    jest.spyOn(ARContainerScanner.prototype, 'simulateContainerRecognition').mockImplementation(async function() {
      this.setIsScanning(true);
      this.setContainerDetected(true);
      
      // Simulate successful ML recognition
      setTimeout(() => {
        this.setRecognizedContainer({
          id: 'ml_detected_1',
          name: mockMLResult.containerType,
          material: mockMLResult.material,
          isRecyclable: mockMLResult.isRecyclable,
          confidence: mockMLResult.confidence,
          environmentalImpact: mockMLResult.environmentalImpact
        });
        
        this.setIsScanning(false);
        this.setContainerDetected(false);
      }, 1000);
    });
    
    // Render the AR scanner
    const { getByText, findByTestId } = render(
      <TestWrapper>
        <ARContainerScanner userId="test-user-123" />
      </TestWrapper>
    );
    
    // Wait for the scanner to initialize
    await findByTestId('ar-guide-overlay');
    
    // Press the scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Verify the container info is shown with correct data
    await waitFor(() => {
      const containerInfoCard = findByTestId('container-info-card');
      expect(containerInfoCard).resolves.toHaveAttribute('data-container-name', 'Plastic Bottle');
      expect(containerInfoCard).resolves.toHaveAttribute('data-container-material', 'HDPE');
      expect(containerInfoCard).resolves.toHaveAttribute('data-recyclable', 'true');
    });
    
    // Verify environmental impact is shown
    const impactInfo = await findByTestId('environmental-impact');
    expect(impactInfo).toHaveTextContent('0.3 kg CO2');
    expect(impactInfo).toHaveTextContent('1.8 L water');
  });
}); 