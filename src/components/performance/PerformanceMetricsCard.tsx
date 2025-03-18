import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: number;
  unit?: string;
  onPress?: () => void;
  isHighlighted?: boolean;
}

export function PerformanceMetricsCard({
  title,
  value,
  icon,
  trend,
  unit = '',
  onPress,
  isHighlighted = false,
}: MetricsCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isHighlighted]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -3, 0],
  });

  return (
    <HapticTab onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounce },
            ],
            borderColor: isHighlighted ? '#2e7d32' : 'transparent',
          },
        ]}
      >
        <ThemedView style={styles.header}>
          <IconSymbol name={icon} size={24} color="#2e7d32" />
          <ThemedText style={styles.title}>{title}</ThemedText>
        </ThemedView>

        <ThemedText style={styles.value}>
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit}
        </ThemedText>

        {trend !== undefined && (
          <ThemedView style={styles.trendContainer}>
            <IconSymbol
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={trend >= 0 ? '#2e7d32' : '#d32f2f'}
            />
            <ThemedText
              style={[
                styles.trendValue,
                { color: trend >= 0 ? '#2e7d32' : '#d32f2f' },
              ]}
            >
              {Math.abs(trend).toFixed(1)}%
            </ThemedText>
          </ThemedView>
        )}
      </Animated.View>
    </HapticTab>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 