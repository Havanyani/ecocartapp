import { useTheme } from '@/hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ARGuideOverlay from './ARGuideOverlay';

// Interface for component props
export interface ARContainerScannerProps {
  navigation: any;
  failRecognition?: boolean; // For testing
}

/**
 * AR Container Scanner component for scanning and recognizing recycling containers
 */
export default function ARContainerScanner({ navigation, failRecognition = false }: ARContainerScannerProps) {
  const { theme } = useTheme();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [containerDetected, setContainerDetected] = useState(false);
  const [detectedContainer, setDetectedContainer] = useState<{
    type: string;
    material: string;
    confidence: number;
    imageData: string;
  } | null>(null);
  
  const cameraRef = useRef<Camera>(null);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
    })();
  }, [cameraPermission, requestCameraPermission]);
  
  // Handle camera ready state
  const handleCameraReady = () => {
    setCameraReady(true);
  };
  
  // Scan for container
  const scanForContainer = async () => {
    if (!cameraReady || isScanning) return;
    
    setIsScanning(true);
    setContainerDetected(false);
    setDetectedContainer(null);
    
    try {
      // Take a picture
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        // In a real app, we would send this to our ML model
        // Here we simulate the recognition process
        simulateContainerRecognition(photo.base64 || '');
      }
    } catch (error) {
      console.error('Error scanning for container:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      setIsScanning(false);
    }
  };
  
  // Simulate container recognition (would be an API call in a real app)
  const simulateContainerRecognition = (imageData: string) => {
    // Simulate processing delay
    setTimeout(() => {
      if (failRecognition) {
        setIsScanning(false);
        Alert.alert(
          'Recognition Failed', 
          'Couldn\'t recognize the container. Please try again with better lighting or positioning.'
        );
        return;
      }
      
      // Simulate successful detection
      setContainerDetected(true);
      setDetectedContainer({
        type: 'Bottle',
        material: 'Plastic (PET)',
        confidence: 0.92,
        imageData: imageData,
      });
      
      setIsScanning(false);
    }, 2000);
  };
  
  // Open image gallery
  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library to use this feature.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        // In a real app, we would send this to our ML model
        setIsScanning(true);
        simulateContainerRecognition(result.assets[0].base64 || '');
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };
  
  // Navigate to contribution form
  const handleContribute = () => {
    if (detectedContainer) {
      navigation.navigate('ContainerContributionForm', {
        imageData: detectedContainer.imageData,
        containerType: detectedContainer.type,
        materialType: detectedContainer.material,
      });
    }
  };
  
  // Handle retrying scan
  const handleRetry = () => {
    setContainerDetected(false);
    setDetectedContainer(null);
  };
  
  // Show loading while requesting permissions
  if (!cameraPermission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="loading-container">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.text }]}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  // Show message if permission denied
  if (!cameraPermission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="camera-off" size={64} color={theme.colors.error} />
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Camera permission is required to use this feature.
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={handleCameraReady}
        testID="camera-view"
      >
        {/* Guide Overlay */}
        <ARGuideOverlay
          isScanning={isScanning}
          containerDetected={containerDetected}
          testID="guide-overlay"
        />
        
        {/* UI Controls */}
        <View style={styles.controlsContainer}>
          {/* Scanning UI */}
          {!containerDetected && (
            <>
              <View style={styles.messageContainer}>
                {isScanning && (
                  <Text style={styles.scanningText}>Analyzing image...</Text>
                )}
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
                  onPress={openGallery}
                  disabled={isScanning}
                  testID="gallery-button"
                >
                  <MaterialCommunityIcons 
                    name="image" 
                    size={28} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    { 
                      backgroundColor: isScanning 
                        ? theme.colors.disabled 
                        : theme.colors.primary 
                    }
                  ]}
                  onPress={scanForContainer}
                  disabled={isScanning || !cameraReady}
                  testID="scan-button"
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan Container'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          {/* Container Detected UI */}
          {containerDetected && detectedContainer && (
            <View style={styles.detectedContainer} testID="container-detected">
              <Text style={styles.detectedTitle}>Container Detected!</Text>
              <Text style={styles.detectedInfo}>
                Type: {detectedContainer.type}
              </Text>
              <Text style={styles.detectedInfo}>
                Material: {detectedContainer.material}
              </Text>
              <Text style={styles.detectedInfo}>
                Confidence: {Math.round(detectedContainer.confidence * 100)}%
              </Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.notification }]}
                  onPress={handleRetry}
                >
                  <Text style={styles.actionButtonText}>Retry</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleContribute}
                  testID="contribute-button"
                >
                  <Text style={styles.actionButtonText}>Contribute</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scanButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  detectedContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    alignItems: 'center',
  },
  detectedTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detectedInfo: {
    color: 'white',
    fontSize: 16,
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 