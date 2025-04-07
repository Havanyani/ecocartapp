import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import AdminMaterialsDatabaseScreen from '../../screens/AdminMaterialsDatabaseScreen';
import * as MaterialsContributionService from '../../services/MaterialsContributionService';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock MaterialsContributionService
jest.mock('../../services/MaterialsContributionService', () => ({
  getPendingContributions: jest.fn(),
  verifyContribution: jest.fn(),
  rejectContribution: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock data
const mockPendingContributions = [
  {
    id: 'contrib1',
    containerName: 'Plastic Bottle',
    material: 'plastic',
    isRecyclable: true,
    description: 'A standard plastic water bottle',
    uploadedBy: 'user123',
    uploadedAt: new Date().toISOString(),
    status: 'pending',
    imageUri: 'https://example.com/image1.jpg',
    verificationCount: 1,
    environmentalImpact: {
      co2Savings: 2.5,
      waterSavings: 100,
      energyConservation: 5.8
    }
  },
  {
    id: 'contrib2',
    containerName: 'Glass Jar',
    material: 'glass',
    isRecyclable: true,
    description: 'A glass jar with metal lid',
    uploadedBy: 'user456',
    uploadedAt: new Date().toISOString(),
    status: 'pending',
    imageUri: 'https://example.com/image2.jpg',
    verificationCount: 0,
    environmentalImpact: {
      co2Savings: 0.3,
      waterSavings: 50,
      energyConservation: 2.7
    }
  }
];

const mockApprovedMaterials = [
  {
    id: 'material1',
    name: 'Approved Bottle',
    material: 'plastic',
    isRecyclable: true,
    description: 'An approved container',
    imageUrl: 'https://example.com/approved1.jpg',
    environmentalImpact: {
      co2Savings: 2.5,
      waterSavings: 100,
      energyConservation: 5.8
    }
  },
  {
    id: 'material2',
    name: 'Approved Can',
    material: 'aluminum',
    isRecyclable: true,
    description: 'An approved can',
    imageUrl: 'https://example.com/approved2.jpg',
    environmentalImpact: {
      co2Savings: 9.5,
      waterSavings: 1000,
      energyConservation: 14
    }
  }
];

describe('AdminMaterialsDatabaseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (MaterialsContributionService.getPendingContributions as jest.Mock).mockResolvedValue(mockPendingContributions);
    (MaterialsContributionService.verifyContribution as jest.Mock).mockResolvedValue({
      success: true,
      contribution: { ...mockPendingContributions[0], verificationCount: 2 }
    });
    (MaterialsContributionService.rejectContribution as jest.Mock).mockResolvedValue({
      success: true,
      contribution: { ...mockPendingContributions[0], status: 'rejected', rejectionReason: 'Test reason' }
    });
  });

  it('renders loading state initially', async () => {
    const { getByTestId } = render(<AdminMaterialsDatabaseScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders the pending contributions tab by default', async () => {
    const { getByText, queryByTestId } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Pending Contributions')).toBeTruthy();
      expect(getByText('Plastic Bottle')).toBeTruthy();
      expect(getByText('Glass Jar')).toBeTruthy();
    });
  });

  it('allows switching between tabs', async () => {
    const { getByText, getAllByTestId } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const tabs = getAllByTestId('tab-button');
      expect(tabs.length).toBe(2);
      
      // Click on the Approved Materials tab
      fireEvent.press(tabs[1]);
      expect(getByText('Approved Materials')).toBeTruthy();
      
      // Click back to Pending Contributions
      fireEvent.press(tabs[0]);
      expect(getByText('Pending Contributions')).toBeTruthy();
    });
  });

  it('allows approving a contribution', async () => {
    const { getAllByTestId } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const approveButtons = getAllByTestId('approve-button');
      fireEvent.press(approveButtons[0]);
      expect(MaterialsContributionService.verifyContribution).toHaveBeenCalledWith('contrib1', expect.any(String));
    });
  });

  it('shows rejection modal when reject button is pressed', async () => {
    const { getAllByTestId, getByTestId } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const rejectButtons = getAllByTestId('reject-button');
      fireEvent.press(rejectButtons[0]);
      expect(getByTestId('rejection-modal')).toBeTruthy();
    });
  });

  it('submits rejection with reason', async () => {
    const { getAllByTestId, getByTestId, getByPlaceholderText } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const rejectButtons = getAllByTestId('reject-button');
      fireEvent.press(rejectButtons[0]);
      
      const rejectionInput = getByPlaceholderText('Enter reason for rejection');
      fireEvent.changeText(rejectionInput, 'Test rejection reason');
      
      const submitButton = getByTestId('submit-rejection-button');
      fireEvent.press(submitButton);
      
      expect(MaterialsContributionService.rejectContribution).toHaveBeenCalledWith(
        'contrib1', 
        'Test rejection reason'
      );
    });
  });

  it('allows searching contributions', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const searchInput = getByPlaceholderText('Search contributions...');
      fireEvent.changeText(searchInput, 'Plastic');
      
      expect(getByText('Plastic Bottle')).toBeTruthy();
      expect(queryByText('Glass Jar')).toBeNull();
    });
  });

  it('filters by recyclability', async () => {
    const { getByTestId, getByText, queryByText } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      // Set recyclability filter to true
      const recyclableFilter = getByTestId('recyclable-filter');
      fireEvent.press(recyclableFilter);
      
      expect(getByText('Plastic Bottle')).toBeTruthy();
      expect(getByText('Glass Jar')).toBeTruthy();
      
      // Change filter to false (non-recyclable)
      fireEvent.press(recyclableFilter);
      
      expect(queryByText('Plastic Bottle')).toBeNull();
      expect(queryByText('Glass Jar')).toBeNull();
    });
  });

  it('handles errors during loading', async () => {
    (MaterialsContributionService.getPendingContributions as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { getByText } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      expect(getByText('Failed to load contributions.')).toBeTruthy();
    });
  });

  it('handles errors during approval', async () => {
    (MaterialsContributionService.verifyContribution as jest.Mock).mockRejectedValue(new Error('Approval failed'));
    
    const { getAllByTestId } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const approveButtons = getAllByTestId('approve-button');
      fireEvent.press(approveButtons[0]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to approve contribution: Approval failed',
        expect.anything()
      );
    });
  });

  it('handles errors during rejection', async () => {
    (MaterialsContributionService.rejectContribution as jest.Mock).mockRejectedValue(new Error('Rejection failed'));
    
    const { getAllByTestId, getByTestId, getByPlaceholderText } = render(<AdminMaterialsDatabaseScreen />);
    
    await waitFor(() => {
      const rejectButtons = getAllByTestId('reject-button');
      fireEvent.press(rejectButtons[0]);
      
      const rejectionInput = getByPlaceholderText('Enter reason for rejection');
      fireEvent.changeText(rejectionInput, 'Test rejection reason');
      
      const submitButton = getByTestId('submit-rejection-button');
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to reject contribution: Rejection failed',
        expect.anything()
      );
    });
  });
}); 