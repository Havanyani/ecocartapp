# AR Container Scanner

## Overview
The AR Container Scanner is a feature that allows users to scan and identify recycling containers using their device camera. The scanner uses augmented reality and image recognition to provide information about the recyclability of containers and their environmental impact.

## Implementation Status
- **Current Status**: Prototype implementation
- **Planned Features**: Integration with ARKit/ARCore for more accurate recognition
- **Priority**: High

## Features
- Camera-based container scanning
- Real-time recognition of common recycling containers
- Environmental impact calculation
- Recycling instructions
- Scan history tracking

## Technical Components

### Components
- `ARContainerScanner`: Main scanner component with camera handling
- `ARGuideOverlay`: Visual guidance for positioning containers
- `ContainerInfoCard`: Displays information about recognized containers
- `EnvironmentalImpactPanel`: Shows environmental impact metrics

### Utilities
- `ar-helpers.ts`: Contains recognition logic and container database

### Navigation
- `ARContainerScanScreen`: Screen that hosts the AR scanner experience

## Usage Flow
1. User navigates to the AR Scanner screen
2. Camera opens with positioning guide
3. User positions a container within the frame
4. User taps "Scan Container" button
5. The app analyzes the image and identifies the container
6. Results are displayed with recyclability information and environmental impact

## Current Limitations
- Currently using simulated recognition (random selection)
- Limited container types in database
- No persistent storage of scan history

## Future Development
- [ ] Integrate with real AR frameworks (ViroReact, ARKit, ARCore)
- [ ] Implement machine learning model for container recognition
- [ ] Add barcode scanning for precise identification
- [ ] Expand container database
- [ ] Add gamification elements (points, achievements)
- [ ] Implement cloud-based recognition for better accuracy

## Dependencies
- expo-camera: For camera access and image capture
- @react-navigation/native: For screen navigation
- react-native-safe-area-context: For proper layout on different devices

## Getting Started
To work on this feature:

1. Ensure you have the required dependencies:
   ```bash
   npm install expo-camera
   ```

2. Import the component:
   ```jsx
   import ARContainerScanScreen from '@/screens/ARContainerScanScreen';
   ```

3. Add to your navigation:
   ```jsx
   <Stack.Screen 
     name="ARContainerScan" 
     component={ARContainerScanScreen}
     options={{ headerShown: false }}
   />
   ```

## Testing
To test the AR Container Scanner:

1. Ensure camera permissions are granted in your app
2. Test on a physical device (AR features won't work on emulators)
3. Test with various container types in different lighting conditions

## Resources
- [Container Recognition Plan](./container-recognition-plan.md)
- [AR Component Documentation](../../../src/components/ar/ARContainerScanner.README.md) 