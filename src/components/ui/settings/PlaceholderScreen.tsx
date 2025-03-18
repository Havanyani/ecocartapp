import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from '@/components/ui/ThemedText';

export interface PlaceholderScreenProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export function PlaceholderScreen({ title, icon, description }: PlaceholderScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      edges={['bottom']}
      testID="placeholder-container"
      accessible={true}
      accessibilityRole="none"
    >
      <Animated.View 
        style={styles.content}
        entering={FadeIn.duration(500)}
        testID="placeholder-content"
      >
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: theme.colors.surface }
          ]}
          testID="placeholder-icon-container"
          accessible={true}
          accessibilityRole="none"
        >
          <Ionicons 
            name={icon} 
            size={64} 
            color={theme.colors.secondary} 
            testID="placeholder-icon"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`${title} icon`}
          />
        </View>
        <ThemedText 
          variant="primary" 
          type="title"
          style={styles.title}
          testID="placeholder-title"
          accessible={true}
          accessibilityRole="header"
        >
          {title}
        </ThemedText>
        <ThemedText 
          variant="secondary"
          style={styles.description}
          testID="placeholder-description"
          accessible={true}
          accessibilityRole="text"
        >
          {description}
        </ThemedText>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
}); 