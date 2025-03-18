import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

interface AccessibleErrorViewProps {
  error?: Error;
  onReset: () => void;
}

export function AccessibleErrorView({ error, onReset }: AccessibleErrorViewProps) {
  const theme = useTheme();

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility('An error has occurred. Try again button is available.');
  }, []);

  return (
    <ThemedView 
      style={styles.container}
      accessibilityLabel="Error view"
      accessibilityRole="alert"
    >
      <IconSymbol name="alert-circle" size={48} color="#d32f2f" />
      <ThemedText style={[styles.title, { color: theme.text.primary.color }]}>Something went wrong</ThemedText>
      <ThemedText style={[styles.message, { color: theme.text.secondary.color }]}>{error?.message}</ThemedText>

      <HapticTab
        style={styles.button}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        accessibilityHint="Attempts to recover from the error"
      >
        <ThemedText style={styles.buttonText}>
          <IconSymbol name="refresh" size={20} color="#fff" />
          Try Again
        </ThemedText>
      </HapticTab>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 