# Energy Monitoring Integration

## Overview
This document details the implementation of energy monitoring features within EcoCart's smart home ecosystem. Energy monitoring enables users to track their household electricity consumption, identify opportunities for conservation, calculate their carbon footprint, and receive personalized recommendations for reducing energy usage and environmental impact.

## User-Facing Functionality
- **Primary Capabilities**: Whole-home and device-specific energy consumption tracking, carbon footprint calculation, energy usage patterns analysis, and personalized energy-saving recommendations
- **User Interface Components**: Energy dashboards, real-time usage monitors, historical comparison charts, device-specific consumption breakdowns, and efficiency recommendation cards
- **User Flow**: Users connect energy monitoring devices, view current and historical consumption data, receive insights, and act on personalized recommendations
- **Screenshots**: [Energy monitoring interface mockups to be added after design finalization]

## Technical Implementation

### Architecture
- **Design Pattern(s)**: Repository pattern for energy data, Strategy pattern for different monitoring devices, Observer pattern for real-time updates
- **Key Components**: EnergyMonitoringService, DeviceEnergyRepository, CarbonCalculationEngine, EnergyRecommendationEngine
- **Dependencies**: Device connection libraries, time-series database, analytics libraries, device manufacturer APIs

### Code Structure

```typescript
// Core interfaces
export interface EnergyReading {
  deviceId: string;
  timestamp: number;
  powerWatts: number;
  energyWattHours: number;
  duration: number;
  cost?: number;
  carbonKg?: number;
  metadata?: Record<string, any>;
}

export interface EnergyInsight {
  type: EnergyInsightType;
  device?: string;
  description: string;
  potentialSavingsKwh: number;
  potentialSavingsCost: number;
  potentialCarbonReduction: number;
  confidence: number;
  actionable: boolean;
  suggestedActions?: string[];
}

// Energy monitoring service
export class EnergyMonitoringService {
  private deviceRepository: DeviceRepository;
  private energyRepository: EnergyReadingRepository;
  private carbonCalculator: CarbonCalculator;
  private insightEngine: EnergyInsightEngine;
  
  constructor(
    deviceRepository: DeviceRepository,
    energyRepository: EnergyReadingRepository,
    carbonCalculator: CarbonCalculator,
    insightEngine: EnergyInsightEngine
  ) {
    this.deviceRepository = deviceRepository;
    this.energyRepository = energyRepository;
    this.carbonCalculator = carbonCalculator;
    this.insightEngine = insightEngine;
  }
  
  async getEnergyConsumption(options: EnergyQueryOptions): Promise<EnergyConsumptionResult> {
    const readings = await this.energyRepository.getReadings(options);
    
    const totalEnergy = readings.reduce((sum, reading) => sum + reading.energyWattHours, 0);
    const totalCost = readings.reduce((sum, reading) => sum + (reading.cost || 0), 0);
    const totalCarbon = readings.reduce((sum, reading) => sum + (reading.carbonKg || 0), 0);
    
    return {
      readings,
      summary: {
        totalEnergyKwh: totalEnergy / 1000,
        totalCost,
        totalCarbonKg: totalCarbon,
        period: {
          start: options.startTime,
          end: options.endTime
        }
      }
    };
  }
  
  async getDeviceBreakdown(options: EnergyQueryOptions): Promise<DeviceEnergyBreakdown[]> {
    const readings = await this.energyRepository.getReadings(options);
    
    // Group by device and calculate totals
    const deviceMap = new Map<string, DeviceEnergyBreakdown>();
    
    for (const reading of readings) {
      const existing = deviceMap.get(reading.deviceId) || {
        deviceId: reading.deviceId,
        deviceName: '',
        totalEnergyKwh: 0,
        totalCost: 0,
        totalCarbonKg: 0,
        percentage: 0
      };
      
      existing.totalEnergyKwh += reading.energyWattHours / 1000;
      existing.totalCost += reading.cost || 0;
      existing.totalCarbonKg += reading.carbonKg || 0;
      
      deviceMap.set(reading.deviceId, existing);
    }
    
    // Fill in device names and calculate percentages
    const devices = await this.deviceRepository.getDevices(
      Array.from(deviceMap.keys())
    );
    
    const totalEnergy = Array.from(deviceMap.values())
      .reduce((sum, device) => sum + device.totalEnergyKwh, 0);
    
    const result = Array.from(deviceMap.values()).map(breakdown => {
      const device = devices.find(d => d.id === breakdown.deviceId);
      breakdown.deviceName = device?.name || 'Unknown Device';
      breakdown.percentage = (breakdown.totalEnergyKwh / totalEnergy) * 100;
      return breakdown;
    });
    
    return result.sort((a, b) => b.totalEnergyKwh - a.totalEnergyKwh);
  }
  
  async getEnergyInsights(options: InsightQueryOptions): Promise<EnergyInsight[]> {
    const readings = await this.energyRepository.getReadings({
      startTime: options.startTime,
      endTime: options.endTime,
      deviceIds: options.deviceIds
    });
    
    return this.insightEngine.generateInsights(readings, options);
  }
  
  async recordReading(reading: EnergyReading): Promise<void> {
    // Calculate carbon if not provided
    if (reading.carbonKg === undefined) {
      reading.carbonKg = this.carbonCalculator.calculateCarbon(reading.energyWattHours);
    }
    
    await this.energyRepository.saveReading(reading);
    
    // Emit event for real-time updates
    this.eventEmitter.emit('newEnergyReading', reading);
  }
}

// Carbon calculation engine
export class CarbonCalculator {
  private gridIntensityProvider: GridIntensityProvider;
  
  constructor(gridIntensityProvider: GridIntensityProvider) {
    this.gridIntensityProvider = gridIntensityProvider;
  }
  
  async calculateCarbon(wattHours: number, timestamp?: number, location?: GeoLocation): Promise<number> {
    // Get the carbon intensity for this location and time
    const intensity = await this.gridIntensityProvider.getIntensity(timestamp, location);
    
    // Convert watt-hours to kilowatt-hours and multiply by grid intensity
    const kWh = wattHours / 1000;
    return kWh * intensity.gCO2PerKwh / 1000; // Result in kg of CO2
  }
}
```

### Key Files
- `src/services/energy/EnergyMonitoringService.ts`: Main service for energy data management
- `src/services/energy/CarbonCalculator.ts`: Carbon footprint calculation based on energy usage
- `src/services/energy/EnergyInsightEngine.ts`: Analysis and recommendation generation
- `src/repositories/EnergyReadingRepository.ts`: Storage and retrieval of energy readings
- `src/providers/GridIntensityProvider.ts`: Real-time carbon intensity data for different regions
- `src/types/energy.ts`: Type definitions for energy monitoring
- `src/screens/EnergyDashboardScreen.tsx`: Main UI for energy visualization
- `src/screens/DeviceEnergyDetailScreen.tsx`: Device-specific energy analysis

## Supported Energy Monitoring Approaches

### Whole-Home Monitoring

| Approach | Data Source | Granularity | Features |
|----------|-------------|-------------|----------|
| Smart Meter Integration | Utility smart meter | Household total, 15-60 min intervals | Historical comparison, baseline tracking, utility bill verification |
| Dedicated Monitor | Circuit-level energy monitor | Household total, real-time and circuit-level | Real-time monitoring, circuit identification, anomaly detection |
| Smart Plugs Aggregation | Network of smart plugs | Device-specific, real-time | Device-level tracking, automation triggers, usage patterns |

### Device-Specific Monitoring

| Approach | Implementation | Advantages | Limitations |
|----------|----------------|------------|-------------|
| Direct Measurement | Smart plugs on individual devices | High accuracy, real-time data, control capability | Requires hardware for each device, setup complexity |
| Smart Appliance API | Integration with smart appliance manufacturer APIs | Native integration, detailed operation data | Limited to supported brands, reliance on cloud services |
| Disaggregation | ML-based energy signature identification | No additional hardware, whole-home coverage | Lower accuracy, limited device types, training requirements |

### Renewable Energy Integration

| Energy Source | Integration Method | Data Collected | Features |
|---------------|-------------------|----------------|----------|
| Solar Panels | Inverter API/Smart meter | Production, consumption, grid export | Production tracking, consumption optimization, ROI calculation |
| Home Battery | Battery management system API | Charge/discharge, capacity, efficiency | Charge optimization, cycle tracking, capacity health |
| EV Charging | EV charger API | Charging patterns, energy used, vehicle status | Scheduling optimization, renewable charging prioritization |

## Data Management

### Collection Methods

- **Real-time Streaming**: WebSocket connections for devices supporting real-time data
- **Polling**: Regular data retrieval for devices with API but no push capabilities
- **Batch Processing**: Daily/hourly data imports from utility providers
- **Manual Entry**: User-provided readings for non-connected monitoring

### Data Storage Strategy

- **Time-series Storage**: Optimized for high-frequency energy data
- **Data Aggregation**: Automatic roll-ups at different time scales (minute, hour, day, month)
- **Retention Policies**: Full resolution for recent data, aggregated for historical
- **Data Compression**: Specialized compression for energy data patterns

### Analysis Capabilities

- **Pattern Recognition**: Identifying usage patterns and anomalies
- **Forecasting**: Predicting future consumption based on historical data and weather
- **Disaggregation**: Identifying individual appliances from aggregate data
- **Comparative Analysis**: Benchmarking against similar households

## Integration with Smart Home Ecosystem

### Voice Assistant Commands

| Command Category | Example Commands | Response Type |
|------------------|------------------|---------------|
| Consumption Queries | "How much energy did I use today?" | Verbal summary with optional visual card |
| Comparative Questions | "Is my energy usage higher than last month?" | Comparative analysis with trend information |
| Device-Specific | "How much energy does my refrigerator use?" | Device consumption data and efficiency rating |
| Recommendations | "How can I reduce my energy bill?" | Personalized energy-saving tips |

### Automation Triggers

- **High Consumption Alert**: Notification when usage exceeds thresholds
- **Vampire Power Detection**: Identify standby power usage during inactive periods
- **Peak Rate Avoidance**: Shift device operation away from peak rate periods
- **Renewable Optimization**: Schedule high-consumption activities during solar production peaks

### Dashboard Integration

- Real-time energy usage widget for home screen
- Carbon footprint tracker in sustainability dashboard
- Energy cost projections in financial overview
- Device efficiency ratings in device management screens

## User Experience Features

### Visualization Tools

- **Real-time Meter**: Live power consumption gauge
- **Usage Timelines**: Interactive charts of consumption over time
- **Heat Maps**: Time-of-day usage patterns visualization
- **Device Breakdown**: Pie charts and treemaps of consumption by device or category

### Insights and Recommendations

- **Anomaly Detection**: Highlighting unusual consumption patterns
- **Efficiency Tips**: Customized recommendations based on usage patterns
- **ROI Calculations**: Cost-benefit analysis of energy-efficient upgrades
- **Behavioral Nudges**: Gamified suggestions for energy-saving habits

### User Notifications

- **Threshold Alerts**: Notifications when consumption exceeds user-defined thresholds
- **Bill Projections**: Mid-cycle estimates of upcoming utility bills
- **Savings Opportunities**: Alerts for potential energy waste
- **Goal Progress**: Updates on progress toward energy reduction goals

## Performance Considerations

- **Optimization Techniques**: Efficient polling schedules, data aggregation, selective sync
- **Potential Bottlenecks**: High-frequency data collection, real-time analysis processing
- **Resource Impact**: Background processing optimization, scheduled data sync during idle periods

## Testing Strategy

- **Unit Tests**: Data processing functions, carbon calculations, recommendation algorithms
- **Integration Tests**: Device connectivity, data flow pipelines, analytics processing
- **Mock Energy Data**: Synthetic usage patterns for testing insights engine
- **Performance Testing**: High-volume data handling, concurrent device connections

## Accessibility Considerations

- **Data Representations**: Multiple visualization options (charts, numbers, color-coded)
- **Energy Alerts**: Multi-channel notifications (visual, audio, haptic)
- **Screen Reader Support**: Semantic markup for all energy data and charts
- **Cognitive Clarity**: Simplified explanations of complex energy concepts

## Future Improvements

- Machine learning for more accurate device identification and disaggregation
- Predictive maintenance alerts based on abnormal energy signatures
- Integration with community energy sharing and grid services
- Real-time carbon intensity-based device scheduling
- Expanded renewable energy optimization and forecasting
- Virtual energy audit with customized upgrade recommendations

## Related Documentation

- [Smart Home Integration Plan](./integration-plan.md)
- [Smart Device Connection](./device-connection.md)
- [Sustainability Analytics](../analytics/sustainability-metrics.md)
- [User Data Privacy](../../development/privacy-guidelines.md) 