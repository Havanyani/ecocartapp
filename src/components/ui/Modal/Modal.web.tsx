/**
 * Modal.web.tsx
 * 
 * Web-specific implementation of the Modal component.
 * Uses React portals with web-specific behavior.
 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ModalProps } from './Modal';

// Create a reusable portal component
function Portal({ children }: { children: React.ReactNode }) {
  const [container] = useState(() => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.setAttribute('data-modal-container', 'true');
      return div;
    }
    return null;
  });

  useEffect(() => {
    if (container && typeof document !== 'undefined') {
      document.body.appendChild(container);
      return () => {
        document.body.removeChild(container);
      };
    }
  }, [container]);

  if (!container) {
    return null;
  }
  
  return ReactDOM.createPortal(children, container);
}

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
  presentAboveStatusBar = false, // Not applicable for web
  testID,
  accessibilityLabel,
  fullScreen = false,
  position = 'center',
  showHeader = false,
  title,
}: ModalProps) {
  const { theme } = useTheme();
  const [isRendered, setIsRendered] = useState(visible);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(20)).current;
  
  // Handle escape key press (similar to back button on native)
  useEffect(() => {
    if (!visible || !closeOnBackButton) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [visible, closeOnBackButton, onClose]);
  
  // Handle scroll lock on body
  useEffect(() => {
    if (visible) {
      // Lock scroll on the body when modal is open
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Restore scroll when modal is closed
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [visible]);
  
  // Animation management
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      // Animate in
      translateYAnim.setValue(position === 'bottom' ? 50 : position === 'top' ? -50 : 20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animateTransition ? animationDuration : 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: animateTransition ? animationDuration : 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animateTransition ? animationDuration : 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: position === 'bottom' ? 50 : position === 'top' ? -50 : 20,
          duration: animateTransition ? animationDuration : 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, fadeAnim, translateYAnim, animateTransition, animationDuration, position]);
  
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
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (!isRendered) {
    return null;
  }

  return (
    <Portal>
      <View
        style={[
          styles.container,
          { 
            backgroundColor: backdropColor,
            // Web-specific transition
            transition: animateTransition ? `background-color ${animationDuration}ms ease-in-out` : 'none',
          },
          containerStyle,
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
          accessibilityLabel="Modal backdrop"
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
            // Prevent clicks on content from closing modal
            onClick={(e) => e.stopPropagation()}
          >
            <View
              style={[
                contentPadding && styles.contentPadding,
                fullScreen && styles.fullScreenContent,
              ]}
            >
              {renderHeader()}
              {children}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
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
    height: '100%',
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