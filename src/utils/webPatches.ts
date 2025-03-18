/**
 * Web-specific patches and polyfills for React Native components
 * This file should be imported early in the app initialization process
 */

import { Platform } from 'react-native';

// Define DOM types missing in React Native environment
type EventListenerOrEventListenerObject = EventListener | EventListenerObject;
type EventListener = (evt: Event) => void;
interface EventListenerObject {
  handleEvent(evt: Event): void;
}
interface AddEventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}

// Define global Window type
declare global {
  interface Window {
    hasTouchableProperty?: () => boolean;
    ReactNativeSVG?: {
      enableTouchEvents?: () => void;
    };
  }
}

/**
 * Apply web-specific patches to fix compatibility issues
 */
export function applyWebPatches() {
  if (Platform.OS !== 'web') {
    return; // Only apply patches on web platform
  }

  try {
    // Check if window exists (it should on web)
    if (typeof window === 'undefined') {
      console.warn('Web patches: window is undefined, skipping patches');
      return;
    }

    // Fix SVG touchable elements by defining the hasTouchableProperty function
    // This function is used by react-native-svg to determine if a component supports touch events

    // Define the hasTouchableProperty function globally
    window.hasTouchableProperty = () => false;

    // Enable SVG touch events if ReactNativeSVG is available
    if (
      window.ReactNativeSVG &&
      typeof window.ReactNativeSVG.enableTouchEvents === 'function'
    ) {
      window.ReactNativeSVG.enableTouchEvents();
    }

    // Store original addEventListener
    const originalAddEventListener = window.addEventListener;

    // Patch addEventListener to handle errors gracefully
    window.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      try {
        originalAddEventListener.call(window, type, listener, options);
      } catch (err) {
        console.warn(
          `Web patch: Error adding event listener for ${type}:`,
          err,
        );
      }
    };

    console.log('Web patches applied successfully');
  } catch (error) {
    console.error('Failed to apply web patches:', error);
  }
}
