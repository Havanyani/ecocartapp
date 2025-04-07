import ARContainerScannerV2, { RecognizedContainer } from '@/components/ar/ARContainerScannerV2';
import { detectMaterial } from '@/utils/material-detection';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text as RNText, TouchableOpacity as RNTouchableOpacity, View as RNView } from 'react-native';

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

jest.mock('@/utils/material-detection', () => {
  const originalModule = jest.requireActual('@/utils/material-detection');
  
  return {
    ...originalModule,
    detectMaterial: jest.fn().mockImplementation((imageData, containerType) => {
      // Simulate different material detection results based on container type
      let materialType, confidence, isRecyclable;
      
      switch(containerType) {
        case '1': // Plastic Bottle
          materialType = 'PET';
          confidence = 0.92;
          isRecyclable = true;
          break;
        case '2': // Aluminum Can
          materialType = 'ALUMINUM';
          confidence = 0.95;
          isRecyclable = true;
          break;
        case '3': // Glass Bottle
          materialType = 'GLASS';
          confidence = 0.88;
          isRecyclable = true;
          break;
        case '4': // Styrofoam Container
          materialType = 'PS';
          confidence = 0.90;
          isRecyclable = false;
          break;
        default:
          materialType = 'UNKNOWN';
          confidence = 0.60;
          isRecyclable = false;
      }
      
      return Promise.resolve({
        materialType,
        confidence,
        recyclingInfo: {
          isRecyclable,
          recycleCodes: isRecyclable ? ['1'] : [],
          specialInstructions: isRecyclable ? 'Rinse thoroughly' : 'Not recyclable in most areas'
        },
        properties: {
          shininess: 0.7,
          transparency: 0.8,
          texture: 'smooth',
          color: 'clear',
          reflectivity: 0.6
        }
      });
    })
  };
});

// Define interface for container info card props
interface ContainerInfoCardProps {
  container: RecognizedContainer;
  onAddToCollection?: () => void;
  onViewDetails?: () => void;
}

// Mock child components
jest.mock('@/components/ar/ARGuideOverlay', () => 'ARGuideOverlay');
jest.mock('@/components/ar/ContainerInfoCard', () => {
  return function MockContainerInfoCard(props: ContainerInfoCardProps) {
    return (
      <RNView testID="container-info-card">
        <RNText testID="container-name">{props.container.name}</RNText>
        <RNText testID="container-material">{props.container.material}</RNText>
        <RNText testID="container-recyclable">
          {props.container.isRecyclable ? 'Recyclable' : 'Not Recyclable'}
        </RNText>
        {props.container.environmentalImpact && (
          <RNView testID="container-impact">
            <RNText testID="carbon-saved">
              {props.container.environmentalImpact.carbonFootprintSaved}
            </RNText>
            <RNText testID="landfill-saved">
              {props.container.environmentalImpact.landfillSpaceSaved}
            </RNText>
          </RNView>
        )}
        <RNTouchableOpacity 
          testID="add-to-collection-btn" 
          onPress={props.onAddToCollection}
        >
          <RNText>Add to Collection</RNText>
        </RNTouchableOpacity>
      </RNView>
    );
  };
});

jest.mock('@/components/ar/ContainerContributionForm', () => ({
  ContainerContributionForm: 'ContainerContributionForm'
}));

// Mock timers
jest.useFakeTimers();

// Force a consistent random number to ensure we get a known container type
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.1; // Will get first container (Plastic Bottle)
global.Math = mockMath;

describe('Material Detection Workflow Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('completes the full material detection workflow from scanning to displaying results', async () => {
    // Mock container recognition callback
    const mockOnContainerRecognized = jest.fn();
    
    const { getByText, getByTestId } = render(
      <ARContainerScannerV2 
        onContainerRecognized={mockOnContainerRecognized} 
        testMode={true}
        userId="test-user-123" 
      />
    );
    
    // 1. Wait for camera permissions
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // 2. Press scan button
    fireEvent.press(getByText('Scan Container'));
    
    // 3. Verify scanning starts
    expect(getByText('Scanning...')).toBeTruthy();
    
    // 4. Wait for container detection
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // 5. Verify material analysis starts
    expect(getByText('Analyzing material...')).toBeTruthy();
    
    // 6. Wait for material detection to complete
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    
    // 7. Verify results are displayed
    await waitFor(() => {
      // Check that container info is displayed
      expect(getByTestId('container-info-card')).toBeTruthy();
      expect(getByTestId('container-name')).toBeTruthy();
      expect(getByTestId('container-material')).toBeTruthy();
      expect(getByTestId('container-recyclable')).toBeTruthy();
      expect(getByTestId('container-impact')).toBeTruthy();
    });
    
    // 8. Verify that the material detection method was called with correct parameters
    expect(detectMaterial).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String)
    );
    
    // 9. Verify callback was called with enhanced container data
    expect(mockOnContainerRecognized).toHaveBeenCalledWith(
      expect.objectContaining({
        materialType: expect.any(String),
        isRecyclable: expect.any(Boolean),
        environmentalImpact: expect.objectContaining({
          carbonFootprintSaved: expect.any(Number),
          landfillSpaceSaved: expect.any(Number)
        })
      })
    );
    
    // 10. Test adding to collection
    fireEvent.press(getByTestId('add-to-collection-btn'));
    
    // Should close the modal after adding
    await waitFor(() => {
      expect(getByText('Scan Container')).toBeTruthy();
    });
  });
  
  it('provides accurate material detection results for different container types', async () => {
    // Test with multiple containers to verify different material types
    
    // Mock different container types by manipulating the recognition result
    const originalImplementation = Math.random;
    
    // Test with Plastic Bottle (PET)
    Math.random = () => 0.1; // First container
    
    const { getByText, unmount } = render(
      <ARContainerScannerV2 testMode={true} />
    );
    
    // Scan workflow
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    fireEvent.press(getByText('Scan Container'));
    
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Verify PET detection
    expect(detectMaterial).toHaveBeenCalled();
    expect(detectMaterial).toHaveBeenLastCalledWith(
      expect.anything(),
      '1' // Plastic bottle ID
    );
    
    // Cleanup
    unmount();
    
    // Reset for next test
    jest.clearAllMocks();
    
    // Test with Aluminum Can
    Math.random = () => 0.3; // Second container
    
    const { getByText: getByText2 } = render(
      <ARContainerScannerV2 testMode={true} />
    );
    
    // Scan workflow
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    fireEvent.press(getByText2('Scan Container'));
    
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    
    // Verify Aluminum detection
    expect(detectMaterial).toHaveBeenCalled();
    expect(detectMaterial).toHaveBeenLastCalledWith(
      expect.anything(),
      '2' // Aluminum can ID
    );
    
    // Restore original implementation
    Math.random = originalImplementation;
  });
}); 