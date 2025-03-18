import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface ManualWeightInputProps {
  onWeightSubmit: (weight: number) => void;
  onCancel: () => void;
}

export function ManualWeightInput({
  onWeightSubmit,
  onCancel,
}: ManualWeightInputProps) {
  const { colors } = useTheme();
  const [weight, setWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (weightValue <= 0) {
      setError('Weight must be greater than 0');
      return;
    }

    if (weightValue > 1000) {
      setError('Weight must be less than 1000 kg');
      return;
    }

    setError(null);
    onWeightSubmit(weightValue);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="scale" size={24} color={colors.primary} />
        <ThemedText style={styles.title}>Manual Weight Input</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text.primary },
              error && { borderColor: colors.error },
            ]}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              setError(null);
            }}
            placeholder="Enter weight in kg"
            placeholderTextColor={colors.text.secondary}
            keyboardType="decimal-pad"
            autoFocus
          />
          <ThemedText style={styles.unit}>kg</ThemedText>
        </ThemedView>

        {error && (
          <ThemedText style={[styles.errorText, { color: colors.error }]}>
            {error}
          </ThemedText>
        )}

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={!weight.trim()}
          >
            <ThemedText style={styles.buttonText}>Submit</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
  },
  unit: {
    fontSize: 24,
    marginLeft: 8,
    opacity: 0.8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 