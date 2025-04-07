import { useTheme } from '@/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIBenchmarkScreen from './ai-benchmark';
import AIConfigScreen from './ai-config';
import AIPerformanceScreen from './ai-performance';
import BundleOptimizationScreen from './bundle-optimization';
import EnvironmentalImpactScreen from './environmental-impact';
import AnalyticsDashboard from './index';
import TreeShakingScreen from './tree-shaking';

const Stack = createNativeStackNavigator();

export default function AnalyticsLayout() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        component={AnalyticsDashboard}
        options={{
          title: 'Analytics Dashboard',
        }}
      />
      <Stack.Screen
        name="environmental-impact"
        component={EnvironmentalImpactScreen}
        options={{
          title: 'Environmental Impact',
        }}
      />
      <Stack.Screen
        name="ai-config"
        component={AIConfigScreen}
        options={{
          title: 'AI Configuration',
        }}
      />
      <Stack.Screen
        name="ai-performance"
        component={AIPerformanceScreen}
        options={{
          title: 'AI Performance',
        }}
      />
      <Stack.Screen
        name="ai-benchmark"
        component={AIBenchmarkScreen}
        options={{
          title: 'AI Benchmark',
        }}
      />
      <Stack.Screen
        name="bundle-optimization"
        component={BundleOptimizationScreen}
        options={{
          title: 'Bundle Optimization',
        }}
      />
      <Stack.Screen
        name="tree-shaking"
        component={TreeShakingScreen}
        options={{
          title: 'Tree Shaking',
        }}
      />
    </Stack.Navigator>
  );
} 