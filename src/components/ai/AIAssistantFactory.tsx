import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AIAssistantChat, AIAssistantChatProps } from './AIAssistantChat';

/**
 * Display modes for the AI Assistant
 */
export enum AIAssistantDisplayMode {
  /** Full screen modal */
  MODAL = 'modal',
  /** Embedded in the current view */
  EMBEDDED = 'embedded',
  /** Floating bubble with expandable chat */
  FLOATING = 'floating',
  /** Minimalist quick action bar */
  QUICK_ACTION = 'quick_action'
}

export interface AIAssistantFactoryProps extends Omit<AIAssistantChatProps, 'onClose'> {
  /** Display mode for the assistant */
  mode: AIAssistantDisplayMode;
  /** Whether the assistant is visible (for modal and floating modes) */
  visible?: boolean;
  /** Function to call when the assistant is closed */
  onClose?: () => void;
  /** Style for the container */
  containerStyle?: StyleProp<ViewStyle>;
  /** Icon to use for the floating button (Ionicons name) */
  floatingButtonIcon?: string;
  /** Whether to show the floating button */
  showFloatingButton?: boolean;
  /** Position of the floating button */
  floatingButtonPosition?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

/**
 * Factory component that creates different variants of the AI Assistant UI
 * based on the specified mode.
 */
export function AIAssistantFactory({
  mode,
  visible = true,
  onClose,
  containerStyle,
  floatingButtonIcon = 'chatbubble-ellipses',
  showFloatingButton = true,
  floatingButtonPosition = 'bottomRight',
  ...chatProps
}: AIAssistantFactoryProps) {
  const theme = useTheme()()();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle the floating button being pressed
  const handleFloatingButtonPress = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Handle closing the assistant
  const handleClose = () => {
    setIsExpanded(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Render the floating button
  const renderFloatingButton = () => {
    if (!showFloatingButton) return null;
    
    // Determine position style
    let positionStyle: ViewStyle = {};
    switch (floatingButtonPosition) {
      case 'bottomLeft':
        positionStyle = { bottom: 20, left: 20 };
        break;
      case 'topRight':
        positionStyle = { top: 20, right: 20 };
        break;
      case 'topLeft':
        positionStyle = { top: 20, left: 20 };
        break;
      case 'bottomRight':
      default:
        positionStyle = { bottom: 20, right: 20 };
        break;
    }
    
    return (
      <TouchableOpacity
        style={[styles.floatingButton, positionStyle, { backgroundColor: theme.colors.primary }]}
        onPress={handleFloatingButtonPress}
        accessibilityLabel="Open AI Assistant"
        accessibilityRole="button"
      >
        <Ionicons name={floatingButtonIcon} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };
  
  // Render different modes
  switch (mode) {
    case AIAssistantDisplayMode.MODAL:
      return (
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleClose}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, containerStyle]}>
              <AIAssistantChat {...chatProps} showHeader={true} onClose={handleClose} />
            </View>
          </View>
        </Modal>
      );
      
    case AIAssistantDisplayMode.EMBEDDED:
      return (
        <View style={[styles.embeddedContainer, containerStyle]}>
          <AIAssistantChat {...chatProps} showHeader={false} />
        </View>
      );
      
    case AIAssistantDisplayMode.FLOATING:
      return (
        <>
          {renderFloatingButton()}
          
          {isExpanded && (
            <View style={styles.floatingChatContainer}>
              <View style={[styles.floatingChat, containerStyle]}>
                <AIAssistantChat 
                  {...chatProps} 
                  showHeader={true} 
                  maxHeight={400} 
                  onClose={handleClose}
                />
              </View>
            </View>
          )}
        </>
      );
      
    case AIAssistantDisplayMode.QUICK_ACTION:
      return (
        <View style={[styles.quickActionContainer, containerStyle]}>
          <AIAssistantChat 
            {...chatProps} 
            showHeader={false} 
            maxHeight={150}
          />
        </View>
      );
      
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  embeddedContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  floatingChatContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 999,
  },
  floatingChat: {
    width: 300,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
    maxHeight: 150,
  },
}); 