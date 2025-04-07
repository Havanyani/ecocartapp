import { useTheme } from '@/hooks/useTheme';
import { CommonMaterials, detectMaterial } from '@/utils/material-detection';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ARGuideOverlay from './ARGuideOverlay';
import { ContainerContributionForm } from './ContainerContributionForm';
import ContainerInfoCard from './ContainerInfoCard';

// Define container types
export interface RecognizedContainer {
  id: string;
  name: string;
  material: string;
  materialType?: CommonMaterials;
  isRecyclable: boolean;
  confidence: number; // 0 to 1
  instructions?: string;
  environmentalImpact?: {
    carbonFootprintSaved?: number;
    waterSaved?: number;
    energySaved?: number;
  };
  recycleCodes?: string[];
}

// Component props
interface ARContainerScannerProps {
  onContainerRecognized?: (container: RecognizedContainer) => void;
  onClose?: () => void;
  userId?: string; // User ID for contribution attribution
}

/**
 * Enhanced component for scanning and recognizing recycling containers using AR
 * with material detection capabilities
 */
export default function ARContainerScannerEnhanced({
  onContainerRecognized,
  onClose,
  userId = 'anonymous'
}: ARContainerScannerProps) {
  // Camera permissions state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  // Container detection state
  const [containerDetected, setContainerDetected] = useState(false);
  // Recognized container
  const [recognizedContainer, setRecognizedContainer] = useState<RecognizedContainer | null>(null);
  // Material detection state
  const [materialDetectionComplete, setMaterialDetectionComplete] = useState(false);
  // Show contribution form
  const [showContribution, setShowContribution] = useState(false);
  // Last captured image URI for contribution
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  
  // Get theme
  const { theme } = useTheme();
  
  // Request camera permissions in a real implementation
  useEffect(() => {
    // Simulate requesting permissions
    setTimeout(() => {
      setHasPermission(true);
    }, 500);
  }, []);
  
  // Simulate container recognition (in a real app, this would use ARKit/ARCore)
  const simulateContainerRecognition = async () => {
    setIsScanning(true);
    setMaterialDetectionComplete(false);
    
    // Simulate taking a picture
    setCapturedImageUri('https://example.com/mock-image.jpg');
    
    // Simulate processing time
    setTimeout(() => {
      setContainerDetected(true);
      
      // Simulate more processing time
      setTimeout(async () => {
        // Simulate recognition results
        const recognitionResult = await simulateRecognitionResult();
        
        if (recognitionResult.recognized) {
          // Show recognized container
          setRecognizedContainer(recognitionResult.container);
          
          // Perform material detection
          if (recognitionResult.container) {
            try {
              // In a real app, we'd pass the image data to the detection function
              const materialResult = await detectMaterial(
                { mockImageData: true }, 
                recognitionResult.container.id
              );
              
              // Update the container with material detection results
              const updatedContainer = {
                ...recognitionResult.container,
                materialType: materialResult.materialType as CommonMaterials,
                material: materialResult.materialType, // Override with detected material
                isRecyclable: materialResult.recyclingInfo.isRecyclable,
                instructions: materialResult.recyclingInfo.specialInstructions,
                recycleCodes: materialResult.recyclingInfo.recycleCodes
              };
              
              setRecognizedContainer(updatedContainer);
              setMaterialDetectionComplete(true);
              
              // Call callback if provided
              if (onContainerRecognized) {
                onContainerRecognized(updatedContainer);
              }
            } catch (error) {
              console.error('Error during material detection:', error);
              
              // Still show the original recognized container
              if (onContainerRecognized && recognitionResult.container) {
                onContainerRecognized(recognitionResult.container);
              }
            }
          } else {
            // Call callback if provided
            if (onContainerRecognized && recognitionResult.container) {
              onContainerRecognized(recognitionResult.container);
            }
          }
        } else {
          // Not recognized - prompt to contribute
          Alert.alert(
            'Container Not Recognized',
            'We couldn\'t identify this container. Would you like to contribute information about it to help improve our database?',
            [
              {
                text: 'No, Thanks',
                style: 'cancel',
                onPress: () => {
                  // Reset scanning state
                  setIsScanning(false);
                  setContainerDetected(false);
                }
              },
              {
                text: 'Contribute',
                onPress: () => {
                  // Show contribution form
                  setShowContribution(true);
                  // Reset scanning state
                  setIsScanning(false);
                  setContainerDetected(false);
                }
              }
            ]
          );
        }
      }, 1000);
    }, 2000);
  };
  
  // Simulate recognition result (80% chance of recognition in this demo)
  const simulateRecognitionResult = async () => {
    // For demo: 80% chance of recognition
    const recognized = Math.random() > 0.2;
    
    if (!recognized) {
      return { recognized: false, container: null };
    }
    
    // Randomly select a container type for the demo
    const containerTypes = [
      {
        id: '1',
        name: 'Plastic Bottle',
        material: 'PET',
        isRecyclable: true,
        confidence: 0.92,
        instructions: 'Rinse, remove cap, and place in recycling bin.',
        environmentalImpact: {
          carbonFootprintSaved: 0.0287, // kg CO2
          waterSaved: 1.26, // liters
          energySaved: 0.75 // kWh
        }
      },
      {
        id: '2',
        name: 'Aluminum Can',
        material: 'Aluminum',
        isRecyclable: true,
        confidence: 0.97,
        instructions: 'Rinse and crush if possible to save space.',
        environmentalImpact: {
          carbonFootprintSaved: 0.042, // kg CO2
          waterSaved: 1.05, // liters
          energySaved: 0.95 // kWh
        }
      },
      {
        id: '3',
        name: 'Glass Bottle',
        material: 'Glass',
        isRecyclable: true,
        confidence: 0.89,
        instructions: 'Rinse, remove caps, and recycle separately from other materials.',
        environmentalImpact: {
          carbonFootprintSaved: 0.255, // kg CO2
          waterSaved: 2.94, // liters
          energySaved: 0.3 // kWh
        }
      },
      {
        id: '4',
        name: 'Styrofoam Container',
        material: 'Polystyrene',
        isRecyclable: false,
        confidence: 0.91,
        instructions: 'Not recyclable in most areas. Check local facilities.',
        environmentalImpact: {
          carbonFootprintSaved: 0,
          waterSaved: 0,
          energySaved: 0
        }
      },
      {
        id: '5',
        name: 'Paper Coffee Cup',
        material: 'Mixed (Paper + Plastic Lining)',
        isRecyclable: false,
        confidence: 0.85,
        instructions: 'Not recyclable due to plastic lining. Consider reusable alternatives.',
        environmentalImpact: {
          carbonFootprintSaved: 0,
          waterSaved: 0,
          energySaved: 0
        }
      }
    ];
    
    // Randomly select a container type
    const randomIndex = Math.floor(Math.random() * containerTypes.length);
    const container = containerTypes[randomIndex];
    
    return { recognized: true, container };
  };
  
  // Handle add to collection
  const handleAddToCollection = () => {
    if (recognizedContainer) {
      Alert.alert(
        'Success',
        `Added ${recognizedContainer.name} to your collection!`,
        [{ text: 'OK', onPress: () => setRecognizedContainer(null) }]
      );
    }
  };
  
  // Handle contribution success
  const handleContributionSuccess = () => {
    Alert.alert(
      'Thank You!',
      'Your contribution will help improve recycling for everyone. It will be reviewed by our team and added to the database.',
      [{ text: 'OK' }]
    );
    
    setShowContribution(false);
    setCapturedImageUri(null);
  };
  
  // Handle contribution cancel
  const handleContributionCancel = () => {
    setShowContribution(false);
    setCapturedImageUri(null);
  };
  
  // Render different content based on permission status
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Camera access is required to use the AR scanner.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Simulated Camera View */}
      <View style={styles.camera}>
        {/* AR Guide Overlay */}
        <ARGuideOverlay 
          isScanning={isScanning} 
          containerDetected={containerDetected} 
        />
        
        {/* Scan button */}
        {!isScanning && !recognizedContainer && !showContribution && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
              onPress={simulateContainerRecognition}
              disabled={isScanning}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Scanning...' : 'Scan Container'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Close button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {/* Scanning indicator */}
        {isScanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.scanningText}>
              {containerDetected ? 'Analyzing container...' : 'Scanning...'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Results modal */}
      <Modal
        visible={recognizedContainer !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {recognizedContainer && (
              <ContainerInfoCard
                container={recognizedContainer}
                onAddToCollection={handleAddToCollection}
                onViewDetails={() => {
                  setRecognizedContainer(null);
                  // In a real app, navigate to details screen
                }}
              />
            )}
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.colors.secondary }]}
              onPress={() => setRecognizedContainer(null)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
                Scan Another
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Contribution Modal */}
      <Modal
        visible={showContribution}
        animationType="slide"
        onRequestClose={handleContributionCancel}
      >
        <View style={[styles.contributionContainer, { backgroundColor: theme.colors.background }]}>
          {capturedImageUri ? (
            <ContainerContributionForm
              userId={userId}
              onSuccess={handleContributionSuccess}
              onCancel={handleContributionCancel}
            />
          ) : (
            <View style={styles.contributionErrorContainer}>
              <Text style={[styles.contributionErrorText, { color: theme.colors.text }]}>
                Failed to capture image. Please try scanning again.
              </Text>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowContribution(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000', // Mock camera background
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  scanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningIndicator: {
    position: 'absolute',
    top: height / 2 - 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  contributionContainer: {
    flex: 1,
  },
  contributionErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contributionErrorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
}); 