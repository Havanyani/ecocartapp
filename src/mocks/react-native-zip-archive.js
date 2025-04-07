/**
 * Web-specific mock for react-native-zip-archive
 * Provides stubs for zip functionality that won't be available in browser
 */

// Mock event emitter for compatibility
const mockEventEmitter = {
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
};

// Mock zip functions
const unzip = (source, target) => {
  console.warn('Zip operations not supported in web environment: attempted to unzip', { source, target });
  return Promise.resolve(target);
};

const unzipWithPassword = (source, target, password) => {
  console.warn('Zip operations not supported in web environment: attempted to unzip with password', { 
    source, target, password 
  });
  return Promise.resolve(target);
};

const zipFiles = (source, files, target) => {
  console.warn('Zip operations not supported in web environment: attempted to zip files', { 
    source, files, target 
  });
  return Promise.resolve(target);
};

const zipFolder = (folder, target) => {
  console.warn('Zip operations not supported in web environment: attempted to zip folder', { folder, target });
  return Promise.resolve(target);
};

// Export mock API
export default {
  unzip,
  unzipWithPassword,
  zipFiles,
  zipFolder,
  subscribe: () => ({ remove: () => {} }),
  addEventListener: () => ({ remove: () => {} }),
  getUnzipProgress: () => Promise.resolve(0),
  isPasswordProtected: () => Promise.resolve(false),
  // Add any other methods used in your app
};

// Export named exports for compatibility
export {
    mockEventEmitter as events, unzip,
    unzipWithPassword,
    zipFiles,
    zipFolder
};
