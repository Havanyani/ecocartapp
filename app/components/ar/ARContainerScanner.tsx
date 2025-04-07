import { useTheme } from '@/hooks/useTheme';
import { detectMaterial, MaterialDetectionResult } from '@/utils/material-detection';
import { calculateEnvironmentalImpact, estimateVolumeFromImage, VolumeEstimationResult } from '@/utils/volume-estimation';
import { Camera } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ARGuideOverlay } from './ARGuideOverlay';

interface ARContainerScannerProps {
  onContainerRecognized: (result: {
    material: MaterialDetectionResult;
    volume: VolumeEstimationResult;
    environmentalImpact: {
      carbonFootprintSaved: number;
      waterSaved: number;
      energySaved: number;
      landfillSpaceSaved: number;
    };
  }) => void;
  onClose: () => void;
}

export function ARContainerScanner({ onContainerRecognized, onClose }: ARContainerScannerProps) {
  const theme = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [containerDetected, setContainerDetected] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCameraReady = () => {
    console.log('Camera is ready');
  };

  const handleScan = async () => {
    if (!cameraRef.current) return;

    setIsScanning(true);
    setIsProcessing(true);

    try {
      // Take a photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });

      // Process the image
      const materialResult = await detectMaterial(photo.base64!);
      const volumeResult = await estimateVolumeFromImage(photo.base64!);

      // Calculate environmental impact
      const environmentalImpact = calculateEnvironmentalImpact(
        volumeResult.volume,
        volumeResult.unit,
        materialResult.material
      );

      // Set container as detected
      setContainerDetected(true);

      // Pass results to parent
      onContainerRecognized({
        material: materialResult,
        volume: volumeResult,
        environmentalImpact
      });

    } catch (error) {
      console.error('Error scanning container:', error);
      Alert.alert(
        'Scanning Error',
        'Failed to scan container. Please try again.'
      );
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          No access to camera
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={handleCameraReady}
      >
        <ARGuideOverlay
          isScanning={isScanning}
          containerDetected={containerDetected}
        />
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleScan}
            disabled={isScanning || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                {isScanning ? 'Scanning...' : 'Scan Container'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.error }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: theme.colors.background }]}>
              Cancel
            </Text>
          </TouchableOpacity>
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
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 