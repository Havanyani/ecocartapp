# ARContainerScanner

## Overview
ARContainerScanner is a React Native component that uses the device camera and machine learning to detect and recognize recycling containers in real-time. It integrates TensorFlow.js with Expo's camera to provide augmented reality container detection with environmental impact metrics.

## Usage

```tsx
import ARContainerScanner from '@/components/ar/ARContainerScanner';
import { RecognizedContainer } from '@/types/ar';

// Basic usage
<ARContainerScanner 
  onContainerDetected={(container) => console.log('Container detected:', container)}
/>

// Advanced usage with all props
<ARContainerScanner 
  onContainerDetected={(container) => handleContainerDetection(container)}
  onError={(errorMessage) => handleError(errorMessage)}
  style={{ flex: 1 }}
  showGuide={true}
  saveDetectedImages={true}
  detectionInterval={800}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onContainerDetected` | `(container: RecognizedContainer) => void` | No | `undefined` | Callback when a container is detected and recognized |
| `onError` | `(errorMessage: string) => void` | No | `undefined` | Callback when an error occurs during scanning |
| `style` | `StyleProp<ViewStyle>` | No | `undefined` | Custom styles for the scanner container |
| `showGuide` | `boolean` | No | `true` | Whether to show the visual scanning guide overlay |
| `saveDetectedImages` | `boolean` | No | `false` | Whether to save images of detected containers to the device's media library |
| `detectionInterval` | `number` | No | `700` | Interval in milliseconds between detection attempts |

## Features
- **Real-time Container Detection**: Uses TensorFlow.js with COCO-SSD model to detect objects in the camera feed
- **Container Type Recognition**: Identifies different types of recyclable containers (plastic bottles, aluminum cans, etc.)
- **Environmental Impact Calculation**: Estimates the environmental impact of recycling the detected container
- **Visual Scanning Guide**: Provides an interactive guide to help users position containers correctly
- **Detected Container Information Display**: Shows detailed information about detected containers
- **Image Capture**: Optionally captures and saves images of detected containers
- **Performance Optimization**: Throttles detection frequency and implements memory management to optimize performance

## Styling
The component accepts standard StyleProp<ViewStyle> styling through the style prop, which will be applied to the root container. Internal elements have predefined styles that maintain the AR experience.

```tsx
// Example of styling options
<ARContainerScanner 
  style={{ 
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  }}
/>
```

## Best Practices
- **Do**: Implement error handling through the onError callback
- **Do**: Use the component in full-screen or with sufficient size for accurate detection
- **Do**: Provide clear instructions to users about how to use the scanner
- **Don't**: Place the scanner in small containers or with limited visibility
- **Don't**: Run multiple scanners simultaneously (it will impact performance)
- **Accessibility**: Provide alternative methods for users who cannot use the camera-based scanning

## Examples

### Basic Scanner with Detection Handling
```tsx
const handleContainerDetected = (container: RecognizedContainer) => {
  console.log(`Detected a ${container.type} with ${Math.round(container.confidence * 100)}% confidence`);
  // Add the container to user's recycling list
  addContainerToRecyclingList(container);
};

<ARContainerScanner 
  onContainerDetected={handleContainerDetected}
/>
```

### Scanner with Error Handling and Custom Settings
```tsx
const [isScannerActive, setIsScannerActive] = useState(true);

const handleError = (errorMessage: string) => {
  console.error('Scanner error:', errorMessage);
  Alert.alert('Scanner Error', errorMessage, [
    { text: 'Try Again', onPress: () => setIsScannerActive(true) }
  ]);
  setIsScannerActive(false);
};

{isScannerActive && (
  <ARContainerScanner 
    onContainerDetected={handleContainerDetected}
    onError={handleError}
    saveDetectedImages={true}
    detectionInterval={900}
  />
)}
```

### Scanner with Custom UI Integration
```tsx
<View style={styles.scannerContainer}>
  <ARContainerScanner 
    onContainerDetected={handleContainerDetected}
    style={styles.scanner}
    showGuide={false}
  />
  
  {/* Custom guide overlay */}
  <View style={styles.customGuideOverlay}>
    <Text style={styles.guideText}>Position a recyclable container in the frame</Text>
    <CustomScanFrame />
  </View>
  
  {/* Custom controls */}
  <View style={styles.controlsContainer}>
    <TouchableOpacity onPress={toggleSaveImages}>
      <Icon name="camera" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
</View>
```

## Internal Structure
The component uses React hooks (useState, useEffect, useRef, useCallback) to manage component state and camera interactions. It integrates with TensorFlow.js through the ARContainerRecognitionService singleton and processes camera frames using the cameraWithTensors HOC from TensorFlow.js React Native.

Key state variables include:
- `viewState`: Manages scanner initialization, model loading, detection status, and detected containers
- `hasPermission`: Tracks camera and media library permissions
- `lastAnalysisTime`: Controls detection frequency throttling

## Dependent Components
- `ContainerInfoOverlay`: Displays information about detected containers
- `ScanGuide`: Provides visual guidance for positioning containers
- `ARContainerRecognitionService`: Service for container detection and recognition

## Related Documentation
- [AR Container Recognition Feature](../../features/ar/container-recognition.md)
- [ContainerInfoOverlay Component](./ContainerInfoOverlay.md)
- [ScanGuide Component](./ScanGuide.md)
- [ARContainerScannerScreen](../../screens/ARContainerScannerScreen.md) 