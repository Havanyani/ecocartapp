import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlertData {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

export function PerformanceAlert({ alert, onDismiss }: { 
  alert: AlertData; 
  onDismiss: () => void;
}) {
  const themeFunc = useTheme();
const theme = themeFunc();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(handleDismiss, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'error':
        return '#d32f2f';
      case 'warning':
        return '#f57c00';
      default:
        return '#2196f3';
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'warning': return 'alert';
      case 'error': return 'alert-circle';
      default: return 'information';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          marginTop: insets.top,
        },
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.content}>
        <IconSymbol name={getAlertIcon()} size={24} color={getAlertColor()} />
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: theme.text.primary.color }]}>
            {alert.title}
          </ThemedText>
          <ThemedText style={[styles.message, { color: theme.text.secondary.color }]}>
            {alert.message}
          </ThemedText>
          {alert.metric && (
            <ThemedText style={[styles.metric, { color: getAlertColor() }]}>
              {alert.metric}: {alert.value?.toFixed(2)} (Threshold: {alert.threshold?.toFixed(2)})
            </ThemedText>
          )}
        </View>
        <HapticTab onPress={handleDismiss}>
          <IconSymbol name="close" size={20} color={theme.text.secondary.color} />
        </HapticTab>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
  metric: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
}); 