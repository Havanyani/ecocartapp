# AR Components

## Overview
This directory contains components related to Augmented Reality (AR) features in the EcoCart application. These components use the device camera, TensorFlow.js, and machine learning to provide augmented reality experiences for container recognition and recycling assistance.

## Components

### Core Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| [ARContainerScanner](./ARContainerScanner.md) | Main component for camera-based container detection and recognition. Integrates TensorFlow.js with Expo Camera. | [Documentation](./ARContainerScanner.md) |
| [ContainerInfoOverlay](./ContainerInfoOverlay.md) | Displays detailed information about recognized containers, including environmental impact metrics. | [Documentation](./ContainerInfoOverlay.md) |
| [ScanGuide](./ScanGuide.md) | Provides visual guidance for users to correctly position recyclable containers in the camera frame. | [Documentation](./ScanGuide.md) |

## Services

The AR components are supported by the following services:

| Service | Description | Location |
|---------|-------------|----------|
| ARContainerRecognitionService | Singleton service that manages container detection using TensorFlow.js and COCO-SSD model. | `src/services/ARContainerRecognitionService.ts` |

## Related Features

- [AR Container Recognition](../../features/ar/container-recognition.md) - Full feature documentation for AR container recognition.

## Implementation Details

### Technology Stack
- **Camera**: Expo Camera (`expo-camera`)
- **Machine Learning**: TensorFlow.js (`@tensorflow/tfjs`, `@tensorflow/tfjs-react-native`)
- **Object Detection**: COCO-SSD model (`@tensorflow-models/coco-ssd`)
- **Graphics**: Expo GL (`expo-gl`)
- **Media Integration**: Expo Media Library (`expo-media-library`)

### Key Concepts
- **Tensor Camera**: Camera feed converted to tensors for real-time ML processing
- **Object Detection**: Identifying objects in the camera feed using pre-trained models
- **Container Classification**: Mapping detected objects to container types
- **Environmental Impact Calculation**: Estimating environmental benefits of recycling

## Usage Guidelines

### Best Practices
- Initialize AR features only when needed due to their high resource usage
- Provide clear user instructions for optimal container scanning
- Implement proper error handling for camera and ML processing issues
- Include alternative methods for users who cannot use camera-based scanning

### Performance Considerations
- AR features are resource-intensive and should be used sparingly
- Implement throttling to reduce continuous processing load
- Release resources (dispose tensors, close camera) when AR features are not in use
- Consider detection intervals based on device capabilities

## Accessibility
These components implement several accessibility features:
- High contrast visual elements in the scanner UI
- Clear text descriptions for recognized containers
- Alternative methods for container input for users who cannot use AR features

## Future Development
- Custom TensorFlow model for more accurate container recognition
- Support for barcode/QR code scanning of container UPC codes
- AR measurement to more accurately determine container dimensions
- Expanded container type recognition 