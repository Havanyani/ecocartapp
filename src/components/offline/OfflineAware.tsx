import { OfflineManager, OfflineStatus } from '@/services/OfflineManager';
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentType, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OfflineAwareProps {
  children?: React.ReactNode;
  showIndicator?: boolean;
  emptyComponent?: React.ReactNode;
  retryEnabled?: boolean;
  onRetry?: () => void;
}

/**
 * OfflineAware component
 * 
 * A wrapper component that makes its children aware of the app's offline status.
 * It shows appropriate UI when the app is offline and provides retry functionality.
 */
export function OfflineAware({
  children,
  showIndicator = true,
  emptyComponent,
  retryEnabled = true,
  onRetry
}: OfflineAwareProps) {
  const [status, setStatus] = useState<OfflineStatus>('online');
  
  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    const unsubscribe = offlineManager.subscribeToStatusChanges(setStatus);
    
    // Set initial status
    setStatus(offlineManager.getStatus());
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      const offlineManager = OfflineManager.getInstance();
      offlineManager.forceSyncData();
    }
  };
  
  // If we're online, just render children
  if (status === 'online') {
    return <>{children}</>;
  }
  
  // If we're syncing, show children with a syncing indicator
  if (status === 'syncing') {
    return (
      <>
        {showIndicator && (
          <View style={styles.syncIndicator}>
            <Ionicons name="sync" size={16} color="#FFFFFF" />
            <Text style={styles.syncText}>Syncing data...</Text>
          </View>
        )}
        {children}
      </>
    );
  }
  
  // If we're offline and there's an empty component, show it
  if (emptyComponent) {
    return (
      <>
        {showIndicator && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>You're offline</Text>
            {retryEnabled && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {emptyComponent}
      </>
    );
  }
  
  // Otherwise, show children with an offline indicator
  return (
    <>
      {showIndicator && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
          <Text style={styles.offlineText}>You're offline</Text>
          {retryEnabled && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </>
  );
}

/**
 * withOfflineAwareness higher-order component
 * 
 * Wraps a component with offline awareness capabilities.
 * 
 * @param Component The component to wrap
 * @param options Configuration options for offline behavior
 */
export function withOfflineAwareness<P extends object>(
  Component: ComponentType<P>,
  options: Omit<OfflineAwareProps, 'children'> = {}
) {
  return function OfflineAwareComponent(props: P) {
    return (
      <OfflineAware {...options}>
        <Component {...props} />
      </OfflineAware>
    );
  };
}

const styles = StyleSheet.create({
  offlineIndicator: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  syncIndicator: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  syncText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  retryButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
}); 