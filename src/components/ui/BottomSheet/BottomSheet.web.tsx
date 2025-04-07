/**
 * BottomSheet.web.tsx
 * 
 * Web-specific implementation of the BottomSheet component.
 * Uses React portals for rendering outside the component hierarchy and CSS transitions for animations.
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import type { BottomSheetProps } from './BottomSheet';

// Constants
const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

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
  enableBottomSafeArea = false, // Not relevant for web
  onDragStart,
  onDragEnd,
}: BottomSheetProps): JSX.Element | null {
  const { theme } = useTheme();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
  const [contentHeight, setContentHeight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const sheetRef = useRef<View>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  // Calculate snap points in pixels
  const calculatedSnapPoints = snapPoints.map(point => {
    if (typeof point === 'number') {
      return point;
    } else if (point === 'content') {
      // Will be adjusted after measuring content
      return contentHeight > 0 ? contentHeight + (showHandle ? 20 : 0) : SCREEN_HEIGHT / 2;
    } else if (typeof point === 'string' && point.endsWith('%')) {
      const percentage = parseInt(point, 10) / 100;
      return SCREEN_HEIGHT * percentage;
    }
    return SCREEN_HEIGHT / 2; // Default to 50% if invalid
  });

  // Create portal container on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      let element = document.getElementById('bottom-sheet-portal');
      
      if (!element) {
        element = document.createElement('div');
        element.id = 'bottom-sheet-portal';
        document.body.appendChild(element);
      }
      
      setPortalElement(element);
      setMounted(true);
      
      return () => {
        // Only remove if we created it and there are no other sheets
        if (element.childNodes.length === 0) {
          document.body.removeChild(element);
        }
      };
    }
  }, []);

  // Handle escape key press
  useEffect(() => {
    if (isVisible) {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isVisible, onClose]);

  // Handle click outside to close
  useEffect(() => {
    if (isVisible && closeOnBackdropPress) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          sheetRef.current &&
          event.target instanceof Node &&
          !sheetRef.current.contains(event.target) &&
          !isDraggingRef.current
        ) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, closeOnBackdropPress, onClose]);

  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isVisible) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isVisible]);

  // Handle content measurement
  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  // Handle switch between snap points
  const changePosition = (index: number) => {
    if (index < 0 || index >= calculatedSnapPoints.length) return;
    
    setCurrentSnapIndex(index);
    onPositionChange?.(index);
    
    if (sheetRef.current) {
      const sheetElement = sheetRef.current as unknown as HTMLElement;
      const height = calculatedSnapPoints[index];
      
      sheetElement.style.height = `${height}px`;
      sheetElement.style.transition = `height ${animationDuration}ms ease-in-out`;
    }
  };

  // Handle drag start event
  const handleDragStart = (event: React.TouchEvent | React.MouseEvent) => {
    if (!enableDrag) return;
    
    isDraggingRef.current = true;
    onDragStart?.();
    
    if ('touches' in event) {
      startYRef.current = event.touches[0].clientY;
    } else {
      startYRef.current = event.clientY;
      
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e);
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        handleDragEnd(e);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Handle drag move event
  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    let clientY;
    if ('touches' in event) {
      clientY = event.touches[0].clientY;
    } else {
      clientY = (event as MouseEvent).clientY;
    }
    
    currentYRef.current = clientY;
    
    if (sheetRef.current) {
      const sheetElement = sheetRef.current as unknown as HTMLElement;
      const deltaY = clientY - startYRef.current;
      
      // Calculate current height based on snap point and delta
      const currentSnapPoint = calculatedSnapPoints[currentSnapIndex];
      let newHeight = currentSnapPoint - deltaY;
      
      // Constrain height between min and max snap points
      const minHeight = calculatedSnapPoints[0];
      const maxHeight = calculatedSnapPoints[calculatedSnapPoints.length - 1];
      
      if (newHeight < minHeight * 0.5) {
        // If dragged below 50% of min height, prepare to close
        newHeight = minHeight * 0.5;
      } else if (newHeight > maxHeight && !expandToFullscreen) {
        // If above max height and not allowed to expand, cap at max
        newHeight = maxHeight;
      }
      
      // Apply the height without transition for smooth dragging
      sheetElement.style.transition = 'none';
      sheetElement.style.height = `${newHeight}px`;
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    onDragEnd?.();
    
    let clientY;
    if ('touches' in event) {
      clientY = (event as TouchEvent).changedTouches[0].clientY;
    } else {
      clientY = (event as MouseEvent).clientY;
    }
    
    const deltaY = clientY - startYRef.current;
    const velocity = Math.abs(deltaY) / 100; // Simple velocity calculation
    
    // Determine if user is flicking the sheet
    const isFlicking = velocity > 0.5;
    
    if (isFlicking) {
      if (deltaY > 0) {
        // Flicking down
        if (currentSnapIndex === 0) {
          onClose();
        } else {
          changePosition(currentSnapIndex - 1);
        }
      } else {
        // Flicking up
        if (currentSnapIndex < calculatedSnapPoints.length - 1) {
          changePosition(currentSnapIndex + 1);
        }
      }
    } else {
      // Find closest snap point based on current position
      if (sheetRef.current) {
        const sheetElement = sheetRef.current as unknown as HTMLElement;
        const currentHeight = parseFloat(sheetElement.style.height);
        
        // Calculate distance to each snap point and find closest
        const distances = calculatedSnapPoints.map((snapPoint, index) => ({
          distance: Math.abs(currentHeight - snapPoint),
          index,
        }));
        
        distances.sort((a, b) => a.distance - b.distance);
        
        // If very close to minimum and dragging down, close the sheet
        if (
          deltaY > 50 && 
          distances[0].index === 0 && 
          currentHeight < calculatedSnapPoints[0] * 0.8
        ) {
          onClose();
        } else {
          changePosition(distances[0].index);
        }
      }
    }
  };

  // Handle touch events for mobile web
  const touchHandlers = enableDrag
    ? {
        onTouchStart: handleDragStart,
        onTouchMove: handleDragMove as any,
        onTouchEnd: handleDragEnd as any,
      }
    : {};

  // Determine if sheet is in fullscreen mode
  const isFullScreen = expandToFullscreen && currentSnapIndex === calculatedSnapPoints.length - 1;

  // Set initial height on first render
  useEffect(() => {
    if (isVisible && sheetRef.current) {
      const sheetElement = sheetRef.current as unknown as HTMLElement;
      const initialHeight = calculatedSnapPoints[initialSnapIndex];
      
      // Set initial height with animation only if animateOnOpen is true
      sheetElement.style.transition = animateOnOpen
        ? `height ${animationDuration}ms ease-in-out`
        : 'none';
      sheetElement.style.height = `${initialHeight}px`;
    }
  }, [isVisible, calculatedSnapPoints, initialSnapIndex, animateOnOpen, animationDuration]);

  // Don't render if not visible or not mounted
  if (!isVisible || !mounted || !portalElement) {
    return null;
  }

  const content = (
    <View 
      style={[
        styles.overlay,
        { backgroundColor: showBackdrop ? backdropColor : 'transparent' },
      ]}
      data-testid={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View
        ref={sheetRef}
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: rounded && !isFullScreen ? borderRadius : 0,
            borderTopRightRadius: rounded && !isFullScreen ? borderRadius : 0,
            ...(isFullScreen ? styles.fullScreenSheet : {}),
          },
          containerStyle,
        ]}
        onMouseDown={enableDrag ? handleDragStart : undefined}
        {...touchHandlers}
      >
        {/* Sheet Handle */}
        {showHandle && !isFullScreen && (
          <View style={styles.handleContainer}>
            <View 
              style={[
                styles.handle, 
                { backgroundColor: theme.colors.border }
              ]} 
            />
          </View>
        )}
        
        {/* Header with Title and Close Button */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            {title && (
              <Text 
                style={[
                  styles.title, 
                  { color: theme.colors.text }
                ]}
              >
                {title}
              </Text>
            )}
            
            {showCloseButton && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text 
                  style={[
                    styles.closeButtonText, 
                    { color: theme.colors.text }
                  ]}
                >
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
      </View>
    </View>
  );

  return ReactDOM.createPortal(content, portalElement);
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: '600px', // More reasonable max width for web
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  fullScreenSheet: {
    height: '100%',
    maxWidth: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  handleContainer: {
    width: '100%',
    height: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'grab',
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
    cursor: 'pointer',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflowY: 'auto',
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
}); 