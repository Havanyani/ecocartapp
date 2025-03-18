# AR Container Recognition

## Overview
AR Container Recognition is a feature that uses augmented reality and machine learning to identify recyclable containers through the device camera. The feature analyzes container types, estimates their environmental impact, and rewards users with EcoCredits for recycling activities.

## User-Facing Functionality
- **Primary Capabilities**: Camera-based container detection and recognition, environmental impact calculation, EcoCredits rewards for recycling.
- **User Interface Components**: AR scanner with visual guides, container information overlay with environmental impact statistics.
- **User Flow**: User accesses AR scanner from Waste Collection screen, points camera at recyclable containers, receives immediate feedback on container type and environmental impact, and can add containers to their recycling list.
- **Screenshots**: [To be added after implementation testing]

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Singleton (Recognition Service), Observer (Camera Stream processing)
- **Key Components**: ARContainerRecognitionService, ARContainerScanner, ContainerInfoOverlay, ScanGuide
- **Dependencies**: TensorFlow.js (@tensorflow/tfjs, @tensorflow/tfjs-react-native), COCO-SSD model (@tensorflow-models/coco-ssd), Expo Camera (expo-camera), Expo GL (expo-gl), Expo Media Library (expo-media-library)

### Code Structure
```typescript
// Key types
export interface RecognizedContainer {
  id: string;
  type: ContainerType;
  confidence: number;
  dimensions: {
    width: number;
    height: number;
  };
  estimatedCapacity: number;
  estimatedWeight: number;
  timestamp: number;
  imageUri?: string;
}

// Core functionality
class ARContainerRecognitionService {
  // Singleton pattern implementation
  private static instance: ARContainerRecognitionService;
  
  public static getInstance(): ARContainerRecognitionService {
    if (!ARContainerRecognitionService.instance) {
      ARContainerRecognitionService.instance = new ARContainerRecognitionService();
    }
    return ARContainerRecognitionService.instance;
  }
  
  // Object detection with TensorFlow
  public async detectObjects(imageTensor: tf.Tensor3D): Promise<DetectionResult[]> {
    // Implementation details...
  }
  
  // Container recognition from detection results
  public recognizeContainers(detections: DetectionResult[]): RecognizedContainer[] {
    // Implementation details...
  }
}
```

### Key Files
- `src/services/ARContainerRecognitionService.ts`: Service for ML-based container detection and recognition
- `src/components/ar/ARContainerScanner.tsx`: Main AR scanner component with camera integration
- `src/components/ar/ContainerInfoOverlay.tsx`: Overlay displaying recognized container information
- `src/components/ar/ScanGuide.tsx`: Visual guide for container scanning
- `src/screens/ARContainerScannerScreen.tsx`: Screen that hosts AR scanner components
- `src/types/ar.ts`: Type definitions for AR container recognition

## Integration Points
- **Related Features**: Waste Collection, Recycling Rewards, Environmental Impact Tracking
- **State Management**: Local component state with React useState/useEffect, global recognition service with singleton pattern
- **Feature Flags**: Controlled via `enableARContainerScanner` feature flag in `src/config/featureFlags.ts`

## Performance Considerations
- **Optimization Techniques**: Using lightweight TensorFlow models (lite_mobilenet_v2), throttling detection frequency, memory management with tensor disposal
- **Potential Bottlenecks**: TensorFlow model initialization, continuous camera processing, image analysis
- **Battery/Resource Impact**: High camera and CPU/GPU usage, recommended for short scanning sessions

## Testing Strategy
- **Unit Tests**: Service methods testing with mock tensor data
- **Integration Tests**: Component testing with mock recognition service
- **Mock Data**: Sample container detection results, mock environmental impact data
- **Manual Testing**: Verify detection quality with various container types, lighting conditions, and backgrounds

## Accessibility
- **Keyboard Navigation**: Alternative UI for non-AR container input
- **Screen Reader Compatibility**: Clear text descriptions for recognized containers and their impact
- **Color Contrast**: High contrast visual elements in scanner UI
- **Alternative Methods**: Manual container logging option for users unable to use AR features

## Future Improvements
- Train custom TensorFlow model for more accurate container recognition
- Add support for barcode/QR code scanning of container UPC codes
- Implement AR measurement to more accurately determine container dimensions
- Create a container database to improve recognition accuracy
- Add local recognition model to reduce dependency on network connection
- Implement batch scanning for multiple containers

## Related Documentation
- [Waste Collection Feature](../real-time/collection-status-updates.md)
- [Environmental Impact Calculation](../analytics/environmental-impact.md)
- [TensorFlow.js Integration Guide](../../development/ml-integration.md) 