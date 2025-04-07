/**
 * Modal.native.tsx
 * 
 * Native-specific implementation of the Modal component.
 * Uses React Native's Modal with additional functionality.
 */

import React, { useEffect } from 'react';
import {
    Animated,
    BackHandler,
    Platform,
    Modal as RNModal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ModalProps } from './Modal';

export function Modal({
  visible,
  onClose,
  children,
  containerStyle,
  contentStyle,
  contentPadding = true,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  animateTransition = true,
  animationDuration = 300,
  backdropColor = 'rgba(0, 0, 0, 0.5)',
  presentAboveStatusBar = false,
  testID,
  accessibilityLabel,
  fullScreen = false,
  position = 'center',
  showHeader = false,
  title,
}: ModalProps) {
  const { theme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(20)).current;
  
  // Handle Android back button
  useEffect(() => {
    if (!visible || !closeOnBackButton) return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    
    return () => backHandler.remove();
  }, [visible, closeOnBackButton, onClose]);
  
  // Animation on mount/unmount
  useEffect(() => {
    if (visible) {
      // Animate in
      translateYAnim.setValue(position === 'bottom' ? 50 : position === 'top' ? -50 : 20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values when modal is hidden
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, translateYAnim, animationDuration, position]);
  
  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };
  
  // Calculate position styles
  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return styles.topPosition;
      case 'bottom':
        return styles.bottomPosition;
      case 'center':
      default:
        return styles.centerPosition;
    }
  };
  
  // Render header if needed
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {title ? (
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animateTransition ? 'fade' : 'none'}
      statusBarTranslucent={presentAboveStatusBar}
      onRequestClose={onClose}
      testID={testID}
      supportedOrientations={['portrait', 'landscape']}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: backdropColor },
          containerStyle,
        ]}
        edges={presentAboveStatusBar ? ['bottom', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
          accessibilityLabel={accessibilityLabel || 'Modal backdrop'}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              getPositionStyle(),
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
                backgroundColor: theme.colors.background,
                ...(fullScreen && styles.fullScreen),
              },
              contentStyle,
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                contentPadding && styles.contentPadding,
                fullScreen && styles.fullScreenContent,
              ]}
              onPress={() => {}} // Prevent backdrop press from closing when touching modal content
            >
              {renderHeader()}
              {children}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </SafeAreaView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  contentPadding: {
    padding: 16,
  },
  centerPosition: {
    alignSelf: 'center',
  },
  topPosition: {
    alignSelf: 'center',
    marginTop: 80,
  },
  bottomPosition: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  fullScreen: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    margin: 0,
  },
  fullScreenContent: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerPlaceholder: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
}); 