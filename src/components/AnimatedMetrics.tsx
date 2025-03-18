import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, TextStyle, View } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  style?: Animated.WithAnimatedValue<StyleProp<TextStyle>>;
}

export function AnimatedNumber({ value, duration = 1000, formatter, style }: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState('0');
  const prevValue = useRef(value);

  useEffect(() => {
    const startValue = prevValue.current / value;
    animatedValue.setValue(startValue);
    
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const listener = animatedValue.addListener(({ value: progress }) => {
      const currentValue = value * progress;
      setDisplayValue(formatter ? formatter(currentValue) : currentValue.toFixed(0));
    });

    prevValue.current = value;
    return () => animatedValue.removeListener(listener);
  }, [value, formatter]);

  return (
    <Animated.Text 
      style={[
        style,
        {
          transform: [
            { scale: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.1, 1],
            })},
          ],
        },
      ]}
    >
      {displayValue}
    </Animated.Text>
  );
}

interface MetricsData {
  [key: string]: number;
}

interface AnimatedMetricsProps {
  metrics: MetricsData;
  title?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onMetricPress?: (key: string, value: number) => void;
}

export function AnimatedMetrics({ 
  metrics,
  title = 'Impact Metrics',
  icon = 'chart-areaspline',
  onMetricPress = (key, value) => console.log(`${key}: ${value}`),
}: AnimatedMetricsProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [metrics]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name={icon} size={24} color="#2e7d32" />
        {title}
      </ThemedText>

      <View style={styles.metricsContainer}>
        {Object.entries(metrics).map(([key, value], index) => (
          <Animated.View
            key={key}
            style={[
              styles.metricCard,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <ThemedText style={styles.metricLabel}>{key}</ThemedText>
            <AnimatedNumber
              value={value}
              style={styles.metricValue}
              formatter={(val) => val.toFixed(0)}
            />
            <HapticTab onPress={() => onMetricPress(key, value)}>
              <IconSymbol name="information" size={20} color="#666" />
            </HapticTab>
          </Animated.View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
}); 