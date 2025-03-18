import { ThemedText } from '@/components/ui/ThemedText';
import React from 'react';
import { StyleSheet } from 'react-native';

export function HelloWave() {
  return <ThemedText style={styles.wave}>👋</ThemedText>;
}

const styles = StyleSheet.create({
  wave: {
    fontSize: 24,
  },
}); 