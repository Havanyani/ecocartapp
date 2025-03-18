import { useTheme } from '@/hooks/useTheme';
import { AnimationMonitor } from '@/utils/AnimationPerformanceMonitor';
import { SafeStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    LayoutChangeEvent,
    LayoutRectangle,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Constants
const HIGHLIGHT_PADDING = 8;
const SPOTLIGHT_BORDER_RADIUS = 8;
const TUTORIAL_STORAGE_KEY = '@ecocart:completed_tutorials';

// Animation configuration with consistent settings
const AnimationConfig = {
  // Set this to false to ensure all animations use the same driver setting
  // This prevents the "native driver already used" error
  useNativeDriver: false, 
  opacityDuration: 300,
  spotlightDuration: 400,
  translateDuration: 250
};

// Types
export interface TourStep {
  targetRef: React.RefObject<any>;
  title: string;
  description: string;
  spotlightBorderRadius?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  extraPadding?: number;
}

export interface FeatureTourProps {
  steps: TourStep[];
  visible: boolean;
  onFinish: () => void;
  onSkip?: () => void;
  tourId: string;
  showOnce?: boolean;
  disableBackButton?: boolean;
  disableOverlayClose?: boolean;
  overlayOpacity?: number;
  buttonTextColor?: string;
  accentColor?: string;
}

// Main component
export function FeatureTour({
  steps,
  visible,
  onFinish,
  onSkip,
  tourId,
  showOnce = true,
  disableBackButton = false,
  disableOverlayClose = false,
  overlayOpacity = 0.7,
  buttonTextColor,
  accentColor,
}: FeatureTourProps) {
  const { theme } = useTheme();
  
  // Use provided colors or default to theme
  const highlightColor = accentColor || theme.colors.primary;
  const buttonColor = buttonTextColor || '#FFFFFF';

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [shouldShow, setShouldShow] = useState(visible);

  // Animation values
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const spotlightAnim = useRef(new Animated.Value(0)).current;
  
  // Screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Current step
  const currentStep = steps[currentStepIndex];

  // Check if tour has been shown before
  useEffect(() => {
    if (showOnce && visible) {
      checkIfTourCompleted();
    } else {
      setShouldShow(visible);
    }
  }, [visible, showOnce, tourId]);

  // Handle Android back button
  useEffect(() => {
    if (!disableBackButton && shouldShow) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleSkip();
        return true;
      });
      
      return () => backHandler.remove();
    }
  }, [shouldShow, disableBackButton]);

  // Animate when target layout changes
  useEffect(() => {
    if (targetLayout && shouldShow) {
      animateSpotlight();
    }
  }, [targetLayout, shouldShow]);

  // Update target layout when step changes
  useEffect(() => {
    if (shouldShow && currentStep?.targetRef?.current) {
      updateTargetLayout();
    }
  }, [currentStepIndex, shouldShow, currentStep]);

  // Measure the target element
  const updateTargetLayout = () => {
    setIsReady(false);
    
    if (currentStep.targetRef.current) {
      currentStep.targetRef.current.measure?.(
        (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
          // Add padding to the target
          const padding = currentStep.extraPadding || HIGHLIGHT_PADDING;
          
          setTargetLayout({
            x: pageX - padding,
            y: pageY - padding,
            width: width + (padding * 2),
            height: height + (padding * 2),
          });
          
          setIsReady(true);
        }
      );
    }
  };

  // Animate the spotlight effect
  const animateSpotlight = () => {
    // Create animation IDs for monitoring
    const opacityAnimId = AnimationMonitor.createAnimationId('FeatureTour', 'opacity');
    const spotlightAnimId = AnimationMonitor.createAnimationId('FeatureTour', 'spotlight');
    
    // Start tracking animations
    const completeOpacityTracking = AnimationMonitor.trackAnimation(
      opacityAnimId, 
      AnimationConfig.opacityDuration, 
      AnimationConfig.useNativeDriver
    );
    
    const completeSpotlightTracking = AnimationMonitor.trackAnimation(
      spotlightAnimId, 
      AnimationConfig.spotlightDuration, 
      AnimationConfig.useNativeDriver
    );
    
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: AnimationConfig.opacityDuration,
        useNativeDriver: AnimationConfig.useNativeDriver,
      }),
      Animated.timing(spotlightAnim, {
        toValue: 1,
        duration: AnimationConfig.spotlightDuration,
        useNativeDriver: AnimationConfig.useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        completeOpacityTracking();
        completeSpotlightTracking();
      }
    });
  };

  // Reset animations for the next step
  const resetAnimations = () => {
    opacityAnim.setValue(0);
    spotlightAnim.setValue(0);
  };

  // Handle tooltip layout change
  const handleTooltipLayout = (event: LayoutChangeEvent) => {
    setTooltipLayout(event.nativeEvent.layout);
  };

  // Determine tooltip position
  const getTooltipPosition = (): ViewStyle => {
    if (!targetLayout || !tooltipLayout) {
      // Default to center of screen if we don't have measurements yet
      return {
        left: screenWidth / 2 - (tooltipLayout?.width || 0) / 2,
        top: screenHeight / 2,
      };
    }

    // Center point of target
    const targetCenterX = targetLayout.x + targetLayout.width / 2;
    const targetCenterY = targetLayout.y + targetLayout.height / 2;

    // Get position preference or calculate best fit
    const position = currentStep.position || calculateBestPosition();

    // Calculate position based on preference
    switch (position) {
      case 'top':
        return {
          left: targetCenterX - (tooltipLayout.width / 2),
          top: targetLayout.y - tooltipLayout.height - 20,
        };
      case 'bottom':
        return {
          left: targetCenterX - (tooltipLayout.width / 2),
          top: targetLayout.y + targetLayout.height + 20,
        };
      case 'left':
        return {
          left: targetLayout.x - tooltipLayout.width - 20,
          top: targetCenterY - (tooltipLayout.height / 2),
        };
      case 'right':
        return {
          left: targetLayout.x + targetLayout.width + 20,
          top: targetCenterY - (tooltipLayout.height / 2),
        };
      default: // 'center'
        return {
          left: screenWidth / 2 - (tooltipLayout.width / 2),
          top: screenHeight / 2 + 50, // Lower center
        };
    }
  };

  // Calculate best position based on available space
  const calculateBestPosition = (): 'top' | 'bottom' | 'left' | 'right' | 'center' => {
    if (!targetLayout || !tooltipLayout) return 'bottom';

    const spaceTop = targetLayout.y;
    const spaceBottom = screenHeight - (targetLayout.y + targetLayout.height);
    const spaceLeft = targetLayout.x;
    const spaceRight = screenWidth - (targetLayout.x + targetLayout.width);

    // Find the position with most available space
    const spaces = [
      { position: 'top' as const, space: spaceTop },
      { position: 'bottom' as const, space: spaceBottom },
      { position: 'left' as const, space: spaceLeft },
      { position: 'right' as const, space: spaceRight },
    ];

    // Sort by most space and return position
    const bestPosition = spaces.sort((a, b) => b.space - a.space)[0];
    
    // If the best position doesn't have enough space for the tooltip, use center
    if (bestPosition.position === 'top' || bestPosition.position === 'bottom') {
      return bestPosition.space > tooltipLayout.height + 40 
        ? bestPosition.position 
        : 'center';
    } else {
      return bestPosition.space > tooltipLayout.width + 40 
        ? bestPosition.position 
        : 'center';
    }
  };

  // Check if this tour has been completed before
  const checkIfTourCompleted = async () => {
    try {
      const completedTours = await SafeStorage.getItem(TUTORIAL_STORAGE_KEY);
      const completedToursArray = completedTours ? JSON.parse(completedTours) : [];
      
      if (completedToursArray.includes(tourId)) {
        setShouldShow(false);
        onFinish();
      } else {
        setShouldShow(true);
      }
    } catch (error) {
      console.error('Error checking tour completion status:', error);
      setShouldShow(true);
    }
  };

  // Mark tour as completed
  const markTourAsCompleted = async () => {
    if (!showOnce) return;
    
    try {
      const completedTours = await SafeStorage.getItem(TUTORIAL_STORAGE_KEY);
      const completedToursArray = completedTours ? JSON.parse(completedTours) : [];
      
      if (!completedToursArray.includes(tourId)) {
        completedToursArray.push(tourId);
        await SafeStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(completedToursArray));
      }
    } catch (error) {
      console.error('Error marking tour as completed:', error);
    }
  };

  // Handlers for navigation
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      resetAnimations();
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      resetAnimations();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    markTourAsCompleted();
    setCurrentStepIndex(0);
    setShouldShow(false);
    onSkip ? onSkip() : onFinish();
  };

  const handleFinish = () => {
    markTourAsCompleted();
    setCurrentStepIndex(0);
    setShouldShow(false);
    onFinish();
  };

  // Handler for overlay press
  const handleOverlayPress = () => {
    if (!disableOverlayClose) {
      handleSkip();
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={shouldShow}
      animationType="fade"
      onRequestClose={() => !disableBackButton && handleSkip()}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar
          translucent
          backgroundColor="rgba(0, 0, 0, 0.5)"
          barStyle="light-content"
        />
        
        {/* Background overlay */}
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]}
          onPress={handleOverlayPress}
        >
          {/* Target spotlight */}
          {targetLayout && isReady && (
            <View style={StyleSheet.absoluteFill}>
              <Animated.View
                style={[
                  styles.spotlight,
                  {
                    left: targetLayout.x,
                    top: targetLayout.y,
                    width: targetLayout.width,
                    height: targetLayout.height,
                    borderRadius: currentStep.spotlightBorderRadius || SPOTLIGHT_BORDER_RADIUS,
                    opacity: opacityAnim,
                    transform: [
                      {
                        scale: spotlightAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                    borderColor: highlightColor,
                  },
                ]}
              />
            </View>
          )}

          {/* Tooltip */}
          {isReady && (
            <Animated.View
              style={[
                styles.tooltipContainer,
                getTooltipPosition(),
                {
                  opacity: opacityAnim,
                  transform: [
                    {
                      translateY: opacityAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
              onLayout={handleTooltipLayout}
            >
              <View 
                style={[
                  styles.tooltip, 
                  { backgroundColor: theme.colors.card }
                ]}
              >
                <Text style={[styles.tooltipTitle, { color: theme.colors.text }]}>
                  {currentStep.title}
                </Text>
                <Text style={[styles.tooltipDescription, { color: theme.colors.text + 'CC' }]}>
                  {currentStep.description}
                </Text>

                <View style={styles.buttonsContainer}>
                  {/* Skip button */}
                  {onSkip && (
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={handleSkip}
                    >
                      <Text style={[styles.skipButtonText, { color: theme.colors.text }]}>
                        Skip
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.navigationButtons}>
                    {/* Previous button */}
                    <TouchableOpacity
                      style={[
                        styles.navButton,
                        { opacity: currentStepIndex > 0 ? 1 : 0.5 },
                      ]}
                      onPress={handlePrevious}
                      disabled={currentStepIndex === 0}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>

                    {/* Step indicator */}
                    <Text style={[styles.stepIndicator, { color: theme.colors.text }]}>
                      {currentStepIndex + 1}/{steps.length}
                    </Text>

                    {/* Next/Finish button */}
                    <TouchableOpacity
                      style={[
                        styles.navButton,
                        styles.nextButton,
                        { backgroundColor: highlightColor },
                      ]}
                      onPress={handleNext}
                    >
                      <Text style={[styles.nextButtonText, { color: buttonColor }]}>
                        {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
                      </Text>
                      <Ionicons
                        name={currentStepIndex < steps.length - 1 ? "chevron-forward" : "checkmark"}
                        size={20}
                        color={buttonColor}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    position: 'absolute',
    maxWidth: '80%',
    width: 300,
    alignItems: 'center',
  },
  tooltip: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  nextButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 12,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  stepIndicator: {
    marginHorizontal: 12,
    fontSize: 14,
  },
});

export default FeatureTour; 