import { Image } from 'expo-image';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './IconSymbol';

interface MediaViewerProps {
  images: string[];
  onClose: () => void;
}

export function MediaViewer({ images, onClose }: MediaViewerProps) {
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <IconSymbol name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.image}
            contentFit="contain"
          />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 