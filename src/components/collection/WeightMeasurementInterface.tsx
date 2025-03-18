import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { MaterialCategory } from '@/types/Material';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useCreditCalculation } from '@/hooks/useCreditCalculation';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { ManualWeightInput } from './ManualWeightInput';
import { WeightDisplay } from './WeightDisplay';

interface WeightMeasurementInterfaceProps {
  materialType: MaterialCategory;
  onWeightSubmit: (weight: number, credit: number) => void;
  onCancel: () => void;
}

export function WeightMeasurementInterface({
  materialType,
  onWeightSubmit,
  onCancel,
}: WeightMeasurementInterfaceProps) {
  const { colors } = useTheme();
  const [showManualInput, setShowManualInput] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isStable, setIsStable] = useState(true);

  const { calculateCredit } = useCreditCalculation();
  const {
    isConnected,
    isMeasuring,
    error: measurementError,
    connect,
    disconnect,
    startMeasuring,
    stopMeasuring,
  } = useWeightMeasurement();

  const handleWeightUpdate = (weight: number) => {
    setCurrentWeight(weight);
    setIsStable(true);
  };

  const handleManualSubmit = (weight: number) => {
    const credit = calculateCredit(materialType, weight);
    onWeightSubmit(weight, credit);
  };

  const handleDigitalSubmit = () => {
    const credit = calculateCredit(materialType, currentWeight);
    onWeightSubmit(currentWeight, credit);
  };

  const credit = calculateCredit(materialType, currentWeight);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="scale" size={24} color={colors.primary} />
        <ThemedText style={styles.title}>Weight Measurement</ThemedText>
      </ThemedView>

      {showManualInput ? (
        <ManualWeightInput
          onWeightSubmit={handleManualSubmit}
          onCancel={() => setShowManualInput(false)}
        />
      ) : (
        <ThemedView style={styles.content}>
          <WeightDisplay
            weight={currentWeight}
            credit={credit}
            materialType={materialType}
            isStable={isStable}
          />

          {measurementError && (
            <ThemedText style={[styles.errorText, { color: colors.error }]}>
              {measurementError}
            </ThemedText>
          )}

          <ThemedView style={styles.actions}>
            {!isConnected ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={connect}
              >
                <ThemedText style={styles.buttonText}>Connect Scale</ThemedText>
              </TouchableOpacity>
            ) : (
              <>
                {!isMeasuring ? (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={startMeasuring}
                  >
                    <ThemedText style={styles.buttonText}>Start Measuring</ThemedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleDigitalSubmit}
                  >
                    <ThemedText style={styles.buttonText}>Submit Weight</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.secondary }]}
                  onPress={disconnect}
                >
                  <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={() => setShowManualInput(true)}
            >
              <ThemedText style={styles.buttonText}>Manual Input</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={onCancel}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}
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
  errorText: {
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  button: {
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