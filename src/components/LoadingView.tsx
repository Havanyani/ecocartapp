import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

interface LoadingViewProps {
  style?: ViewStyle;
}

export function LoadingView({ style }: LoadingViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 