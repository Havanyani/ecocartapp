# ARContainerScanner

## Overview
The `ARContainerScanner` component provides augmented reality-based recognition of recycling containers. It uses the device camera to identify container types and display recycling information to users.

## Enhanced Versions

### ARContainerScannerEnhanced
The `ARContainerScannerEnhanced` component extends functionality with:
- **Material Detection**: Automatically identifies container materials using computer vision
- **Environmental Impact Calculation**: Shows the environmental benefit of recycling the container
- **Recycling Instructions**: Provides specific recycling instructions based on the material
- Uses a mock camera implementation to avoid expo-camera integration issues

### ARContainerScannerV2 (Recommended)
The `ARContainerScannerV2` component is our most robust implementation that:
- **Avoids Camera Integration Issues**: Works in both test and production modes
- **Material Detection**: Identifies materials with advanced detection algorithms 
- **Environmental Impact Calculation**: Shows comprehensive environmental benefits including carbon, water, energy, and landfill space saved
- **Test Mode Support**: Can run in test mode without requiring camera permissions
- **Progressive Feedback**: Provides detailed scanning status updates during the recognition process

## Usage

```tsx
// Basic scanner
import ARContainerScanner from '@/components/ar/ARContainerScanner';

<ARContainerScanner 
  onContainerRecognized={handleContainerRecognized}
  onClose={handleClose}
/>

// Enhanced scanner with material detection
import ARContainerScannerEnhanced from '@/components/ar/ARContainerScannerEnhanced';

<ARContainerScannerEnhanced 
  onContainerRecognized={handleContainerRecognized}
  onClose={handleClose}
/>

// Recommended V2 implementation
import ARContainerScannerV2 from '@/components/ar/ARContainerScannerV2';

<ARContainerScannerV2 
  onContainerRecognized={handleContainerRecognized}
  onClose={handleClose}
  userId="user123"
  testMode={false} // Set to true for testing without camera
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onContainerRecognized` | `(container: RecognizedContainer) => void` | No | `undefined` | Callback function triggered when a container is recognized |
| `onClose` | `() => void` | No | `undefined` | Callback function triggered when the scanner is closed |
| `userId` | `string` | No | `'anonymous'` | User ID for contribution attribution |
| `testMode` | `boolean` | No | `false` | Enable test mode without camera (V2 only) |

## Features
- **Camera-Based Scanning**: Uses the device camera to scan containers
- **Recognition Simulation**: Simulates container recognition (prototype version)
- **Realtime Feedback**: Provides visual feedback during scanning
- **Container Analysis**: Identifies container type, recyclability, and confidence level
- **User Guidance**: Guides users on how to position containers for optimal scanning
- **Material Detection**: Identifies the material composition of containers
- **Environmental Impact**: Shows the positive impact of recycling the container
- **Landfill Space Calculation**: (V2) Calculates space saved in landfill by recycling
- **Crowdsourced Data**: Allows users to contribute unrecognized containers to the database

## Styling
The component includes built-in styling but adapts to the app's theme system:

```tsx
// The scan button uses the primary color from the theme
<TouchableOpacity 
  style={[
    styles.scanButton, 
    { backgroundColor: theme.colors.primary }
  ]}
>
  {/* Button content */}
</TouchableOpacity>
```

## Best Practices
- **Do**: Call the component from a modal or dedicated screen
- **Do**: Handle the recognized container data in your app's state management
- **Do**: Use the V2 implementation for best compatibility and features
- **Don't**: Embed the scanner in small UI containers; it needs sufficient screen space
- **Accessibility**: Ensure clear instructions for visually impaired users using the scanner

## Examples

### Basic Example (V2 Implementation)
```tsx
import ARContainerScannerV2 from '@/components/ar/ARContainerScannerV2';
import { useNavigation } from '@react-navigation/native';

function ScanScreen() {
  const navigation = useNavigation();
  
  const handleContainerRecognized = (container) => {
    // Add the container to the collection
    addContainerToCollection(container);
    
    // Navigate to details screen
    navigation.navigate('ContainerDetails', { containerId: container.id });
  };
  
  return (
    <ARContainerScannerV2
      onContainerRecognized={handleContainerRecognized}
      onClose={() => navigation.goBack()}
    />
  );
}
```

### Using Test Mode for Development
```tsx
import ARContainerScannerV2 from '@/components/ar/ARContainerScannerV2';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/hooks/useUser';

function DevScanScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [isTestMode, setIsTestMode] = useState(true);
  
  const handleContainerRecognized = (container) => {
    // The container object includes materialType and additional recycling info
    console.log(`Detected ${container.name} made of ${container.materialType}`);
    
    // Show landfill space saved
    if (container.environmentalImpact?.landfillSpaceSaved) {
      console.log(`Saved ${container.environmentalImpact.landfillSpaceSaved} cm³ of landfill space`);
    }
    
    // Navigate to details screen with material info
    navigation.navigate('MaterialDetails', { 
      containerId: container.id,
      materialType: container.materialType 
    });
  };
  
  return (
    <>
      <TouchableOpacity onPress={() => setIsTestMode(!isTestMode)}>
        <Text>Toggle Test Mode: {isTestMode ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
      
      <ARContainerScannerV2
        onContainerRecognized={handleContainerRecognized}
        onClose={() => navigation.goBack()}
        userId={user.id}
        testMode={isTestMode}
      />
    </>
  );
}
```

## Implementation Details
This prototype version simulates container recognition by randomly selecting container types after a delay. In a production version, this would be replaced with:

1. ARKit/ARCore integration using ViroReact or similar libraries
2. Machine learning models for image recognition
3. Cloud API integration for accurate container identification 

The enhanced versions add material detection capabilities using:
1. Computer vision techniques to analyze visual properties
2. Spectral analysis to identify material composition
3. Reference database of common recycling materials

## Related Components
- `ContainerInfoCard`: Displays detailed information about recognized containers
- `ARGuideOverlay`: Provides visual guidance for positioning containers
- `RecyclingInfoSheet`: Bottom sheet with recycling instructions
- `ContainerContributionForm`: Allows users to contribute new container data
- `ContributionVerificationPanel`: For administrators to verify user contributions

## Related Files
- `utils/material-detection.ts`: Advanced material detection algorithms
- `services/ARContainerRecognitionService.ts`: TensorFlow-based container recognition
- `types/ar.ts`: Types and interfaces for AR components

## Related Documentation
- [AR Container Recognition Plan](../../../docs/features/ar/container-recognition-plan.md)
- [Container Recognition API](../../../docs/api/container-recognition-api.md) 