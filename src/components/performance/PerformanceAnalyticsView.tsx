import { ThemedView } from '@/components/ThemedView';
import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    PanResponder,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { AnimatedNumber } from '@/AnimatedMetrics';
import { AlertAnalyticsService } from '@/services/AlertAnalyticsService';
import { AlertPriority } from '@/services/AlertPrioritization';
import { AlertData } from '@/services/PerformanceAlertService';
import { useTheme } from '@/theme/ThemeContext';
import { PerformanceAnalytics } from '@/services/PerformanceAnalytics';

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
    withDots?: boolean;
  }>;
  legend?: string[];
}

interface PinchHandlerStateChangeEvent {
  nativeEvent: {
    state: number;
    scale: number;
  };
}

interface Colors {
  text: string;
  textDark: string;
  textSecondary: string;
  textSecondaryDark: string;
  surface: string;
  surfaceDark: string;
  primary: string;
  primaryDark: string;
  error: string;
  orange: string;
  purple: string;
  green: string;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color: string;
}

interface InteractiveMetricCardProps extends MetricCardProps {
  isSelected: boolean;
  onPress: () => void;
  detail?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface ChartConfig {
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces: number;
  color: (opacity?: number) => string;
  labelColor: (opacity?: number) => string;
  strokeWidth?: number;
  barPercentage?: number;
  propsForDots?: {
    r: string;
    strokeWidth: string;
    stroke: string;
  };
  style?: {
    borderRadius?: number;
  };
}

type MetricKey = 'alerts' | 'responseTime' | 'dismissalRate' | 'groupEfficiency' | `priority_${number}` | `distribution_${number}` | `trend_${number}`;

interface AnimatedValues {
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
  rotateAnim: Animated.Value;
  bounceAnim: Animated.Value;
}

interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

interface AnimatedTrendingItemProps {
  issue: string;
  index: number;
  isDark: boolean;
  colors: Colors;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  accessibilityLiveRegion: 'none' | 'polite' | 'assertive';
}

interface AnimationConfig {
  toValue: number;
  duration?: number;
  tension?: number;
  friction?: number;
  useNativeDriver: boolean;
  easing?: any;
  delay?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
  component?: string;
}

interface AnalyticsData {
  totalCollections: number;
  averageWeight: number;
  totalCredits: number;
  userEngagement: number;
  environmentalImpact: {
    plasticSaved: number;
    co2Reduced: number;
  };
}

export function PerformanceAnalyticsView() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({ hasError: false });
  const retryCount = useRef(0);
  const animations = useRef<AnimatedValues>({
    fadeAnim: new Animated.Value(0),
    scaleAnim: new Animated.Value(0.95),
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    rotateAnim: new Animated.Value(0),
    bounceAnim: new Animated.Value(0),
  }).current;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const chartDimensions: ChartDimensions = {
    width: width - 32,
    height: 220,
    padding: 16,
  };

  const handleError = (error: Error, component?: string) => {
    setErrors({ hasError: true, error, component });
    console.error(`Error in ${component || 'unknown component'}:`, error);
  };

  const resetError = () => {
    setErrors({ hasError: false });
    retryCount.current = 0;
  };

  const retryOperation = async () => {
    if (retryCount.current >= 3) {
      handleError(new Error('Max retry attempts reached'));
      return;
    }
    retryCount.current++;
    try {
      await refreshData();
      resetError();
    } catch (error) {
      handleError(error as Error, 'retry');
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animations.fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      } as AnimationConfig),
      Animated.spring(animations.scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const analyticsData = await PerformanceAnalytics.getAnalytics(period);
      setData(analyticsData);
      // Simulate refresh animation
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      handleError(error as Error, 'refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    const analyticsData = await PerformanceAnalytics.getAnalytics(period);
    setData(analyticsData);
  };

  const handleMetricPress = (metric: string) => {
    setSelectedMetric(metric === selectedMetric ? null : metric);
    Animated.sequence([
      Animated.timing(animations.scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animations.scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const analytics = AlertAnalyticsService.getAnalytics();

  const calculateMetrics = (alerts: AlertData[]): { mostFrequent: string } => {
    const metricCounts = new Map<string, number>();
    alerts.forEach(alert => {
      if (alert.metric) {
        const count = metricCounts.get(alert.metric) || 0;
        metricCounts.set(alert.metric, count + 1);
      }
    });

    const sortedMetrics = Array.from(metricCounts.entries())
      .sort(([, a], [, b]) => b - a);

    return {
      mostFrequent: sortedMetrics[0]?.[0] || '',
    };
  };

  const priorityChartData = {
    labels: Object.keys(AlertPriority)
      .filter(key => isNaN(Number(key)))
      .map(key => key.charAt(0) + key.slice(1).toLowerCase()),
    data: Object.values(analytics.alertsByPriority),
    colors: [
      colors.error,
      colors.orange,
      colors.primary,
      colors.green,
    ],
  };

  const typeChartData: ChartData = {
    labels: Object.keys(analytics.alertsByType),
    datasets: [{
      data: Object.values(analytics.alertsByType),
      color: () => isDark ? colors.primaryDark : colors.primary,
    }],
  };

  if (!data) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        <IconSymbol name="chart-box" size={24} color="#2e7d32" />
        Performance Analytics
      </ThemedText>

      <View style={styles.periodSelector}>
        {['day', 'week', 'month'].map((p) => (
          <HapticTab
            key={p}
            style={[styles.periodButton, period === p && styles.activePeriod]}
            onPress={() => setPeriod(p as 'day' | 'week' | 'month')}
          >
            <ThemedText style={styles.periodText}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </ThemedText>
          </HapticTab>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          icon="recycle"
          label="Total Collections"
          value={data.totalCollections}
        />
        <MetricCard
          icon="weight"
          label="Avg Weight (kg)"
          value={data.averageWeight.toFixed(2)}
        />
        <MetricCard
          icon="cash"
          label="Total Credits"
          value={`R${data.totalCredits.toFixed(2)}`}
        />
        <MetricCard
          icon="account-group"
          label="User Engagement"
          value={`${(data.userEngagement * 100).toFixed(1)}%`}
        />
      </View>

      <ThemedView style={styles.impactSection}>
        <ThemedText style={styles.impactTitle}>
          <IconSymbol name="earth" size={20} color="#2e7d32" />
          Environmental Impact
        </ThemedText>
        <View style={styles.impactMetrics}>
          <ThemedText style={styles.impactMetric}>
            {data.environmentalImpact.plasticSaved.toFixed(1)}kg plastic saved
          </ThemedText>
          <ThemedText style={styles.impactMetric}>
            {data.environmentalImpact.co2Reduced.toFixed(1)}kg CO₂ reduced
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

function InteractiveMetricCard({ 
  label, 
  value, 
  color, 
  isSelected, 
  onPress, 
  detail,
  accessibilityLabel,
  accessibilityHint
}: InteractiveMetricCardProps) {
  const { isDark, colors } = useTheme();
  const cardAnimations = useRef<AnimatedValues>({
    scaleAnim: new Animated.Value(1),
    rotateAnim: new Animated.Value(0),
    bounceAnim: new Animated.Value(0),
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
  }).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        handlePressIn();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: cardAnimations.translateX, dy: cardAnimations.translateY }],
        { useNativeDriver: false, listener: undefined }
      ),
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          onPress();
        }
        Animated.parallel([
          Animated.spring(cardAnimations.translateX, {
            toValue: 0,
            tension: 40,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(cardAnimations.translateY, {
            toValue: 0,
            tension: 40,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start(() => handlePressOut());
      },
    })
  ).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(cardAnimations.scaleAnim, {
        toValue: 0.95,
        tension: 40,
        friction: 3,
        useNativeDriver: true,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      }),
      Animated.timing(cardAnimations.rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(cardAnimations.scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations.rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardAnimations.bounceAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnimations.bounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      cardAnimations.bounceAnim.setValue(0);
    }
  }, [isSelected]);

  const rotate = cardAnimations.rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const bounce = cardAnimations.bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -3, 0],
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        { 
          backgroundColor: isDark ? colors.surfaceDark : colors.surface,
          transform: [
            { scale: cardAnimations.scaleAnim },
            { rotate },
            { translateY: Animated.add(bounce, cardAnimations.translateY) },
            { translateX: cardAnimations.translateX },
          ],
          borderColor: isSelected ? color : 'transparent',
          borderWidth: 2,
        }
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${label}: ${value}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: isSelected }}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.cardLabel, { color: isDark ? colors.textSecondaryDark : colors.textSecondary }]}>
        {label}
      </Text>
      <AnimatedNumber
        value={typeof value === 'number' ? value : parseFloat(value)}
        formatter={(v) => {
          if (typeof value === 'string' && value.includes('%')) {
            return `${v.toFixed(1)}%`;
          }
          if (typeof value === 'string' && value.includes('ms')) {
            return `${v.toFixed(1)}ms`;
          }
          return v.toFixed(0);
        }}
        style={[styles.cardValue, { color }]}
      />
      {detail && (
        <Animated.Text 
          style={[
            styles.cardDetail, 
            { 
              color,
              opacity: cardAnimations.bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            }
          ]}
        >
          {detail}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

function AnimatedChartContainer({ children }: { children: React.ReactNode }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1).current;

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scaleAnim } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = ({ nativeEvent }: PinchHandlerStateChangeEvent) => {
    if (nativeEvent.state === State.END) {
      baseScale.current *= nativeEvent.scale;
      scaleAnim.setValue(1);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
      <Animated.View 
        style={[
          styles.chartContainer,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: slideAnim },
              { scale: Animated.multiply(scaleAnim, baseScale) },
            ]
          }
        ]}
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityLabel="Interactive chart container"
        accessibilityHint="Pinch to zoom in or out"
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
}

function AnimatedTrendingItem({ 
  issue, 
  index, 
  isDark, 
  colors, 
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLiveRegion
}: AnimatedTrendingItemProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: swipeAnim }],
        { useNativeDriver: false, listener: undefined }
      ),
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 100) {
          onPress();
        }
        Animated.spring(swipeAnim, {
          toValue: 0,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View {...panResponder.panHandlers}>
      <Animated.View 
        style={[
          styles.trendingItem,
          {
            backgroundColor: isDark ? colors.surfaceDark : colors.surface,
            opacity: opacityAnim,
            transform: [
              { translateX: Animated.add(slideAnim, swipeAnim) },
              { scale: Animated.interpolate(swipeAnim, {
                inputRange: [-100, 0, 100],
                outputRange: [0.95, 1, 0.95],
              })},
            ],
          }
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityLiveRegion={accessibilityLiveRegion}
      >
        <Text style={[styles.trendingText, { color: isDark ? colors.textDark : colors.text }]}>
          {index + 1}. {issue}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function assertIsMetricKey(value: string): asserts value is MetricKey {
  const validMetricKeys = [
    'alerts',
    'responseTime',
    'dismissalRate',
    'groupEfficiency',
  ];
  
  if (!validMetricKeys.includes(value) && 
      !value.startsWith('priority_') && 
      !value.startsWith('distribution_') && 
      !value.startsWith('trend_')) {
    throw new Error(`Invalid metric key: ${value}`);
  }
}

function MetricCard({ icon, label, value }: { 
  icon: string; 
  label: string; 
  value: string | number;
}) {
  return (
    <ThemedView style={styles.metricCard}>
      <IconSymbol name={icon} size={24} color="#2e7d32" />
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  periodButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activePeriod: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 4,
  },
  impactSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactMetric: {
    fontSize: 14,
    color: '#2e7d32',
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  trendingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  trendingItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 16,
  },
  cardDetail: {
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 