import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
    ViewStyle
} from 'react-native';

interface LoadingStateProps {
  type?: 'card' | 'list' | 'text' | 'image' | 'profile';
  width?: number | string;
  height?: number | string;
  lines?: number;
  rounded?: boolean;
  style?: ViewStyle;
  text?: string;
}

export function LoadingState({
  type = 'card',
  width,
  height,
  lines = 3,
  rounded = false,
  style,
  text
}: LoadingStateProps) {
  const { theme } = useTheme();
  const shimmerValue = new Animated.Value(0);
  
  // Start the shimmer animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    
    loop.start();
    
    return () => {
      loop.stop();
    };
  }, [shimmerValue]);
  
  // Create shimmer gradient interpolation
  const shimmerGradient = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.background + '50', 
      theme.colors.background + 'BB'
    ],
  });
  
  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return (
          <View style={styles.listContainer}>
            {Array(lines).fill(0).map((_, index) => (
              <View key={index} style={styles.listItem}>
                <View 
                  style={[
                    styles.listAvatar, 
                    { backgroundColor: theme.colors.background + '80' }
                  ]} 
                />
                <View style={styles.listContent}>
                  <View 
                    style={[
                      styles.listTitle, 
                      { backgroundColor: theme.colors.background + '80' }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.listSubtitle, 
                      { backgroundColor: theme.colors.background + '80' }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        );
        
      case 'text':
        return (
          <View style={styles.textContainer}>
            {Array(lines).fill(0).map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.textLine,
                  { 
                    backgroundColor: theme.colors.background + '80',
                    width: index === lines - 1 && lines > 1 ? '70%' : '100%',
                  }
                ]} 
              />
            ))}
          </View>
        );
        
      case 'image':
        return (
          <View 
            style={[
              styles.image, 
              { 
                backgroundColor: theme.colors.background + '80',
                width: width || '100%',
                height: height || 200,
                borderRadius: rounded ? (typeof height === 'number' ? height / 2 : 100) : 8
              }
            ]} 
          />
        );
        
      case 'profile':
        return (
          <View style={styles.profileContainer}>
            <View 
              style={[
                styles.profileAvatar, 
                { backgroundColor: theme.colors.background + '80' }
              ]} 
            />
            <View style={styles.profileContent}>
              <View 
                style={[
                  styles.profileName, 
                  { backgroundColor: theme.colors.background + '80' }
                ]} 
              />
              <View 
                style={[
                  styles.profileDetails, 
                  { backgroundColor: theme.colors.background + '80' }
                ]} 
              />
            </View>
          </View>
        );
        
      case 'card':
      default:
        return (
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.colors.background + '50',
                width: width || '100%',
                height: height || 150,
                borderRadius: rounded ? 100 : 8
              }
            ]} 
          />
        );
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {renderSkeleton()}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shimmerGradient,
          },
          styles.shimmer,
        ]}
      />
      {text && (
        <Text style={[styles.loadingText, { color: theme.colors.text + '80' }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    opacity: 0.5,
  },
  card: {
    overflow: 'hidden',
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listTitle: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  listSubtitle: {
    height: 12,
    width: '80%',
    borderRadius: 4,
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  image: {
    overflow: 'hidden',
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileContent: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    height: 20,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  profileDetails: {
    height: 16,
    width: '90%',
    borderRadius: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default LoadingState; 