import * as cocossd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { v4 as uuidv4 } from 'uuid';

import {
    ContainerType,
    DetectionResult,
    ModelType,
    RecognitionModelConfig,
    RecognizedContainer
} from '@/types/ar';

const DEFAULT_CONFIG: RecognitionModelConfig = {
  modelType: ModelType.COCO_SSD,
  threshold: 0.7,
  enableMultipleDetections: true,
  maxDetections: 5
};

/**
 * Service for handling AR container recognition using TensorFlow.js
 */
export class ARContainerRecognitionService {
  private static instance: ARContainerRecognitionService;
  private cocossdModel: cocossd.ObjectDetection | null = null;
  private isModelLoading = false;
  private config: RecognitionModelConfig = DEFAULT_CONFIG;
  private isTfReady = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Gets the singleton instance of the ARContainerRecognitionService
   */
  public static getInstance(): ARContainerRecognitionService {
    if (!ARContainerRecognitionService.instance) {
      ARContainerRecognitionService.instance = new ARContainerRecognitionService();
    }
    return ARContainerRecognitionService.instance;
  }

  /**
   * Initialize TensorFlow and load models
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize TensorFlow.js
      await tf.ready();
      this.isTfReady = true;
      console.log('TensorFlow.js is ready');
      
      // Load the COCO-SSD model
      await this.loadModel();
    } catch (error) {
      console.error('Failed to initialize AR Container Recognition Service:', error);
      throw error;
    }
  }

  /**
   * Load the object detection model
   */
  private async loadModel(): Promise<void> {
    if (this.cocossdModel || this.isModelLoading) {
      return;
    }

    try {
      this.isModelLoading = true;
      
      // Load the COCO-SSD model
      this.cocossdModel = await cocossd.load({
        base: 'lite_mobilenet_v2', // Use lighter model for mobile devices
      });
      
      console.log('COCO-SSD model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    } finally {
      this.isModelLoading = false;
    }
  }

  /**
   * Configure the recognition service
   */
  public configure(config: Partial<RecognitionModelConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Detect objects in the provided image tensor
   */
  public async detectObjects(imageTensor: tf.Tensor3D): Promise<DetectionResult[]> {
    if (!this.cocossdModel) {
      await this.loadModel();
    }

    if (!this.cocossdModel) {
      throw new Error('Model is not loaded yet');
    }

    try {
      // Detect objects in the image
      const predictions = await this.cocossdModel.detect(imageTensor);
      
      // Filter predictions based on confidence threshold
      return predictions
        .filter(prediction => prediction.score >= this.config.threshold)
        .map(prediction => ({
          class: prediction.class,
          score: prediction.score,
          bbox: prediction.bbox as [number, number, number, number]
        }))
        .slice(0, this.config.maxDetections);
    } catch (error) {
      console.error('Error during object detection:', error);
      throw error;
    }
  }

  /**
   * Recognizes recycling containers from detection results
   */
  public recognizeContainers(detections: DetectionResult[]): RecognizedContainer[] {
    const containerClasses = new Set([
      'bottle', 'cup', 'wine glass', 'bottle', 'can', 'box', 'bag'
    ]);

    const containers: RecognizedContainer[] = [];

    for (const detection of detections) {
      // Check if the detected object might be a container
      if (!this.isPotentialContainer(detection.class)) {
        continue;
      }

      // Map the detected class to a container type
      const containerType = this.mapClassToContainerType(detection.class);
      
      // Calculate estimated dimensions and capacity
      const [_, __, width, height] = detection.bbox;
      const estimatedCapacity = this.estimateCapacity(containerType, width, height);
      const estimatedWeight = this.estimateWeight(containerType, estimatedCapacity);

      containers.push({
        id: uuidv4(),
        type: containerType,
        confidence: detection.score,
        dimensions: {
          width,
          height,
        },
        estimatedCapacity,
        estimatedWeight,
        timestamp: Date.now()
      });
    }

    return containers;
  }

  /**
   * Checks if a detected class could be a recycling container
   */
  private isPotentialContainer(className: string): boolean {
    const containerKeywords = ['bottle', 'cup', 'glass', 'can', 'box', 'bag', 'container'];
    return containerKeywords.some(keyword => className.toLowerCase().includes(keyword));
  }

  /**
   * Maps a detected class to a container type
   */
  private mapClassToContainerType(className: string): ContainerType {
    const lowerClass = className.toLowerCase();
    
    if (lowerClass.includes('bottle') && (lowerClass.includes('plastic') || !lowerClass.includes('glass'))) {
      return ContainerType.PLASTIC_BOTTLE;
    } else if (lowerClass.includes('bottle') && lowerClass.includes('glass')) {
      return ContainerType.GLASS_BOTTLE;
    } else if (lowerClass.includes('can')) {
      return ContainerType.ALUMINUM_CAN;
    } else if (lowerClass.includes('box') || lowerClass.includes('carton')) {
      return ContainerType.CARDBOARD_BOX;
    } else if (lowerClass.includes('bag') && lowerClass.includes('plastic')) {
      return ContainerType.PLASTIC_BAG;
    }
    
    return ContainerType.OTHER;
  }

  /**
   * Estimates container capacity based on dimensions and type
   */
  private estimateCapacity(type: ContainerType, width: number, height: number): number {
    // These are rough estimates - would be refined with real data
    switch (type) {
      case ContainerType.PLASTIC_BOTTLE:
        return Math.round(width * height * 0.0015);
      case ContainerType.GLASS_BOTTLE:
        return Math.round(width * height * 0.001);
      case ContainerType.ALUMINUM_CAN:
        return 0.355; // Standard 12oz can
      case ContainerType.CARDBOARD_BOX:
        return Math.round(width * height * 0.003);
      case ContainerType.PLASTIC_BAG:
        return Math.round(width * height * 0.0005);
      default:
        return Math.round(width * height * 0.001);
    }
  }

  /**
   * Estimates container weight based on capacity and type
   */
  private estimateWeight(type: ContainerType, capacity: number): number {
    // Empty container weights (rough estimates)
    switch (type) {
      case ContainerType.PLASTIC_BOTTLE:
        return Math.round(capacity * 20); // About 20g per liter of capacity
      case ContainerType.GLASS_BOTTLE:
        return Math.round(capacity * 500); // Glass is much heavier
      case ContainerType.ALUMINUM_CAN:
        return 15; // Standard aluminum can
      case ContainerType.CARDBOARD_BOX:
        return Math.round(capacity * 100);
      case ContainerType.PLASTIC_BAG:
        return Math.round(capacity * 10);
      default:
        return Math.round(capacity * 50);
    }
  }

  /**
   * Calculate the environmental impact of recycling a container
   */
  public calculateEnvironmentalImpact(container: RecognizedContainer) {
    // Calculate carbon footprint saved
    const carbonFootprintSaved = this.calculateCarbonFootprint(container);
    
    // Calculate water saved
    const waterSaved = this.calculateWaterSaved(container);
    
    // Calculate energy saved
    const energySaved = this.calculateEnergySaved(container);
    
    // Calculate landfill space saved
    const landfillSpaceSaved = container.estimatedWeight * 0.8; // Rough estimate
    
    // Calculate recycling credits (simplified)
    const recyclingCredits = Math.round(carbonFootprintSaved / 10);
    
    return {
      containerId: container.id,
      containerType: container.type,
      carbonFootprintSaved,
      waterSaved,
      energySaved,
      landfillSpaceSaved,
      recyclingCredits
    };
  }

  private calculateCarbonFootprint(container: RecognizedContainer): number {
    switch (container.type) {
      case ContainerType.PLASTIC_BOTTLE:
        return container.estimatedWeight * 3.1; // 3.1g CO2 per gram of plastic
      case ContainerType.GLASS_BOTTLE:
        return container.estimatedWeight * 0.8; // 0.8g CO2 per gram of glass
      case ContainerType.ALUMINUM_CAN:
        return container.estimatedWeight * 8.1; // 8.1g CO2 per gram of aluminum
      case ContainerType.CARDBOARD_BOX:
        return container.estimatedWeight * 1.1; // 1.1g CO2 per gram of cardboard
      case ContainerType.PLASTIC_BAG:
        return container.estimatedWeight * 6; // 6g CO2 per gram of plastic bag
      default:
        return container.estimatedWeight * 2;
    }
  }

  private calculateWaterSaved(container: RecognizedContainer): number {
    switch (container.type) {
      case ContainerType.PLASTIC_BOTTLE:
        return container.estimatedWeight * 3.3; // 3.3L water per gram of plastic
      case ContainerType.GLASS_BOTTLE:
        return container.estimatedWeight * 0.5; // 0.5L water per gram of glass
      case ContainerType.ALUMINUM_CAN:
        return container.estimatedWeight * 8; // 8L water per gram of aluminum
      case ContainerType.CARDBOARD_BOX:
        return container.estimatedWeight * 2; // 2L water per gram of cardboard
      case ContainerType.PLASTIC_BAG:
        return container.estimatedWeight * 5; // 5L water per gram of plastic bag
      default:
        return container.estimatedWeight * 2;
    }
  }

  private calculateEnergySaved(container: RecognizedContainer): number {
    switch (container.type) {
      case ContainerType.PLASTIC_BOTTLE:
        return container.estimatedWeight * 0.083; // 0.083 kWh per gram of plastic
      case ContainerType.GLASS_BOTTLE:
        return container.estimatedWeight * 0.02; // 0.02 kWh per gram of glass
      case ContainerType.ALUMINUM_CAN:
        return container.estimatedWeight * 0.14; // 0.14 kWh per gram of aluminum
      case ContainerType.CARDBOARD_BOX:
        return container.estimatedWeight * 0.01; // 0.01 kWh per gram of cardboard
      case ContainerType.PLASTIC_BAG:
        return container.estimatedWeight * 0.12; // 0.12 kWh per gram of plastic bag
      default:
        return container.estimatedWeight * 0.04;
    }
  }

  /**
   * Check if the service is ready for recognition
   */
  public isReady(): boolean {
    return this.isTfReady && !!this.cocossdModel;
  }

  /**
   * Release resources when the service is no longer needed
   */
  public dispose(): void {
    if (this.cocossdModel) {
      // Release TensorFlow resources
      this.cocossdModel = null;
    }
  }
} 