/**
 * Cross-platform FileSystem API
 * Provides a unified interface for file operations across platforms
 */

import { Platform } from 'react-native';

// Define types
interface FileSystemInterface {
  documentDirectory: string;
  cacheDirectory?: string;
  writeAsStringAsync: (path: string, content: string) => Promise<void>;
  readAsStringAsync: (path: string) => Promise<string>;
  deleteAsync: (path: string) => Promise<void>;
  getInfoAsync: (path: string) => Promise<{ exists: boolean; uri: string; isDirectory?: boolean }>;
  makeDirectoryAsync: (path: string) => Promise<void>;
}

// Define web implementations using localStorage
const WebFileSystem: FileSystemInterface = {
  documentDirectory: 'file://document-directory/',
  
  writeAsStringAsync: async (path: string, content: string) => {
    try {
      const key = `expo-fs:${path}`;
      localStorage.setItem(key, content);
      console.log(`[Web FileSystem] Wrote data to ${key}`);
    } catch (error) {
      console.error('[Web FileSystem] Write error:', error);
      throw error;
    }
  },
  
  readAsStringAsync: async (path: string) => {
    try {
      const key = `expo-fs:${path}`;
      const data = localStorage.getItem(key);
      if (data === null) {
        throw new Error(`[Web FileSystem] File not found: ${path}`);
      }
      return data;
    } catch (error) {
      console.error('[Web FileSystem] Read error:', error);
      throw error;
    }
  },
  
  deleteAsync: async (path: string) => {
    try {
      const key = `expo-fs:${path}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[Web FileSystem] Delete error:', error);
      throw error;
    }
  },
  
  getInfoAsync: async (path: string) => {
    try {
      const key = `expo-fs:${path}`;
      const exists = localStorage.getItem(key) !== null;
      // For web, we'll determine if it's a directory by checking if the path has a file extension
      const isDirectory = path.indexOf('.') === -1;
      return { exists, uri: path, isDirectory };
    } catch (error) {
      console.error('[Web FileSystem] GetInfo error:', error);
      throw error;
    }
  },
  
  makeDirectoryAsync: async (path: string) => {
    // Directories don't exist in localStorage, so this is a no-op
    console.log(`[Web FileSystem] Created virtual directory: ${path}`);
  }
};

// Export the appropriate implementation based on platform
let FileSystem: FileSystemInterface;

if (Platform.OS === 'web') {
  console.log('[FileSystem] Using web implementation');
  FileSystem = WebFileSystem;
} else {
  try {
    // For native platforms, use the real module
    const ExpoFileSystem = require('expo-file-system');
    console.log('[FileSystem] Using native implementation');
    FileSystem = ExpoFileSystem;
  } catch (error) {
    console.warn('[FileSystem] Failed to load native module, falling back to web implementation:', error);
    FileSystem = WebFileSystem;
  }
}

export default FileSystem; 