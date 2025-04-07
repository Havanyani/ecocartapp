# Smart Home Integration for EcoCart

This module provides smart home integration capabilities for the EcoCart application, allowing users to connect and manage their smart recycling bins, energy monitors, and other eco-friendly smart devices.

## Architecture

The smart home integration follows a layered architecture:

```
┌─────────────────────────────────────┐
│            UI Components            │
│ SmartDeviceSettings, DeviceDiscovery│
└───────────────────┬─────────────────┘
                    │
┌───────────────────▼─────────────────┐
│          SmartHomeService           │
│  Core service managing connections   │
└─┬─────────────────┬─────────────────┘
  │                 │
  ▼                 ▼
┌─────────┐   ┌─────────────┐
│ Adapters│   │ Repositories│
└─┬───┬───┘   └──────┬──────┘
  │   │              │
  ▼   ▼              ▼
┌────┐┌────┐   ┌──────────┐
│Alexa││Siri│   │ Storage  │
└────┘└────┘   └──────────┘
```

### Key Components

1. **SmartHomeService**: The core service that coordinates device discovery, connection, and management.
2. **Protocol Handlers**: Manages specific connection protocols like BLE, Wi-Fi, etc.
3. **Platform Adapters**: Integrates with voice assistants like Google Assistant, Alexa, and Siri.
4. **Repositories**: Handles data storage and retrieval for devices and configuration.
5. **UI Components**: Provides user interface for device management.

## Integrations

The module integrates with the following voice platforms:

- Google Assistant
- Amazon Alexa
- Apple Siri (iOS only)

## Device Types

The system supports these smart device types:

- Smart Recycling Bins
- Energy Monitors
- Smart Appliances
- Voice Assistants

## Getting Started

### Adding to a Screen

```tsx
import { SmartHomeService } from '../services/smart-home/SmartHomeService';

// Initialize the service
useEffect(() => {
  const initializeSmartHome = async () => {
    const smartHomeService = SmartHomeService.getInstance();
    await smartHomeService.initialize();
  };
  
  initializeSmartHome();
}, []);

// Getting connected devices
const [devices, setDevices] = useState([]);

const loadDevices = async () => {
  const smartHomeService = SmartHomeService.getInstance();
  const connectedDevices = await smartHomeService.getConnectedDevices();
  setDevices(connectedDevices);
};
```

### Device Discovery

To start device discovery:

```tsx
const startDiscovery = async () => {
  const smartHomeService = SmartHomeService.getInstance();
  await smartHomeService.startDeviceDiscovery();
  
  // Listen for discovered devices
  smartHomeService.on('deviceDiscovered', (device) => {
    console.log('Discovered device:', device);
  });
};
```

### Connecting to a Device

```tsx
const connectToDevice = async (deviceId) => {
  const smartHomeService = SmartHomeService.getInstance();
  const result = await smartHomeService.connectDevice(deviceId);
  
  if (result.success) {
    console.log('Connected to device:', result.device);
  } else {
    console.error('Failed to connect:', result.error);
  }
};
```

### Voice Platform Integration

```tsx
// Link with Google Assistant
const linkWithGoogleAssistant = async () => {
  const smartHomeService = SmartHomeService.getInstance();
  const result = await smartHomeService.linkVoicePlatform(
    VoicePlatform.GOOGLE_ASSISTANT
  );
  
  if (result.success) {
    console.log('Linked with Google Assistant');
  } else {
    console.error('Failed to link:', result.error);
  }
};
```

## Automation Rules

The system supports automation rules to trigger actions based on device events:

```tsx
const createAutomationRule = async () => {
  const smartHomeService = SmartHomeService.getInstance();
  
  const rule = {
    id: `rule-${Date.now()}`,
    name: 'Notify when bin is full',
    enabled: true,
    deviceId: 'device-id-here',
    trigger: {
      type: 'fillLevel',
      value: 90, // percent
    },
    condition: 'time > 8:00 && time < 20:00',
    action: {
      type: 'sendNotification',
      parameters: {
        message: 'Your recycling bin is almost full',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await smartHomeService.addAutomationRule(rule);
};
```

## Event Handling

The service emits events that your components can listen to:

- `deviceDiscovered`: When a new device is discovered
- `connectionStatusChanged`: When a device's connection status changes
- `deviceDataReceived`: When data is received from a device

Example:

```tsx
useEffect(() => {
  const smartHomeService = SmartHomeService.getInstance();
  
  const handleConnectionChange = (data) => {
    const { deviceId, status } = data;
    console.log(`Device ${deviceId} connection status: ${status}`);
    // Update UI or state as needed
  };
  
  smartHomeService.on('connectionStatusChanged', handleConnectionChange);
  
  return () => {
    smartHomeService.off('connectionStatusChanged', handleConnectionChange);
  };
}, []);
```

## Components

The module includes these UI components:

1. **SmartHomeScreen**: Main screen for smart home management
2. **DeviceDiscovery**: Component for discovering and adding new devices
3. **SmartDeviceSettings**: Component for configuring individual devices
4. **AutomationRules**: Component for managing device automation rules

## Extending the System

### Adding a New Device Type

1. Define the device type in `SmartHomeService.ts`:

```tsx
export enum DeviceType {
  // Existing types...
  WATER_MONITOR = 'water_monitor',
}
```

2. Update device capabilities if needed:

```tsx
export enum DeviceCapability {
  // Existing capabilities...
  WATER_USAGE_TRACKING = 'water_usage_tracking',
}
```

3. Implement device-specific logic in the appropriate protocol handler.

### Adding a New Platform Adapter

1. Create a new adapter class in the `adapters` directory
2. Implement the required methods for authentication and device control
3. Register the adapter in the `SmartHomeService`

## Troubleshooting

### Common Issues

1. **Bluetooth Permissions**: Ensure the app has the required Bluetooth permissions for your platform
2. **Connection Failures**: Check device availability and signal strength
3. **Voice Platform Integration**: Verify OAuth configuration and tokens

## Dependencies

- `react-native-ble-plx`: For Bluetooth Low Energy connections
- `@react-native-async-storage/async-storage`: For persistent data storage

## Future Improvements

- Add support for Matter protocol
- Implement more automation capabilities
- Add support for more device types
- Improve device discovery process
- Add robust error handling and retry logic 