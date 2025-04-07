/**
 * OfflineStatusIndicator.tsx
 * 
 * A component that displays the current network/offline status
 * and provides a button to manually trigger synchronization.
 */

import useOfflineData from '@/hooks/useOfflineData';
import { colors } from '@/theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OfflineStatusIndicatorProps {
  showSyncButton?: boolean;
  showPendingCount?: boolean;
  expandedByDefault?: boolean;
  position?: 'top' | 'bottom';
}

export default function OfflineStatusIndicator({
  showSyncButton = true,
  showPendingCount = true,
  expandedByDefault = false,
  position = 'top'
}: OfflineStatusIndicatorProps) {
  const { 
    offlineStatus, 
    isSyncing, 
    isOffline, 
    pendingOperationsCount, 
    forceSyncData 
  } = useOfflineData();
  
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [showBanner, setShowBanner] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const heightAnim = React.useRef(new Animated.Value(expandedByDefault ? 1 : 0)).current;
  
  // Start pulsing animation when syncing
  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pulseAnim]);
  
  // Animate expansion/collapse
  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }).start();
  }, [expanded, heightAnim]);
  
  // Show banner when offline or have pending operations
  useEffect(() => {
    setShowBanner(isOffline || pendingOperationsCount > 0);
  }, [isOffline, pendingOperationsCount]);
  
  // Handle sync button press
  const handleSyncPress = async () => {
    await forceSyncData();
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  if (!showBanner) {
    return null;
  }
  
  // Determine the status text and color
  let statusText = 'Online';
  let statusColor = colors.success;
  let statusIcon = 'cloud-done';
  
  if (isOffline) {
    statusText = 'Offline';
    statusColor = colors.error;
    statusIcon = 'cloud-off';
  } else if (isSyncing) {
    statusText = 'Syncing...';
    statusColor = colors.warning;
    statusIcon = 'sync';
  } else if (pendingOperationsCount > 0) {
    statusText = 'Pending updates';
    statusColor = colors.primary;
    statusIcon = 'update';
  }
  
  // Calculate container position styles
  const containerPositionStyle = position === 'top' 
    ? { top: 0 } 
    : { bottom: 0 };
  
  return (
    <View style={[styles.container, containerPositionStyle]}>
      <TouchableOpacity 
        style={[styles.banner, { backgroundColor: statusColor }]}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialIcons name={statusIcon} size={24} color="white" />
        </Animated.View>
        <Text style={styles.statusText}>{statusText}</Text>
        
        {showPendingCount && pendingOperationsCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pendingOperationsCount}</Text>
          </View>
        )}
        
        <MaterialIcons 
          name={expanded ? 'expand-less' : 'expand-more'} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.expandedView,
          { 
            height: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 80] // Adjust based on content
            }),
            opacity: heightAnim,
            backgroundColor: statusColor
          }
        ]}
      >
        <Text style={styles.detailsText}>
          {isOffline ? 'Working offline. Changes will sync when online.' : 
            isSyncing ? 'Syncing your changes with the server...' : 
            pendingOperationsCount > 0 ? `${pendingOperationsCount} operations pending sync` : 
            'All changes are synced'}
        </Text>
        
        {showSyncButton && !isOffline && (
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={handleSyncPress}
            disabled={isSyncing || pendingOperationsCount === 0}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  countText: {
    color: colors.dark,
    fontWeight: '700',
    fontSize: 12,
  },
  expandedView: {
    padding: 16,
    overflow: 'hidden',
  },
  detailsText: {
    color: 'white',
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 