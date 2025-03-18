import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

// Model detection interfaces
export interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

// Container recognition types
export interface RecognizedContainer {
  id: string;
  type: ContainerType;
  confidence: number;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  estimatedCapacity: number; // in liters
  estimatedWeight: number; // in grams
  timestamp: number;
  imageUri?: string;
}

export enum ContainerType {
  PLASTIC_BOTTLE = 'plastic_bottle',
  GLASS_BOTTLE = 'glass_bottle',
  ALUMINUM_CAN = 'aluminum_can',
  CARDBOARD_BOX = 'cardboard_box',
  PLASTIC_BAG = 'plastic_bag',
  OTHER = 'other'
}

/**
 * Props for the ARContainerScanner component
 */
export interface ARContainerScannerProps {
  /** Callback when a container is detected */
  onContainerDetected?: (container: RecognizedContainer) => void;
  /** Callback for scanner errors */
  onError?: (errorMessage: string) => void;
  /** Custom styling for the scanner component */
  style?: StyleProp<ViewStyle>;
  /** Whether to show the scanning guide overlay */
  showGuide?: boolean;
  /** Whether to save images of detected containers */
  saveDetectedImages?: boolean;
  /** Interval between detection attempts in milliseconds */
  detectionInterval?: number;
  onMultipleContainersDetected?: (containers: RecognizedContainer[]) => void;
  detectionThreshold?: number; // 0 to 1, default 0.7
  showDebugInfo?: boolean;
  showDetectionBox?: boolean;
  children?: ReactNode;
  maxDetections?: number;
}

// AR container information overlay props
export interface ContainerInfoOverlayProps {
  container: RecognizedContainer;
  onClose?: () => void;
  onConfirm?: (container: RecognizedContainer) => void;
  style?: StyleProp<ViewStyle>;
}

// Recognition model service configuration
export interface RecognitionModelConfig {
  modelType: ModelType;
  threshold: number;
  enableMultipleDetections: boolean;
  maxDetections: number;
}

export enum ModelType {
  COCO_SSD = 'coco_ssd',
  CUSTOM_CONTAINER = 'custom_container',
  MOBILE_NET = 'mobile_net'
}

// Environmental impact of a recognized container
export interface ContainerEnvironmentalImpact {
  containerId: string;
  containerType: ContainerType;
  carbonFootprintSaved: number; // in grams of CO2
  waterSaved: number; // in liters
  energySaved: number; // in kWh
  landfillSpaceSaved: number; // in cubic centimeters
  recyclingCredits: number;
}

// AR view state
export interface ARViewState {
  isInitialized: boolean;
  isModelLoaded: boolean;
  isDetecting: boolean;
  isCameraReady: boolean;
  detectedContainers: RecognizedContainer[];
  error?: string;
} 