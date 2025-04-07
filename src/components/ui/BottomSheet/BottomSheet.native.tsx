/**
 * BottomSheet.native.tsx
 * 
 * Native-specific implementation of the BottomSheet component.
 * Uses gesture handling and animations for a natural feel on mobile.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import type { BottomSheetProps } from './BottomSheet';

// Constants for gestures and animations
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MINIMUM_THRESHOLD = 20; // Minimum distance to register a gesture
const VELOCITY_THRESHOLD = 0.2; // Velocity to determine if swipe is intended

export function BottomSheet({
  isVisible,
  onClose,
  children,
  containerStyle,
  contentStyle,
  snapPoints = ['50%'],
  initialSnapIndex = 0,
  showHandle = true,
  rounded = true,
  borderRadius = 16,
  closeOnBackdropPress = true,
  backdropColor = 'rgba(0, 0, 0, 0.5)',
  animateOnOpen = true,
  animationDuration = 300,
  enableDrag = true,
  onPositionChange,
  showBackdrop = true,
  testID,
  accessibilityLabel,
  expandToFullscreen = false,
  showCloseButton = false,
  title,
  enableBottomSafeArea = true,
  onDragStart,
  onDragEnd,
}: BottomSheetProps): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate snap points in pixels
  const calculatedSnapPoints = snapPoints.map(point => {
    if (typeof point === 'number') {
      return point;
    } else if (point === 'content') {
      // Will be adjusted after measuring content
      return SCREEN_HEIGHT / 2;
    } else if (typeof point === 'string' && point.endsWith('%')) {
      const percentage = parseInt(point, 10) / 100;
      return SCREEN_HEIGHT * percentage;
    }
    return SCREEN_HEIGHT / 2; // Default to 50% if invalid
  });
  
  // Animation values
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  
  // Track if sheet is being dragged
  const isDraggingRef = useRef(false);
  
  // Handle Android back button
  useEffect(() => {
    if (isVisible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [isVisible, onClose]);
  
  // Update position when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Open to initial snap point
      animateToPosition(initialSnapIndex);
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: animateOnOpen ? animationDuration : 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: animateOnOpen ? animationDuration : 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, initialSnapIndex, animateOnOpen]);
  
  // Set up pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableDrag,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enableDrag && Math.abs(gestureState.dy) > MINIMUM_THRESHOLD;
      },
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        onDragStart?.();
        translateY.setOffset(-calculatedSnapPoints[currentSnapIndex] + SCREEN_HEIGHT);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward dragging from the lowest snap point
        if (
          currentSnapIndex === 0 &&
          gestureState.dy < 0 &&
          !expandToFullscreen
        ) {
          return;
        }
        
        // Only allow upward dragging from the highest snap point
        if (
          currentSnapIndex === calculatedSnapPoints.length - 1 &&
          gestureState.dy > 0
        ) {
          return;
        }
        
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        isDraggingRef.current = false;
        
        // Determine if user is flicking the sheet
        const isFlicking = Math.abs(gestureState.vy) > VELOCITY_THRESHOLD;
        
        if (isFlicking) {
          // If flicking down with enough velocity, close the sheet
          if (gestureState.vy > 0) {
            // If we're at the lowest snap point and flicking down, close
            if (currentSnapIndex === 0) {
              onClose();
            } else {
              // Otherwise, snap to the next snap point down
              animateToPosition(currentSnapIndex - 1);
            }
          } else {
            // If flicking up, go to the next snap point
            if (currentSnapIndex < calculatedSnapPoints.length - 1) {
              animateToPosition(currentSnapIndex + 1);
            }
          }
        } else {
          // Not flicking, so determine closest snap point based on current position
          const currentPosition = getPositionFromValue(translateY._value);
          let nextSnapIndex = currentSnapIndex;
          
          // Calculate distance to each snap point and find the closest
          const distances = calculatedSnapPoints.map((snapPoint, index) => ({
            distance: Math.abs(currentPosition - snapPoint),
            index,
          }));
          
          // Sort by shortest distance
          distances.sort((a, b) => a.distance - b.distance);
          nextSnapIndex = distances[0].index;
          
          // If dragged below the lowest snap point, close the sheet
          if (
            currentPosition < calculatedSnapPoints[0] - 
            calculatedSnapPoints[0] * 0.2
          ) {
            onClose();
          } else {
            animateToPosition(nextSnapIndex);
          }
        }
        
        onDragEnd?.();
      },
    })
  ).current;
  
  // Function to animate to a specific snap point
  const animateToPosition = (index: number) => {
    const targetPosition = calculatedSnapPoints[index];
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT - targetPosition,
        duration: animateOnOpen ? animationDuration : 0,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: showBackdrop ? 0.5 : 0,
        duration: animateOnOpen ? animationDuration : 0,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentSnapIndex(index);
    onPositionChange?.(index);
  };
  
  // Helper to calculate position from translateY value
  const getPositionFromValue = (value: number) => {
    return SCREEN_HEIGHT - value;
  };
  
  // Handle content measurement for 'content' snap point
  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    contentHeight.current = height;
    
    // Adjust snap points with 'content' value
    if (snapPoints.includes('content')) {
      const newSnapPoints = [...calculatedSnapPoints];
      snapPoints.forEach((point, index) => {
        if (point === 'content') {
          newSnapPoints[index] = contentHeight.current + (showHandle ? 20 : 0);
        }
      });
      
      // If open and at a content snap point, update position
      if (
        isVisible &&
        snapPoints[currentSnapIndex] === 'content'
      ) {
        animateToPosition(currentSnapIndex);
      }
    }
  };
  
  // Calculate bottom padding for safe area
  const bottomPadding = enableBottomSafeArea ? insets.bottom : 0;
  
  // Determine if sheet is expanded to full screen
  const isFullScreen = expandToFullscreen && currentSnapIndex === calculatedSnapPoints.length - 1;
  
  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity: backdropOpacity,
            },
          ]}
        >
          {/* Only attach press handler to the backdrop, not the sheet itself */}
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeOnBackdropPress ? onClose : undefined}
          />
        </Animated.View>
        
        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              borderTopLeftRadius: rounded && !isFullScreen ? borderRadius : 0,
              borderTopRightRadius: rounded && !isFullScreen ? borderRadius : 0,
              backgroundColor: theme.colors.background,
              paddingBottom: bottomPadding,
              ...(isFullScreen ? styles.fullScreenSheet : {}),
            },
            containerStyle,
          ]}
          {...(enableDrag ? panResponder.panHandlers : {})}
        >
          {/* Sheet Handle */}
          {showHandle && !isFullScreen && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>
          )}
          
          {/* Header with Title and Close Button */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  {title}
                </Text>
              )}
              
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                >
                  <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <View
            style={[styles.content, contentStyle]}
            onLayout={handleContentLayout}
          >
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    width: '100%',
    maxHeight: '100%', // Allow for full-screen expansion
  },
  fullScreenSheet: {
    height: '100%',
  },
  handleContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
}); 