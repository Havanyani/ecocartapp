import { useTheme } from '@/hooks/useTheme';
import { RoutePerformanceScreen } from '@/screens/RoutePerformanceScreen';
import { StyleSheet, View } from 'react-native';

export default function PerformanceScreenWrapper() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RoutePerformanceScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 