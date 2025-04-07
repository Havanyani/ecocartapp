/**
 * Mock implementation for @tensorflow/tfjs-react-native
 * This prevents errors when running in web mode
 */

console.log('[MOCK TENSORFLOW] Loading tensorflow-react-native mock module');

// Mock the camera interface
const cameraWithTensors = () => {
  console.log('[MOCK TENSORFLOW] cameraWithTensors called');
  return {
    tensor: null,
    elementWidth: 0,
    elementHeight: 0
  };
};

// Mock detection interface
const detectObjects = async () => {
  console.log('[MOCK TENSORFLOW] detectObjects called');
  return [
    { 
      bbox: [0, 0, 0, 0],
      class: 'mock-object',
      score: 0.95
    }
  ];
};

// Mock tensor operations
const decodeJpeg = (data) => {
  console.log('[MOCK TENSORFLOW] decodeJpeg called');
  return {
    shape: [1, 1, 3],
    dtype: 'float32',
    dataId: {},
    id: 0,
    rankType: '3'
  };
};

// Export mock functions
export default {
  cameraWithTensors,
  decodeJpeg,
  detectObjects,
  ready: true,
  tf: {
    ready: () => Promise.resolve(true),
    loadGraphModel: () => ({
      predict: () => ({ data: () => Promise.resolve([]) })
    })
  }
}; 