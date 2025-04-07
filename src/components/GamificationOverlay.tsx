import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/theme';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'collection' | 'recycling' | 'community';
  points: number;
}

interface GamificationOverlayProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function GamificationOverlay({ achievement, onClose }: GamificationOverlayProps): JSX.Element | null {
  const theme = useTheme()()();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (achievement) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(animation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    }
  }, [achievement, animation, onClose]);

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
          backgroundColor: `${theme.colors.success}F2`, // rgba(46, 125, 50, 0.95) equivalent
          margin: 16,
          padding: 16,
          borderRadius: 8,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <ThemedView style={styles.content}>
        <IconSymbol 
          name="trophy" 
          size={48} 
          color={theme.colors.warning}
        />
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: theme.colors.white }]}>
            Achievement Unlocked!
          </ThemedText>
          <ThemedText style={[styles.achievementText, { color: theme.colors.white }]}>
            {achievement.title}
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.white }]}>
            {achievement.description}
          </ThemedText>
          <ThemedText style={[styles.points, { color: theme.colors.warning }]}>
            +{achievement.points} points
          </ThemedText>
        </View>
        <HapticTab 
          style={[styles.button, { backgroundColor: theme.colors.warning }]} 
          onPress={onClose}
          accessibilityLabel="Close achievement notification"
        >
          <ThemedText style={[styles.buttonText, { color: theme.colors.white }]}>
            Awesome!
          </ThemedText>
        </HapticTab>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 