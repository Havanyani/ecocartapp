/**
 * Update the SettingsScreen to add a navigation item to the BundleOptimizationScreen
 */

// ... existing code ...

// Add to the settings menu items

const settingsSections = [
  // ... existing sections ...
  {
    title: 'Development Tools',
    data: [
      // ... existing items ...
      {
        title: 'AI Performance Monitor',
        icon: 'analytics-outline',
        onPress: () => navigation.navigate('AIPerformanceMonitorScreen'),
      },
      {
        title: 'AI Benchmark Tool',
        icon: 'speedometer-outline',
        onPress: () => navigation.navigate('AIBenchmarkScreen'),
      },
      {
        title: 'Bundle Optimization',
        icon: 'code-slash-outline',
        onPress: () => navigation.navigate('BundleOptimization'),
      },
    ],
  },
  // ... other sections ...
]; 