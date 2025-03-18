import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { isFeatureEnabled } from '@/config/featureFlags';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function PaymentScreen() {
  const theme = useTheme();

  if (!isFeatureEnabled('enablePayments')) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.disabledContainer}>
          <IconSymbol name="credit-card-off" size={64} color={theme.colors.text.secondary} />
          <ThemedText style={styles.disabledTitle}>Payments Disabled</ThemedText>
          <ThemedText style={styles.disabledMessage}>
            EcoCart is currently focused on waste collection and rewards. Payment features will be available soon!
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText>Payment Screen (Coming Soon)</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  disabledMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
}); 