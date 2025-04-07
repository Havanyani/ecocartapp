import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // A value between 0 and 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#E0E0E0',
  progressColor = '#34C759',
  style,
}: ProgressBarProps) {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.min(1, Math.max(0, progress));
  
  return (
    <View 
      style={[
        styles.container,
        { height, backgroundColor },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          { 
            backgroundColor: progressColor,
            width: `${clampedProgress * 100}%` 
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
}); 