# Smart Device Connection

## Overview
This document details the implementation of smart device connectivity within EcoCart's smart home ecosystem. It covers the approaches, protocols, and components required to connect and interact with various smart home devices such as recycling bins, energy meters, and smart appliances to enhance sustainability tracking and eco-friendly behaviors.

## User-Facing Functionality
- **Primary Capabilities**: Connect to and monitor smart recycling bins, energy monitoring systems, and household appliances; retrieve usage data; and receive eco-friendly recommendations based on actual usage patterns
- **User Interface Components**: Device discovery/connection screens, device status dashboards, consumption visualizations, and automation setup interfaces
- **User Flow**: User discovers devices, pairs them with EcoCart, monitors their status and data, and receives personalized sustainability recommendations
- **Screenshots**: [Smart device interface mockups to be added after design finalization]

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Repository pattern for device data management, Observer pattern for device events, Strategy pattern for protocol-specific implementations
- **Key Components**: DeviceConnectorService, BLEManager, WiFiDeviceDiscovery, DeviceDataRepository, DeviceProtocolAdapters
- **Dependencies**: React Native BLE libraries, WiFi management libraries, Matter SDK (future), platform-specific IoT SDKs

### Code Structure

```typescript
// Core interfaces
export interface SmartDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model?: string;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
  lastSyncTimestamp?: number;
  capabilities: DeviceCapability[];
  metadata: Record<string, any>;
}

export enum ConnectionType {
  BLE,
  WIFI,
  CLOUD_CONNECTED,
  HUB_CONNECTED,
  MATTER
}

// Protocol manager example
class BLEDeviceManager implements DeviceProtocolManager {
  private connectedDevices: Map<string, BLEDevice> = new Map();
  
  async discoverDevices(): Promise<DeviceDiscoveryResult[]> {
    // Scan for BLE devices
    return this.transformScanResults(await bleManager.startDeviceScan());
  }
  
  async connectDevice(deviceId: string): Promise<ConnectionResult> {
    try {
      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevices.set(deviceId, device);
      return { success: true, device: this.mapToSmartDevice(device) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async readDeviceData(deviceId: string, dataType: DeviceDataType): Promise<DeviceDataResult> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      return { success: false, error: 'Device not connected' };
    }
    
    // Read data based on device type and requested data type
    // Implementation varies by device model and capability
  }
}

// Main connector service
export class DeviceConnectorService {
  private protocolManagers: Map<ConnectionType, DeviceProtocolManager> = new Map();
  private deviceRepository: DeviceRepository;
  
  constructor(deviceRepository: DeviceRepository) {
    this.deviceRepository = deviceRepository;
    this.registerProtocolManagers();
  }
  
  private registerProtocolManagers() {
    this.protocolManagers.set(ConnectionType.BLE, new BLEDeviceManager());
    this.protocolManagers.set(ConnectionType.WIFI, new WiFiDeviceManager());
    // Register other protocol managers
  }
  
  async discoverDevices(connectionType?: ConnectionType): Promise<DeviceDiscoveryResult[]> {
    if (connectionType) {
      const manager = this.protocolManagers.get(connectionType);
      return manager ? manager.discoverDevices() : [];
    }
    
    // If no specific connection type, search all available protocols
    const allResults = await Promise.all(
      Array.from(this.protocolManagers.values()).map(manager => manager.discoverDevices())
    );
    
    return allResults.flat();
  }
  
  async connectDevice(deviceId: string, connectionType: ConnectionType): Promise<ConnectionResult> {
    const manager = this.protocolManagers.get(connectionType);
    if (!manager) {
      return { success: false, error: 'Unsupported connection type' };
    }
    
    const result = await manager.connectDevice(deviceId);
    if (result.success) {
      await this.deviceRepository.saveDevice(result.device);
    }
    
    return result;
  }
}
```

### Key Files
- `src/services/devices/DeviceConnectorService.ts`: Main service for device discovery and connection
- `src/services/devices/protocols/BLEManager.ts`: Bluetooth Low Energy implementation
- `src/services/devices/protocols/WiFiDeviceManager.ts`: WiFi device discovery and connection
- `src/services/devices/DeviceDataRepository.ts`: Storage and retrieval of device data
- `src/services/devices/DeviceEventEmitter.ts`: Event handling for device state changes
- `src/types/devices.ts`: Type definitions for smart devices and connections
- `src/screens/DeviceDiscoveryScreen.tsx`: UI for discovering and connecting devices
- `src/screens/DeviceDetailScreen.tsx`: UI for viewing device details and data

## Supported Device Types

### Smart Recycling Bins

| Device Type | Connection Method | Data Collected | Features |
|-------------|-------------------|----------------|----------|
| Smart Scale Bin | BLE | Weight, container type, fill level | Weight tracking, automatic logging, fill notifications |
| Connected Sorting Bin | WiFi | Sorting events, bin usage, contamination | Sorting guidance, contamination alerts, usage statistics |
| Commercial Compactors | Cloud API | Volume, compression cycles, pickup readiness | Scheduled pickups, capacity optimization, route planning |

### Energy Monitoring Devices

| Device Type | Connection Method | Data Collected | Features |
|-------------|-------------------|----------------|----------|
| Smart Plugs | WiFi/BLE | Energy consumption, device usage patterns | Device-specific tracking, usage optimization suggestions |
| Whole Home Monitors | WiFi | Total and device-specific energy usage | Energy usage patterns, efficiency recommendations, carbon tracking |
| Solar Integration | Cloud API | Solar production, grid usage, battery storage | Production optimization, consumption balancing, carbon offset tracking |

### Smart Appliances

| Device Type | Connection Method | Data Collected | Features |
|-------------|-------------------|----------------|----------|
| Smart Refrigerators | WiFi/Cloud API | Temperature, door events, inventory | Food waste prevention, efficient stocking suggestions |
| Connected Washing Machines | WiFi/Cloud API | Cycle usage, water consumption, energy usage | Eco-cycle recommendations, optimal load suggestions |
| Smart Dishwashers | WiFi/Cloud API | Cycle data, water usage, energy consumption | Water-saving tips, efficient program selection |

## Connection Protocols

### Bluetooth Low Energy (BLE)

- **Use Cases**: Battery-powered devices, direct local connections, devices without internet connectivity
- **Advantages**: Low power consumption, direct device-to-app communication, no internet dependency
- **Limitations**: Limited range, connection stability challenges, limited data throughput
- **Implementation Details**: 
  - Uses react-native-ble-plx for cross-platform BLE management
  - Background scanning and connection capabilities
  - Device service and characteristic discovery
  - Reconnection management and state persistence

### WiFi Direct

- **Use Cases**: High-bandwidth devices, local network devices, hub-connected systems
- **Advantages**: Higher data rates, more stable connections, longer range than BLE
- **Limitations**: Higher power consumption, setup complexity, network dependency
- **Implementation Details**:
  - Local network device discovery
  - WiFi provisioning for new devices
  - Connection security and validation
  - Firmware update capabilities

### Cloud-Connected Devices

- **Use Cases**: Third-party smart home devices, commercial equipment, complex systems
- **Advantages**: Always available data, remote access, integration with manufacturer ecosystems
- **Limitations**: Internet dependency, potential privacy concerns, platform lock-in
- **Implementation Details**:
  - OAuth integration with device platforms
  - Webhook receivers for device events
  - Polling strategies for platforms without webhooks
  - Data synchronization and conflict resolution

### Matter Protocol (Future)

- **Use Cases**: Cross-platform smart home devices supporting the new Matter standard
- **Advantages**: Standardized communication, simplified connectivity, broad device support
- **Limitations**: New protocol with evolving support, requires compatible hardware
- **Implementation Details**:
  - Matter controller implementation
  - Device commissioning process
  - Standard device type handling
  - Cross-platform compatibility

## Data Management

### Local Device Data Storage

- Device metadata cached in AsyncStorage
- Connection credentials stored in secure storage
- Recent data points stored for offline access
- Sync status tracking for conflict resolution

### Cloud Synchronization

- Two-way sync between device and cloud services
- Conflict resolution with timestamp-based priorities
- Selective sync for bandwidth and privacy optimization
- Batch operations for efficiency

### Data Processing Pipelines

1. **Raw Data Collection**: Device-specific data formats gathered from various protocols
2. **Normalization**: Conversion to standard internal data models
3. **Aggregation**: Combining data from multiple sources for comprehensive analysis
4. **Analysis**: Pattern recognition, anomaly detection, and recommendation generation
5. **Visualization**: Presenting insights through user-friendly charts and metrics

## Security and Privacy Considerations

### Device Security

- **Encryption**: All communication encrypted in transit
- **Authentication**: Secure device pairing with validation
- **Access Control**: User permission management for shared households
- **Firmware Validation**: Verification of device firmware integrity

### User Data Protection

- **Selective Sharing**: Granular controls for what device data is collected
- **Data Minimization**: Only necessary data collected and transmitted
- **Local Processing**: Edge computing where appropriate to minimize data transmission
- **Anonymization**: Personal identifiers removed from aggregated analysis data

## Performance Considerations

- **Optimization Techniques**: Efficient polling schedules, batched operations, selective data synchronization
- **Potential Bottlenecks**: Simultaneous device connections, large data set processing, background operation limitations
- **Battery Impact**: Optimized BLE scanning intervals, conditional WiFi usage, intelligent background processing

## Testing Strategy

- **Unit Tests**: Protocol handlers, data transformers, connection managers
- **Integration Tests**: End-to-end device connection flows, data retrieval pipelines
- **Test Devices**: Physical device test lab with representative devices from each category
- **Simulation Testing**: Mock devices for testing edge cases and error conditions

## Accessibility Considerations

- **Setup Assistance**: Guided setup flows with accessibility considerations
- **Alternative Interfaces**: Non-visual device management options
- **Status Indicators**: Multi-modal device status communication (visual, auditory, haptic)
- **Simple Controls**: Straightforward device management for all users

## Future Improvements

- Matter protocol support for standardized device communication
- Thread network integration for mesh device networking
- Machine learning for usage pattern recognition and personalized recommendations
- Voice control integration with connected devices
- Expanded device type support for specialized sustainability monitoring
- Hands-free operation through proximity sensors and gestures

## Related Documentation

- [Smart Home Integration Plan](./integration-plan.md)
- [Voice Assistant Integration](./voice-integration.md)
- [Data Privacy Guidelines](../../development/privacy-guidelines.md)
- [Bluetooth Connectivity Guide](../../development/bluetooth-connectivity.md) 