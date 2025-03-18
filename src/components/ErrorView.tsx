import { HapticButton } from '@/components/HapticButton';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  style?: ViewStyle;
}

export function ErrorView({ message, onRetry, style }: ErrorViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <IconSymbol
        name="alert-circle"
        size={48}
        color={theme.colors.error}
      />
      <ThemedText style={styles.message}>{message}</ThemedText>
      <HapticButton
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
        accessibilityLabel="Retry"
      >
        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
      </HapticButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 