import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { slides } from '@/constants/onboarding';
import { useTheme } from '@/hooks/useTheme';
import TutorialService from '@/services/TutorialService';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<typeof slides[0]>>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  // Animation for background color
  const backgroundColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * windowWidth),
    outputRange: slides.map(slide => slide.color + '20'),
    extrapolate: 'clamp',
  });

  // Handle skip
  const handleSkip = async () => {
    await TutorialService.markOnboardingCompleted();
    router.replace('/');
  };

  // Handle next slide or completion
  const handleNextOrGetStarted = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await TutorialService.markOnboardingCompleted();
      router.replace('/');
    }
  };

  // Handle slide change
  const handleViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    const index = info.viewableItems[0]?.index ?? 0;
    setCurrentIndex(index);
  }).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="auto" />
      
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.background },
        ]}
      />
      
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          { 
            backgroundColor,
            opacity: 0.5,
          },
        ]}
      />
      
      {/* Skip button */}
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
      >
        <Text style={[styles.skipText, { color: theme.colors.text }]}>
          Skip
        </Text>
      </TouchableOpacity>
      
      {/* Slides */}
      <FlatList
        ref={slidesRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide {...item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />
      
      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * windowWidth,
              index * windowWidth,
              (index + 1) * windowWidth,
            ];
            
            // Dot width animation
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });
            
            // Dot opacity animation
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: slides[index].color,
                  },
                ]}
              />
            );
          })}
        </View>
        
        {/* Next/Get Started button */}
        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Skip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                onPress={handleNextOrGetStarted}
              >
                <Text style={[styles.buttonText, { color: theme.colors.white }]}>
                  Next
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Link href="/(tabs)" asChild>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: theme.colors.white }]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 