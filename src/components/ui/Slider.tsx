import { Slider as RNSlider } from '@react-native-community/slider';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

export interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  onValueChange: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function Slider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  minimumTrackTintColor = '#3498db',
  maximumTrackTintColor = '#d3d3d3',
  thumbTintColor = '#3498db',
  onValueChange,
  style,
}: SliderProps) {
  return (
    <RNSlider
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      onValueChange={onValueChange}
      style={[styles.slider, style]}
    />
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
}); 