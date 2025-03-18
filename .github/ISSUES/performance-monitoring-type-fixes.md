# Performance Monitoring Type Fixes

## Current Status
The performance monitoring feature has several TypeScript type errors related to the Victory charts library. These errors are common when working with Victory charts in React Native, as the type definitions don't always perfectly match the runtime behavior.

## Issues to Address

### 1. Missing Type Definitions
- `VictoryVoronoiContainer` is not exported from 'victory-native'
- `VictoryLegend` is not exported from 'victory-native'

### 2. Type Mismatches
- `ChartData` interface has `x: number` but Victory components expect `x: string`
- `PerformanceStats` indexing with `MetricType` needs proper type mapping
- `datum` parameter in callbacks needs proper typing
- `style` prop on `VictoryAxis` components needs proper type definition
- `points` and `fill` properties in chart styles need proper type definitions

### 3. Color Scale Type
- `colorScale="qualitative"` needs to be properly typed as `string[]`

## Proposed Solutions

### 1. Type Definition Updates
```typescript
// Add to src/types/victory.d.ts
declare module 'victory-native' {
  export const VictoryVoronoiContainer: any;
  export const VictoryLegend: any;
}
```

### 2. Interface Updates
```typescript
// Update ChartData interface
interface ChartData {
  x: string | number;  // Allow both types
  y: number;
  label: string;
}

// Add type mapping for PerformanceStats
type MetricKey = keyof PerformanceStats;
type MetricType = 'memory' | 'network' | 'render' | 'frameRate' | 'interaction';
const metricMapping: Record<MetricType, MetricKey> = {
  memory: 'memoryUsage',
  network: 'networkLatency',
  render: 'renderTime',
  frameRate: 'frameRate',
  interaction: 'interactionDelay',
};
```

### 3. Component Updates
```typescript
// Update VictoryAxis style prop
<VictoryAxis
  style={{
    axis: { stroke: theme.colors.text },
    tickLabels: { fill: theme.colors.text },
  } as any}  // Temporary type assertion
/>

// Update VictoryLine/VictoryBar style prop
<VictoryLine
  style={{
    data: { 
      stroke: theme.colors.primary,
      fill: theme.colors.primary,
      fillOpacity: 0.2,
    } as any  // Temporary type assertion
  }}
/>
```

## Priority
Medium - These are type-level issues that don't affect runtime behavior but should be fixed for better type safety and developer experience.

## Dependencies
- victory-native
- @types/victory (if available)

## Notes
- Some type assertions may be necessary as temporary solutions
- Consider creating a custom type declaration file for victory-native
- May need to update to latest version of victory-native for better TypeScript support
- Consider contributing type fixes to the victory-native repository 