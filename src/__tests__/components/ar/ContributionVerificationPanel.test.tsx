import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import ContributionVerificationPanel from '../../../components/ar/ContributionVerificationPanel';
import * as MaterialsContributionService from '../../../services/MaterialsContributionService';

// Mock the MaterialsContributionService
jest.mock('../../../services/MaterialsContributionService', () => ({
  getPendingContributions: jest.fn(),
  verifyContribution: jest.fn()
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

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
    verificationCount: 0,
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
    verificationCount: 1,
    environmentalImpact: {
      co2Savings: 0.3,
      waterSavings: 50,
      energyConservation: 2.7
    }
  }
];

describe('ContributionVerificationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (MaterialsContributionService.getPendingContributions as jest.Mock).mockResolvedValue(mockPendingContributions);
    (MaterialsContributionService.verifyContribution as jest.Mock).mockResolvedValue({ 
      success: true, 
      contribution: { ...mockPendingContributions[0], verificationCount: 1 } 
    });
  });

  it('renders loading state initially', async () => {
    const { getByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders contributions after loading', async () => {
    const { getByText, queryByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Plastic Bottle')).toBeTruthy();
      expect(getByText('Glass Jar')).toBeTruthy();
    });
  });

  it('displays correct contribution details', async () => {
    const { getByText } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      expect(getByText('Plastic Bottle')).toBeTruthy();
      expect(getByText('Material: plastic')).toBeTruthy();
      expect(getByText('Recyclable: Yes')).toBeTruthy();
    });
  });

  it('calls verifyContribution when verify button is pressed', async () => {
    const { getAllByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      const verifyButtons = getAllByTestId('verify-button');
      fireEvent.press(verifyButtons[0]);
      expect(MaterialsContributionService.verifyContribution).toHaveBeenCalledWith('contrib1', 'user123');
    });
  });

  it('shows success alert after verification', async () => {
    const { getAllByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      const verifyButtons = getAllByTestId('verify-button');
      fireEvent.press(verifyButtons[0]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verification Successful',
        'Thank you for verifying this container contribution!',
        expect.anything()
      );
    });
  });

  it('handles empty contributions list', async () => {
    (MaterialsContributionService.getPendingContributions as jest.Mock).mockResolvedValue([]);
    
    const { getByText, queryByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('No contributions to verify at this time.')).toBeTruthy();
    });
  });

  it('handles errors during loading', async () => {
    (MaterialsContributionService.getPendingContributions as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { getByText } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      expect(getByText('Failed to load contributions.')).toBeTruthy();
    });
  });

  it('handles errors during verification', async () => {
    (MaterialsContributionService.verifyContribution as jest.Mock).mockRejectedValue(new Error('Verification failed'));
    
    const { getAllByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      const verifyButtons = getAllByTestId('verify-button');
      fireEvent.press(verifyButtons[0]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verification Failed',
        'There was an error verifying this contribution. Please try again.',
        expect.anything()
      );
    });
  });

  it('calls the onClose function when close button is pressed', async () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <ContributionVerificationPanel userId="user123" onClose={onCloseMock} />
    );
    
    await waitFor(() => {
      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('refreshes the data with pull-to-refresh', async () => {
    const { getByTestId } = render(<ContributionVerificationPanel userId="user123" />);
    
    await waitFor(() => {
      const refreshControl = getByTestId('refresh-control');
      fireEvent(refreshControl, 'refresh');
      expect(MaterialsContributionService.getPendingContributions).toHaveBeenCalledTimes(2);
    });
  });
}); 