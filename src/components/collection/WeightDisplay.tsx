import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet } from 'react-native';

interface WeightDisplayProps {
  weight: number;
  credit: number;
  materialType: string;
  isStable?: boolean;
}

export function WeightDisplay({
  weight,
  credit,
  materialType,
  isStable = true,
}: WeightDisplayProps) {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="scale" size={24} color={colors.primary} />
        <ThemedText style={styles.title}>Weight Measurement</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.weightContainer}>
          <ThemedText style={styles.weightValue}>
            {weight.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.unit}>kg</ThemedText>
        </ThemedView>

        {!isStable && (
          <ThemedText style={[styles.stabilityText, { color: colors.warning }]}>
            Stabilizing...
          </ThemedText>
        )}

        <ThemedView style={styles.details}>
          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Material Type:</ThemedText>
            <ThemedText style={styles.detailValue}>{materialType}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Credit Earned:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: colors.success }]}>
              {credit.toFixed(2)} credits
            </ThemedText>
          </ThemedView>
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
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 24,
    marginLeft: 8,
    opacity: 0.8,
  },
  stabilityText: {
    fontSize: 16,
    marginBottom: 16,
  },
  details: {
    width: '100%',
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 