import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ThemedView } from './ThemedView';

interface WeightInputProps extends TextInputProps {
  onSubmit?: () => void;
  testID?: string;
}

export function WeightInput({ testID, onSubmit, ...props }: WeightInputProps): JSX.Element {
  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter weight in kg"
        placeholderTextColor="#999"
        onSubmitEditing={onSubmit}
        testID={testID}
        {...props}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
}); 