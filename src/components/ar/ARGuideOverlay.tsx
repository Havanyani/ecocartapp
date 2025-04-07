import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface ARGuideOverlayProps {
  isScanning: boolean;
  containerDetected: boolean;
}

/**
 * Provides visual guidance for positioning the camera during AR scanning
 */
export default function ARGuideOverlay({ isScanning, containerDetected }: ARGuideOverlayProps) {
  const { theme } = useTheme();
  const primaryColor = theme.colors.primary || '#4CAF50';
  const successColor = theme.colors.success || '#00C853';
  
  // Determine frame color based on scanning state
  const frameColor = containerDetected 
    ? successColor 
    : isScanning 
      ? primaryColor 
      : 'rgba(255, 255, 255, 0.5)';
  
  // Guide message based on state
  const guideMessage = containerDetected
    ? 'Container detected! Hold steady...'
    : isScanning
      ? 'Center the container in the frame'
      : 'Position a recycling container in the frame';

  return (
    <View style={styles.overlay}>
      {/* Scanner frame */}
      <View 
        style={[
          styles.scanFrame, 
          { borderColor: frameColor }
        ]}
      >
        {/* Corner markers */}
        <View style={[styles.cornerMarker, styles.topLeft, { borderColor: frameColor }]} />
        <View style={[styles.cornerMarker, styles.topRight, { borderColor: frameColor }]} />
        <View style={[styles.cornerMarker, styles.bottomLeft, { borderColor: frameColor }]} />
        <View style={[styles.cornerMarker, styles.bottomRight, { borderColor: frameColor }]} />
      </View>
      
      {/* Guide text */}
      <View style={styles.guideTextContainer}>
        <Text style={[styles.guideText, { color: theme.colors.text }]}>
          {guideMessage}
        </Text>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const frameWidth = width * 0.7;
const frameHeight = height * 0.4;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanFrame: {
    width: frameWidth,
    height: frameHeight,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  guideTextContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  guideText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 