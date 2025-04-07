/**
 * Cross-platform Sharing API
 * Provides a unified interface for sharing functionality across platforms
 */

import { Platform, Share as ReactNativeShare } from 'react-native';

// Define types
interface SharingInterface {
  isAvailableAsync: () => Promise<boolean>;
  shareAsync: (url: string, options?: any) => Promise<any>;
  share: (content: { title?: string; message?: string; url?: string }) => Promise<any>;
}

// Web implementation using Web Share API when available
const WebSharing: SharingInterface = {
  isAvailableAsync: async () => {
    return typeof navigator !== 'undefined' && !!navigator.share;
  },
  
  shareAsync: async (url: string, options: any = {}) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: options.dialogTitle || 'Share Content',
          text: options.mimeType ? `Shared ${options.mimeType} file` : 'Shared content',
          url: url,
        });
        return { action: 'SHARED' };
      } else {
        console.warn('[Web Sharing] Web Share API not available');
        // Fallback to simple alert
        alert(`Share URL: ${url}\n\nThe Web Share API is not available in this browser.`);
        return { action: 'DISMISSED' };
      }
    } catch (error) {
      console.error('[Web Sharing] Error:', error);
      throw error;
    }
  },
  
  share: async (content: { title?: string; message?: string; url?: string }) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: content.title,
          text: content.message,
          url: content.url,
        });
        return { action: 'SHARED' };
      } else {
        console.warn('[Web Sharing] Web Share API not available');
        // Fallback to simple alert
        alert(`Share: ${content.title || ''}\n${content.message || ''}\n${content.url || ''}\n\nThe Web Share API is not available in this browser.`);
        return { action: 'DISMISSED' };
      }
    } catch (error) {
      console.error('[Web Sharing] Error:', error);
      return { action: 'DISMISSED', error };
    }
  }
};

// Export the appropriate implementation based on platform
let Sharing: SharingInterface;

if (Platform.OS === 'web') {
  console.log('[Sharing] Using web implementation');
  Sharing = WebSharing;
} else {
  try {
    // For native platforms, merge expo-sharing with react-native Share
    const ExpoSharing = require('expo-sharing');
    
    // Merge the implementations
    Sharing = {
      isAvailableAsync: ExpoSharing.isAvailableAsync,
      shareAsync: ExpoSharing.shareAsync,
      share: ReactNativeShare.share,
    };
    
    console.log('[Sharing] Using native implementation');
  } catch (error) {
    console.warn('[Sharing] Failed to load native module, falling back to web implementation:', error);
    Sharing = {
      ...WebSharing,
      share: ReactNativeShare.share,
    };
  }
}

export default Sharing; 