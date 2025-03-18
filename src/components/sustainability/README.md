# Sustainability Components

This directory contains components related to environmental impact visualizations and sustainability metrics tracking in the EcoCart application.

## Overview

The sustainability components provide users with visualizations and metrics about their environmental impact through recycling activities. These components transform raw recycling data into meaningful insights about CO2 reduction, water savings, and other environmental benefits.

## Components

### ImpactMetrics

Displays quantifiable environmental impact statistics based on user recycling activities.

- **Usage**: Used on profile screens and dashboards to show personal impact.
- **Props**: 
  - `userId`: The user ID to fetch impact data for
  - `timeFrame`: Optional time frame filter ('week', 'month', 'year', 'all')
  - `showComparison`: Whether to show comparison with average user
  - `compact`: Boolean to display a compact version
- **Example**:
  ```tsx
  <ImpactMetrics userId="user123" timeFrame="month" showComparison={true} />
  ```

### SustainabilityMetrics

Provides a detailed breakdown of sustainability achievements with multiple visualization options.

- **Usage**: Used in dedicated sustainability screens to display comprehensive metrics.
- **Props**:
  - `data`: Impact data object
  - `visualizationType`: Type of visualization ('chart', 'cards', 'timeline')
  - `interactive`: Whether the component allows user interaction
- **Example**:
  ```tsx
  <SustainabilityMetrics 
    data={userData.impactData} 
    visualizationType="chart" 
    interactive={true} 
  />
  ```

### ImpactVisualization

Renders visual representations of environmental impact using various chart types.

- **Usage**: Used within other sustainability components or standalone to visualize impact.
- **Props**:
  - `data`: The impact data to visualize
  - `chartType`: Type of chart ('bar', 'line', 'pie', 'area')
  - `theme`: Visual theme for the charts
  - `animationDuration`: Duration of entrance animations
- **Example**:
  ```tsx
  <ImpactVisualization 
    data={recyclingData} 
    chartType="bar" 
    theme="light" 
    animationDuration={500} 
  />
  ```

### AdvancedImpactVisuals

Provides more complex and interactive visualizations for detailed environmental impact analysis.

- **Usage**: Used in analytics dashboards for deeper insights.
- **Props**:
  - `dataset`: Complex data structure with multiple metrics
  - `comparisonType`: Type of comparison ('historical', 'community', 'global')
  - `interactiveFeatures`: Array of enabled interactive features
  - `exportOptions`: Data export configuration
- **Example**:
  ```tsx
  <AdvancedImpactVisuals 
    dataset={analyticsData} 
    comparisonType="community" 
    interactiveFeatures={['filtering', 'sorting', 'zooming']} 
    exportOptions={{ formats: ['pdf', 'csv'] }} 
  />
  ```

## Integration

The sustainability components integrate with the following services:

1. `EnvironmentalImpactService` - For calculating impact metrics
2. `RecyclingStatsService` - For retrieving recycling history
3. `CommunityComparisonService` - For comparing user metrics against community averages

## Styling

These components use the application's theme context for consistent styling:

```tsx
import { useTheme } from '@/hooks/useTheme';

const Component = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Component content */}
    </View>
  );
};
```

## Best Practices

1. Always provide alternative text descriptions for visual charts to maintain accessibility
2. Use color schemes that are distinguishable for users with color vision deficiencies
3. Include loading states and error handling
4. Optimize chart rendering for performance, especially with large datasets
5. Use consistent units and conversion factors across all sustainability components

## Related Documentation

- [Environmental Impact Sharing](../../docs/features/community/environmental-impact-sharing.md)
- [Analytics Dashboard](../../docs/features/analytics-dashboard.md)
- [Sustainability Metrics API](../../docs/api/sustainability-metrics.md) 