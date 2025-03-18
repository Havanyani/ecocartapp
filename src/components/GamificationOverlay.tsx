import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
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
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <ThemedView style={styles.content}>
        <IconSymbol 
          name="trophy" 
          size={48} 
          color="#FFD700"
        />
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Achievement Unlocked!</ThemedText>
          <ThemedText style={styles.achievementText}>{achievement.title}</ThemedText>
          <ThemedText style={styles.description}>{achievement.description}</ThemedText>
          <ThemedText style={styles.points}>+{achievement.points} points</ThemedText>
        </View>
        <HapticTab 
          style={styles.button} 
          onPress={onClose}
          accessibilityLabel="Close achievement notification"
        >
          <ThemedText style={styles.buttonText}>Awesome!</ThemedText>
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
    backgroundColor: 'rgba(46, 125, 50, 0.95)',
    padding: 16,
    margin: 16,
    borderRadius: 8,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
  points: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 