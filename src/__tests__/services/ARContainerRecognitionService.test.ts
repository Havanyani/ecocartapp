import { ARContainerRecognitionService } from '@/services/ARContainerRecognitionService';
import { ContainerType, DetectionResult } from '@/types/ar';
import * as tf from '@tensorflow/tfjs';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
  tensor3d: jest.fn(),
  dispose: jest.fn(),
}));

// Mock COCO-SSD model
jest.mock('@tensorflow-models/coco-ssd', () => ({
  load: jest.fn().mockResolvedValue({
    detect: jest.fn().mockResolvedValue([
      { class: 'bottle', score: 0.92, bbox: [10, 20, 100, 200] },
      { class: 'cup', score: 0.85, bbox: [50, 60, 80, 120] },
      { class: 'person', score: 0.95, bbox: [200, 300, 150, 250] },
    ]),
  }),
}));

describe('ARContainerRecognitionService', () => {
  let service: ARContainerRecognitionService;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get service instance
    service = ARContainerRecognitionService.getInstance();
  });
  
  afterEach(() => {
    // Clean up
    service.dispose();
  });
  
  describe('initialization', () => {
    it('should initialize and load models', async () => {
      // The service initializes in constructor, so just verify it's ready
      expect(await service.isReady()).toBe(true);
      
      // Verify TensorFlow was initialized
      expect(tf.ready).toHaveBeenCalled();
    });
    
    it('should configure with custom settings', () => {
      // Configure with custom settings
      service.configure({
        threshold: 0.85,
        maxDetections: 3,
      });
      
      // No direct way to test the configuration was applied
      // But we can test it indirectly in other methods
      // This test just verifies the method doesn't throw
      expect(() => {
        service.configure({
          threshold: 0.85,
          maxDetections: 3,
        });
      }).not.toThrow();
    });
  });
  
  describe('object detection', () => {
    it('should detect objects in image tensor', async () => {
      // Mock tensor
      const mockTensor = {} as tf.Tensor3D;
      
      // Detect objects
      const results = await service.detectObjects(mockTensor);
      
      // Should return filtered results based on threshold
      expect(results).toHaveLength(2); // Person should be filtered out
      expect(results[0].class).toBe('bottle');
      expect(results[0].score).toBe(0.92);
      expect(results[1].class).toBe('cup');
      expect(results[1].score).toBe(0.85);
    });
  });
  
  describe('container recognition', () => {
    it('should recognize containers from detection results', () => {
      // Mock detection results
      const detections: DetectionResult[] = [
        { class: 'bottle', score: 0.92, bbox: [10, 20, 100, 200] },
        { class: 'can', score: 0.88, bbox: [30, 40, 60, 90] },
        { class: 'book', score: 0.90, bbox: [50, 60, 70, 80] }, // Not a container
      ];
      
      // Recognize containers
      const containers = service.recognizeContainers(detections);
      
      // Should identify containers correctly
      expect(containers).toHaveLength(2); // Only bottle and can
      
      // Check first container (bottle)
      expect(containers[0].type).toBe(ContainerType.PLASTIC_BOTTLE);
      expect(containers[0].confidence).toBe(0.92);
      
      // Check second container (can)
      expect(containers[1].type).toBe(ContainerType.ALUMINUM_CAN);
      expect(containers[1].confidence).toBe(0.88);
    });
    
    it('should handle empty detection results', () => {
      const containers = service.recognizeContainers([]);
      expect(containers).toHaveLength(0);
    });
    
    it('should handle detection results with no containers', () => {
      const detections: DetectionResult[] = [
        { class: 'chair', score: 0.93, bbox: [10, 20, 100, 200] },
        { class: 'book', score: 0.88, bbox: [30, 40, 60, 90] },
      ];
      
      const containers = service.recognizeContainers(detections);
      expect(containers).toHaveLength(0);
    });
  });
  
  describe('environmental impact calculation', () => {
    it('should calculate environmental impact of recycled containers', () => {
      // Create a mock container
      const mockContainer = {
        id: 'test-container-1',
        type: ContainerType.PLASTIC_BOTTLE,
        confidence: 0.92,
        dimensions: {
          width: 100,
          height: 200,
        },
        estimatedCapacity: 0.5, // 500ml
        estimatedWeight: 15, // 15g
        timestamp: Date.now(),
      };
      
      // Calculate impact
      const impact = service.calculateEnvironmentalImpact(mockContainer);
      
      // Verify impact was calculated
      expect(impact).toBeDefined();
      expect(impact.carbonFootprintSaved).toBeGreaterThan(0);
      expect(impact.waterSaved).toBeGreaterThan(0);
      expect(impact.energySaved).toBeGreaterThan(0);
      expect(impact.landfillSpaceSaved).toBeGreaterThan(0);
    });
  });
}); 