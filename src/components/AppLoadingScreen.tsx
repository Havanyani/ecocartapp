/**
 * AppLoadingScreen.tsx
 * 
 * A loading screen displayed during app initialization.
 * Shows loading progress and provides visual feedback to users.
 */

import { useTheme } from '@/hooks/useTheme';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View
} from 'react-native';

// Get screen dimensions
const { width } = Dimensions.get('window');

interface AppLoadingScreenProps {
  progress?: number; // 0-100
  message?: string;
  isFinished?: boolean;
  onFinishAnimationComplete?: () => void;
  testID?: string;
}

export function AppLoadingScreen({
  progress = 0,
  message = 'Loading...',
  isFinished = false,
  onFinishAnimationComplete,
  testID,
}: AppLoadingScreenProps) {
  const { theme, isDark } = useTheme();
  const [progressAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(1));

  // Update progress animation when progress changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnimation]);

  // Fade out when finished
  useEffect(() => {
    if (isFinished) {
      // Small delay before fading out
      setTimeout(() => {
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (onFinishAnimationComplete) {
            onFinishAnimationComplete();
          }
        });
      }, 500);
    }
  }, [isFinished, fadeAnimation, onFinishAnimationComplete]);

  // Interpolate progress width
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnimation
        }
      ]}
      testID={testID}
    >
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/eco-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          EcoCart
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Making sustainability simple
        </Text>
        
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBackground, 
              { backgroundColor: theme.colors.border }
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                { 
                  width: progressWidth,
                  backgroundColor: theme.colors.primary 
                }
              ]}
            />
          </View>
          
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: width * 0.8,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default AppLoadingScreen; 