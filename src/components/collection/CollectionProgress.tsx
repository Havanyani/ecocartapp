/**
 * CollectionProgress.tsx
 * 
 * Component for displaying collection progress with animations and visual indicators.
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { CollectionItem } from '@/types/collections';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

interface CollectionProgressProps {
  collection: CollectionItem;
}

export function CollectionProgress({ collection }: CollectionProgressProps) {
  const { theme } = useTheme();
  const progressAnimation = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: getProgressValue(collection.status),
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Provide haptic feedback when progress changes
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [collection.status]);

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 0.25;
      case 'in_progress':
        return 0.5;
      case 'completed':
        return 1;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'calendar-clock';
      case 'in_progress':
        return 'truck-fast';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.colors.info;
      case 'in_progress':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: getStatusColor(collection.status),
              },
            ]}
          />
        </View>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <IconSymbol
              name="calendar"
              size={24}
              color={
                getProgressValue(collection.status) >= 0.25
                  ? theme.colors.primary
                  : theme.colors.text
              }
            />
            <Text style={styles.stepText}>Scheduled</Text>
          </View>
          <View style={styles.step}>
            <IconSymbol
              name="truck"
              size={24}
              color={
                getProgressValue(collection.status) >= 0.5
                  ? theme.colors.primary
                  : theme.colors.text
              }
            />
            <Text style={styles.stepText}>In Progress</Text>
          </View>
          <View style={styles.step}>
            <IconSymbol
              name="check"
              size={24}
              color={
                getProgressValue(collection.status) >= 1
                  ? theme.colors.primary
                  : theme.colors.text
              }
            />
            <Text style={styles.stepText}>Completed</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <IconSymbol
          name={getStatusIcon(collection.status)}
          size={24}
          color={getStatusColor(collection.status)}
        />
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(collection.status) },
          ]}
        >
          {collection.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
  },
  stepText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
}); 