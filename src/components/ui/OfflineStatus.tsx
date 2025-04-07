import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useOfflineState } from '@/hooks/useOfflineState';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface OfflineStatusProps {
  onRetry?: () => void;
}

export function OfflineStatus({ onRetry }: OfflineStatusProps) {
  const theme = useTheme();
  const { isConnected, pendingActions, failedActions } = useOfflineState();

  if (isConnected && pendingActions === 0 && failedActions === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {!isConnected ? (
        <View style={styles.offlineContainer}>
          <IconSymbol name="cloud-offline" size={24} color={theme.theme.colors.error} />
          <ThemedText style={styles.offlineText}>You're offline</ThemedText>
        </View>
      ) : (
        <>
          {pendingActions > 0 && (
            <View style={styles.pendingContainer}>
              <IconSymbol name="cloud-upload" size={24} color={theme.theme.colors.warning} />
              <ThemedText style={styles.pendingText}>
                {pendingActions} {pendingActions === 1 ? 'action' : 'actions'} pending sync
              </ThemedText>
            </View>
          )}
          {failedActions > 0 && (
            <TouchableOpacity
              style={styles.failedContainer}
              onPress={onRetry}
            >
              <IconSymbol name="alert-circle" size={24} color={theme.theme.colors.error} />
              <ThemedText style={styles.failedText}>
                {failedActions} {failedActions === 1 ? 'action' : 'actions'} failed
              </ThemedText>
            </TouchableOpacity>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  failedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  failedText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 