// Mock implementation for @shopify/react-native-skia
import React from 'react';
import { View } from 'react-native';

// Basic mock implementation that renders nothing
const EmptyComponent = () => null;

// Create a mock for all components in the library
export const Canvas = (props) => <View {...props} />;
export const Group = EmptyComponent;
export const Rect = EmptyComponent;
export const RoundedRect = EmptyComponent;
export const Circle = EmptyComponent;
export const Path = EmptyComponent;
export const Line = EmptyComponent;
export const Text = EmptyComponent;
export const SkFont = {};
export const Skia = {
  Font: () => ({}),
  Path: () => ({}),
  Paint: () => ({}),
};

// Additional exports for common uses
export const useValue = (initialValue) => ({
  current: initialValue,
  addListener: () => {},
  removeListener: () => {},
});

export const useComputedValue = (callback, dependencies) => ({
  current: null,
});

export const createPaint = () => ({});
export const useFont = () => null;
export const useImage = () => null;
export const loadFont = () => Promise.resolve(null);
export const loadImage = () => Promise.resolve(null); 