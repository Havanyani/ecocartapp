/**
 * Web-specific mock for expo-file-system
 * Provides stubs for file system operations not available in web
 */

// Mock FileSystem API with localStorage-based implementation where possible
const documentDirectory = 'file://document-directory/';
const cacheDirectory = 'file://cache-directory/';

// Mock storage using localStorage
const mockStorage = {
  // Use localStorage with prefixes to simulate directories
  setItem: (path, data) => {
    try {
      const key = `expo-fs:${path}`;
      localStorage.setItem(key, data);
      return true;
    } catch (e) {
      console.warn('Failed to write to mock FileSystem:', e);
      return false;
    }
  },
  
  getItem: (path) => {
    try {
      const key = `expo-fs:${path}`;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Failed to read from mock FileSystem:', e);
      return null;
    }
  },
  
  removeItem: (path) => {
    try {
      const key = `expo-fs:${path}`;
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Failed to delete from mock FileSystem:', e);
      return false;
    }
  }
};

// Mock file info
const fileInfoCache = {};

// Mock functions
const writeAsStringAsync = (path, data) => {
  console.log('Mock FileSystem: writeAsStringAsync', { path, dataLength: data?.length });
  mockStorage.setItem(path, data);
  fileInfoCache[path] = {
    exists: true,
    isDirectory: false,
    size: data?.length || 0,
    modificationTime: Date.now() / 1000,
    uri: path
  };
  return Promise.resolve();
};

const readAsStringAsync = (path) => {
  console.log('Mock FileSystem: readAsStringAsync', { path });
  const data = mockStorage.getItem(path);
  if (data === null) {
    return Promise.reject(new Error(`File not found: ${path}`));
  }
  return Promise.resolve(data);
};

const deleteAsync = (path, options) => {
  console.log('Mock FileSystem: deleteAsync', { path, options });
  mockStorage.removeItem(path);
  delete fileInfoCache[path];
  return Promise.resolve();
};

const getInfoAsync = (path, options) => {
  console.log('Mock FileSystem: getInfoAsync', { path, options });
  
  if (fileInfoCache[path]) {
    return Promise.resolve(fileInfoCache[path]);
  }
  
  // Default values for non-existent files
  return Promise.resolve({
    exists: false,
    isDirectory: false,
    size: 0,
    modificationTime: 0,
    uri: path
  });
};

const makeDirectoryAsync = (path) => {
  console.log('Mock FileSystem: makeDirectoryAsync', { path });
  fileInfoCache[path] = {
    exists: true,
    isDirectory: true,
    size: 0,
    modificationTime: Date.now() / 1000,
    uri: path
  };
  return Promise.resolve();
};

const readDirectoryAsync = (path) => {
  console.log('Mock FileSystem: readDirectoryAsync', { path });
  // This is a simplified implementation - would need more complex logic
  // to properly simulate directories
  return Promise.resolve([]);
};

const moveAsync = (options) => {
  const { from, to } = options;
  console.log('Mock FileSystem: moveAsync', { from, to });
  const data = mockStorage.getItem(from);
  if (data === null) {
    return Promise.reject(new Error(`File not found: ${from}`));
  }
  mockStorage.setItem(to, data);
  mockStorage.removeItem(from);
  
  if (fileInfoCache[from]) {
    fileInfoCache[to] = { ...fileInfoCache[from], uri: to };
    delete fileInfoCache[from];
  }
  
  return Promise.resolve();
};

const copyAsync = (options) => {
  const { from, to } = options;
  console.log('Mock FileSystem: copyAsync', { from, to });
  const data = mockStorage.getItem(from);
  if (data === null) {
    return Promise.reject(new Error(`File not found: ${from}`));
  }
  mockStorage.setItem(to, data);
  
  if (fileInfoCache[from]) {
    fileInfoCache[to] = { ...fileInfoCache[from], uri: to };
  }
  
  return Promise.resolve();
};

// Export the mock API
export default {
  documentDirectory,
  cacheDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  moveAsync,
  copyAsync,
  // Add other methods as needed
  createDownloadResumable: () => ({
    downloadAsync: () => Promise.resolve({ uri: 'mock-uri' }),
    pauseAsync: () => Promise.resolve(),
    resumeAsync: () => Promise.resolve({ uri: 'mock-uri' }),
    savable: () => ({ url: 'mock-url', fileUri: 'mock-uri', options: {} })
  }),
  downloadAsync: () => Promise.resolve({ uri: 'mock-uri', status: 200 }),
  uploadAsync: () => Promise.resolve({ status: 200 }),
}; 