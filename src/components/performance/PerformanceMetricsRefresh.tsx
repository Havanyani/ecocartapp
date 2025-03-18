import { HapticTab } from '@components/ui/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import { ThemedText } from '@components/ui/ThemedText';
import { ThemedView } from '@components/ui/ThemedView';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface PerformanceMetricsRefreshProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshInterval?: number;
}

export function PerformanceMetricsRefresh({
  lastUpdated,
  isRefreshing,
  onRefresh,
  refreshInterval = 300000, // 5 minutes default
}: PerformanceMetricsRefreshProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isRefreshing]);

  useEffect(() => {
    const timeSinceUpdate = Date.now() - lastUpdated.getTime();
    if (timeSinceUpdate >= refreshInterval) {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [lastUpdated, refreshInterval]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.updateText}>
          Last updated: {formatTimeAgo(lastUpdated)}
        </ThemedText>
        <HapticTab
          style={[styles.refreshButton, isRefreshing && styles.refreshing]}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          <Animated.View style={{ transform: [{ rotate }], opacity: opacityAnim }}>
            <IconSymbol
              name="refresh"
              size={20}
              color={isRefreshing ? '#2e7d32' : '#666'}
            />
          </Animated.View>
          <ThemedText
            style={[styles.refreshText, isRefreshing && styles.refreshingText]}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </ThemedText>
        </HapticTab>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateText: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  refreshing: {
    backgroundColor: '#e8f5e9',
  },
  refreshText: {
    fontSize: 14,
    color: '#666',
  },
  refreshingText: {
    color: '#2e7d32',
  },
}); 