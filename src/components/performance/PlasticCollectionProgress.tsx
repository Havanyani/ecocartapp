import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';

interface Props {
  current: number;
  target: number;
  unit?: string;
}

export function PlasticCollectionProgress({
  current,
  target,
  unit = 'kg'
}: Props) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Collection Progress</ThemedText>
        <ThemedText style={styles.subtitle}>
          {current.toFixed(1)}/{target.toFixed(1)} {unit}
        </ThemedText>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isComplete && styles.progressComplete
            ]} 
          />
        </View>
        {isComplete && (
          <IconSymbol
            name="check-circle"
            size={24}
            color="#2e7d32"
            style={styles.completeIcon}
          />
        )}
      </View>

      <ThemedText style={styles.percentageText}>
        {progress.toFixed(1)}%
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: '#2e7d32',
  },
  completeIcon: {
    position: 'absolute',
    right: -12,
    top: -8,
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
}); 