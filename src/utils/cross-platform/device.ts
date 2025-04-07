/**
 * Cross-platform Device API
 * Provides a unified interface for device information across platforms
 */

import { Platform } from 'react-native';

// Define device types to match expo-device
export enum DeviceType {
  UNKNOWN = 0,
  PHONE = 1,
  TABLET = 2,
  DESKTOP = 3,
  TV = 4,
}

// Define our interface
interface DeviceInterface {
  isDevice: boolean;
  brand: string | null;
  manufacturer: string | null;
  modelName: string | null;
  deviceYearClass: number | null;
  totalMemory: number | null;
  supportedCpuArchitectures: string[] | null;
  osName: string | null;
  osVersion: string | null;
  osBuildId: string | null;
  osInternalBuildId: string | null;
  deviceName: string | null;
  getDeviceTypeAsync: () => Promise<DeviceType>;
  getUptimeAsync: () => Promise<number>;
  getMaxMemoryAsync: () => Promise<number>;
  isRootedExperimentalAsync: () => Promise<boolean>;
  isSideLoadingEnabledAsync: () => Promise<boolean>;
  getPlatformFeaturesAsync: () => Promise<string[]>;
  hasPlatformFeatureAsync: (feature: string) => Promise<boolean>;
}

// Web implementation
const WebDevice: DeviceInterface = {
  isDevice: false,
  brand: null,
  manufacturer: null,
  modelName: null,
  deviceYearClass: null,
  totalMemory: null,
  supportedCpuArchitectures: null,
  osName: 'Web',
  osVersion: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  osBuildId: null,
  osInternalBuildId: null,
  deviceName: typeof navigator !== 'undefined' ? navigator.platform || 'Web Browser' : null,

  getDeviceTypeAsync: async () => {
    // Basic detection for device type on web
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
      // Check if device is likely a mobile phone
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // More specific check for tablets
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) || 
                      (window.innerWidth > 768 && window.innerHeight > 768 && isMobile);
      
      if (isTablet) return DeviceType.TABLET;
      if (isMobile) return DeviceType.PHONE;
      return DeviceType.DESKTOP;
    }
    return DeviceType.UNKNOWN;
  },

  getUptimeAsync: async () => {
    return 0; // Not available on web
  },

  getMaxMemoryAsync: async () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return (performance.memory as any).jsHeapSizeLimit || 0;
    }
    return 0;
  },

  isRootedExperimentalAsync: async () => {
    return false; // Not applicable on web
  },

  isSideLoadingEnabledAsync: async () => {
    return false; // Not applicable on web
  },

  getPlatformFeaturesAsync: async () => {
    // Return a list of web platform features
    const features = [];
    
    if (typeof window !== 'undefined') {
      if ('localStorage' in window) features.push('localStorage');
      if ('sessionStorage' in window) features.push('sessionStorage');
      if ('indexedDB' in window) features.push('indexedDB');
      if ('serviceWorker' in navigator) features.push('serviceWorker');
      if ('share' in navigator) features.push('webShare');
      if ('geolocation' in navigator) features.push('geolocation');
      if ('Notification' in window) features.push('notifications');
    }
    
    return features;
  },

  hasPlatformFeatureAsync: async (feature: string) => {
    const features = await WebDevice.getPlatformFeaturesAsync();
    return features.includes(feature);
  }
};

// Export the appropriate implementation based on platform
let Device: DeviceInterface;

if (Platform.OS === 'web') {
  console.log('[Device] Using web implementation');
  Device = WebDevice;
} else {
  try {
    // For native platforms, use the real module
    const ExpoDevice = require('expo-device');
    console.log('[Device] Using native implementation');
    Device = ExpoDevice;
  } catch (error) {
    console.warn('[Device] Failed to load native module, falling back to web implementation:', error);
    Device = WebDevice;
  }
}

export default Device; 