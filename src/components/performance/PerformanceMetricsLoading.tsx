import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';

interface Props {
  message?: string;
}

export function PerformanceMetricsLoading({ 
  message = 'Loading metrics...' 
}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2e7d32" />
      <ThemedText style={styles.message}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 200,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 