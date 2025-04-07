import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ARGuideOverlayProps {
  isScanning: boolean;
  containerDetected: boolean;
}

export default function ARGuideOverlay({ isScanning, containerDetected }: ARGuideOverlayProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Scanning frame */}
      <View style={styles.frame}>
        {/* Corner markers */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        
        {/* Scanning animation */}
        {isScanning && (
          <View style={[styles.scanLine, { backgroundColor: theme.colors.primary }]} />
        )}
        
        {/* Detection indicator */}
        {containerDetected && (
          <View style={[styles.detectionIndicator, { backgroundColor: theme.colors.success }]} />
        )}
      </View>
      
      {/* Guide text */}
      <View style={styles.guideTextContainer}>
        <View style={[styles.guideText, { backgroundColor: theme.colors.cardBackground }]}>
          {isScanning ? (
            <View style={styles.scanningText}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            </View>
          ) : (
            <View style={styles.initialText}>
              <View style={[styles.line, { backgroundColor: theme.colors.text }]} />
              <View style={[styles.line, { backgroundColor: theme.colors.text }]} />
              <View style={[styles.line, { backgroundColor: theme.colors.text }]} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 2,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
  detectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  guideTextContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guideText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanningText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  line: {
    width: 20,
    height: 2,
    marginHorizontal: 2,
  },
}); 