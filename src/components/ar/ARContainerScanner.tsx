import { useIsFocused } from '@react-navigation/native';
import * as tf from '@tensorflow/tfjs';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ARContainerRecognitionService } from '@/services/ARContainerRecognitionService';
import { ARContainerScannerProps, ARViewState, DetectionResult, RecognizedContainer } from '@/types/ar';
import ContainerInfoOverlay from './ContainerInfoOverlay';
import ScanGuide from './ScanGuide';

const TensorCamera = cameraWithTensors(Camera);

// Camera preview size - match this to the input size expected by the model
const TENSOR_WIDTH = 300;
const TENSOR_HEIGHT = 300;

export default function ARContainerScanner({
  onContainerDetected,
  onError,
  style,
  showGuide = true,
  saveDetectedImages = false,
  detectionInterval = 700, // ms between detections
}: ARContainerScannerProps) {
  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null);
  const recognitionService = useRef<ARContainerRecognitionService>(
    ARContainerRecognitionService.getInstance()
  );

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);

  const [viewState, setViewState] = useState<ARViewState>({
    isInitialized: false,
    isModelLoading: true,
    isDetecting: false,
    isCameraReady: false,
    detectedContainers: [],
    error: null,
  });

  // Ask for camera and media library permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      let mediaLibraryStatus = { status: 'granted' };
      
      if (saveDetectedImages) {
        mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      }
      
      setHasPermission(
        cameraStatus === 'granted' && 
        mediaLibraryStatus.status === 'granted'
      );
    })();
  }, [saveDetectedImages]);

  // Initialize TensorFlow.js
  useEffect(() => {
    if (!isFocused) return;

    const setupTf = async () => {
      try {
        setViewState(prev => ({ ...prev, isInitialized: false, isModelLoading: true }));

        // Wait for the recognition service to be ready
        const isServiceReady = recognitionService.current.isReady();
        if (!isServiceReady) {
          // We're waiting for the service to initialize in its constructor
          // This is a simplification - in a production app, we would handle this more robustly
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setViewState(prev => ({ 
          ...prev, 
          isInitialized: true, 
          isModelLoading: false 
        }));
      } catch (error) {
        console.error('Failed to set up TensorFlow:', error);
        setViewState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize AR scanner. Please try again.' 
        }));
        onError?.('Failed to initialize AR scanner');
      }
    };

    setupTf();

    return () => {
      // Clean up when component unmounts
      setViewState(prev => ({ ...prev, isInitialized: false }));
    };
  }, [isFocused, onError]);

  // Camera ready handler
  const handleCameraReady = useCallback(() => {
    setViewState(prev => ({ ...prev, isCameraReady: true }));
  }, []);

  // Handle tensor camera stream
  const handleCameraStream = useCallback(
    (images: IterableIterator<tf.Tensor3D>) => {
      const detectObjects = async () => {
        if (!viewState.isInitialized || viewState.isDetecting || !isFocused) {
          return;
        }

        // Throttle detection frequency
        const now = Date.now();
        if (now - lastAnalysisTime < detectionInterval) {
          return;
        }

        try {
          setViewState(prev => ({ ...prev, isDetecting: true }));
          setLastAnalysisTime(now);

          // Get the next tensor
          const nextImageTensor = images.next().value;

          if (nextImageTensor) {
            // Detect objects in the image
            const detectionResults: DetectionResult[] = 
              await recognitionService.current.detectObjects(nextImageTensor);

            // Process the detection results to identify containers
            const containers: RecognizedContainer[] = 
              recognitionService.current.recognizeContainers(detectionResults);

            if (containers.length > 0) {
              // Take a photo if we should save detected images
              if (saveDetectedImages && cameraRef.current) {
                try {
                  const photo = await cameraRef.current.takePictureAsync();
                  await MediaLibrary.saveToLibraryAsync(photo.uri);
                  
                  // Add image URI to the container
                  containers[0].imageUri = photo.uri;
                } catch (photoError) {
                  console.error('Failed to save photo:', photoError);
                }
              }

              // Update state with detected containers
              setViewState(prev => ({
                ...prev,
                detectedContainers: containers,
              }));

              // Notify parent component about detected containers
              containers.forEach(container => {
                onContainerDetected?.(container);
              });
            }

            // Dispose of the tensor to free memory
            tf.dispose(nextImageTensor);
          }
        } catch (error) {
          console.error('Error during object detection:', error);
          setViewState(prev => ({ 
            ...prev, 
            error: 'Error during container detection' 
          }));
          onError?.('Error during container detection');
        } finally {
          setViewState(prev => ({ ...prev, isDetecting: false }));
        }
      };

      // Start detection loop
      const intervalId = setInterval(detectObjects, 100);
      return () => clearInterval(intervalId);
    },
    [
      viewState.isInitialized, 
      viewState.isDetecting, 
      lastAnalysisTime, 
      isFocused, 
      detectionInterval, 
      saveDetectedImages, 
      onContainerDetected, 
      onError
    ]
  );

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>
          Camera and media library permissions are required to use this feature.
        </Text>
      </View>
    );
  }

  // Loading state
  if (hasPermission === null || viewState.isModelLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Initializing AR scanner...</Text>
      </View>
    );
  }

  // Error state
  if (viewState.error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{viewState.error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {viewState.isInitialized && (
        <TensorCamera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onCameraReady={handleCameraReady}
          cameraTextureWidth={TENSOR_WIDTH}
          cameraTextureHeight={TENSOR_HEIGHT}
          resizeWidth={TENSOR_WIDTH}
          resizeHeight={TENSOR_HEIGHT}
          resizeDepth={3}
          autorender={true}
          useCustomShadersToResize={false}
          onReady={handleCameraStream}
        />
      )}

      {/* Scanning guide overlay */}
      {showGuide && <ScanGuide isActive={!viewState.isDetecting} />}

      {/* Container information overlay */}
      {viewState.detectedContainers.length > 0 && (
        <ContainerInfoOverlay 
          container={viewState.detectedContainers[0]} 
          onClose={() => setViewState(prev => ({ ...prev, detectedContainers: [] }))}
        />
      )}

      {/* Processing indicator */}
      {viewState.isDetecting && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    margin: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
}); 