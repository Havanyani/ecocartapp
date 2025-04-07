import ARContainerScannerV2 from '@/components/ar/ARContainerScannerV2';
import { CommonMaterials } from '@/utils/material-detection';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
        background: '#FFFFFF',
        text: '#212121',
        textSecondary: '#757575',
        textInverse: '#FFFFFF',
        success: '#00C853',
        error: '#D32F2F',
      }
    }
  })
}));

jest.mock('@/utils/material-detection', () => ({
  CommonMaterials: {
    PET: 'PET',
    HDPE: 'HDPE',
    ALUMINUM: 'ALUMINUM',
    GLASS: 'GLASS',
    PAPER: 'PAPER',
    CARDBOARD: 'CARDBOARD',
    UNKNOWN: 'UNKNOWN'
  },
  detectMaterial: jest.fn().mockImplementation(() => 
    Promise.resolve({
      materialType: 'PET',
      confidence: 0.92,
      recyclingInfo: {
        isRecyclable: true,
        recycleCodes: ['1'],
        specialInstructions: 'Rinse and remove cap'
      },
      properties: {
        shininess: 0.7,
        transparency: 0.8,
        texture: 'smooth',
        color: 'clear',
        reflectivity: 0.6
      }
    })
  )
}));

jest.mock('@/components/ar/ARGuideOverlay', () => 'ARGuideOverlay');
jest.mock('@/components/ar/ContainerInfoCard', () => 'ContainerInfoCard');
jest.mock('@/components/ar/ContainerContributionForm', () => ({
  ContainerContributionForm: 'ContainerContributionForm'
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Simulate pressing the first button if available
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    buttons[0].onPress();
  }
  return null;
});

// Mock timers
jest.useFakeTimers();

describe('ARContainerScannerV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in initial state', () => {
    const { getByText } = render(
      <ARContainerScannerV2 onClose={() => {}} testMode={true} />
    );
    
    // Initially shows loading
    expect(getByText('Requesting camera permission...')).toBeTruthy();
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should show scan button after permissions
    expect(getByText('Scan Container')).toBeTruthy();
  });

  it('initiates scanning process when scan button is pressed', async () => {
    const { getByText, queryByText } = render(
      <ARContainerScannerV2 onClose={() => {}} testMode={true} />
    );
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Press scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Should show scanning indicator
    expect(getByText('Scanning...')).toBeTruthy();
    
    // Advance timer to container detection
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(getByText('Analyzing material...')).toBeTruthy();
    
    // Advance timer to complete recognition
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    // Should show container info in modal (via mock)
    await waitFor(() => {
      expect(queryByText('Scan Another')).toBeTruthy();
    });
  });

  it('calls onContainerRecognized callback when container is recognized', async () => {
    const mockOnContainerRecognized = jest.fn();
    
    const { getByText } = render(
      <ARContainerScannerV2 
        onContainerRecognized={mockOnContainerRecognized} 
        testMode={true} 
      />
    );
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Press scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Advance timer to complete recognition (3000ms + 1000ms)
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockOnContainerRecognized).toHaveBeenCalled();
      
      // Check that the callback received a container with material info
      const container = mockOnContainerRecognized.mock.calls[0][0];
      expect(container.materialType).toBe(CommonMaterials.PET);
      expect(container.isRecyclable).toBe(true);
      expect(container.environmentalImpact).toBeDefined();
    });
  });

  it('shows contribution form when container is not recognized', async () => {
    // Mock Math.random to force "not recognized" condition (value > 0.8)
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.9);
    
    // Mock Alert to choose "Contribute" option
    Alert.alert.mockImplementation((title, message, buttons) => {
      // Simulate pressing the "Contribute" button (index 1)
      if (buttons && buttons.length > 1 && buttons[1].onPress) {
        buttons[1].onPress();
      }
      return null;
    });
    
    const { getByText } = render(
      <ARContainerScannerV2 onClose={() => {}} testMode={true} />
    );
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Press scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Advance timer to complete recognition process
    act(() => {
      jest.advanceTimersByTime(3500);
    });
    
    // Should render the ContainerContributionForm (mocked component)
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Container Not Recognized',
        expect.any(String),
        expect.any(Array)
      );
    });
    
    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('handles closing the scanner', () => {
    const mockOnClose = jest.fn();
    
    const { getByText } = render(
      <ARContainerScannerV2 onClose={mockOnClose} testMode={true} />
    );
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Find close button (it has an "✕" text)
    const closeButton = getByText('✕');
    fireEvent.press(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calculates landfill space saved correctly', async () => {
    const mockOnContainerRecognized = jest.fn();
    
    const { getByText } = render(
      <ARContainerScannerV2 
        onContainerRecognized={mockOnContainerRecognized} 
        testMode={true} 
      />
    );
    
    // Advance timers to get past permission request
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Press scan button
    fireEvent.press(getByText('Scan Container'));
    
    // Advance timer to complete recognition
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Check that the environmental impact includes landfill space saved
    await waitFor(() => {
      const container = mockOnContainerRecognized.mock.calls[0][0];
      expect(container.environmentalImpact.landfillSpaceSaved).toBe(450); // PET value
    });
  });
}); 