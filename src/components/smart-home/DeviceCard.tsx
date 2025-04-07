import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export interface DeviceCardProps {
  id: string;
  name: string;
  type: string;
  room?: string;
  isOnline: boolean;
  isOn?: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  primaryValue?: string | number;
  primaryValueUnit?: string;
  secondaryValue?: string | number;
  secondaryValueUnit?: string;
  icon: string;
  isLoading?: boolean;
  isPrimary?: boolean;
  onPress: (id: string) => void;
  onToggle?: (id: string, newState: boolean) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  id,
  name,
  type,
  room,
  isOnline,
  isOn = false,
  batteryLevel,
  signalStrength,
  primaryValue,
  primaryValueUnit,
  secondaryValue,
  secondaryValueUnit,
  icon,
  isLoading = false,
  isPrimary = false,
  onPress,
  onToggle
}) => {
  const { theme } = useTheme();
  
  const handleToggle = (e: any) => {
    e.stopPropagation();
    if (onToggle && isOnline && !isLoading) {
      onToggle(id, !isOn);
    }
  };

  const getBatteryIcon = () => {
    if (!batteryLevel && batteryLevel !== 0) return null;
    
    if (batteryLevel <= 20) return 'battery-dead-outline';
    if (batteryLevel <= 50) return 'battery-half-outline';
    if (batteryLevel <= 80) return 'battery-charging-outline';
    return 'battery-full-outline';
  };
  
  const getSignalIcon = () => {
    if (!signalStrength && signalStrength !== 0) return null;
    
    if (signalStrength <= 25) return 'wifi-outline';
    if (signalStrength <= 50) return 'wifi-1';
    if (signalStrength <= 75) return 'wifi-2';
    return 'wifi';
  };
  
  const getDeviceIcon = () => {
    if (icon) return icon;
    
    // Fallback icons based on device type
    switch (type.toLowerCase()) {
      case 'light':
      case 'bulb':
        return 'bulb-outline';
      case 'thermostat':
        return 'thermometer-outline';
      case 'speaker':
        return 'musical-notes-outline';
      case 'camera':
        return 'videocam-outline';
      case 'sensor':
        return 'analytics-outline';
      case 'smart bin':
      case 'recycling bin':
        return 'trash-bin-outline';
      case 'energy monitor':
        return 'flash-outline';
      default:
        return 'home-outline';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          opacity: isOnline ? 1 : 0.6,
          borderColor: isPrimary ? theme.colors.primary : 'transparent',
        }
      ]}
      onPress={() => onPress(id)}
      disabled={isLoading}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: isOn && isOnline 
                  ? theme.colors.primaryLight 
                  : 'rgba(0, 0, 0, 0.05)' 
              }
            ]}
          >
            <Ionicons 
              name={getDeviceIcon()} 
              size={24} 
              color={isOn && isOnline ? theme.colors.primary : theme.colors.secondaryText} 
            />
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            onToggle && (
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { 
                    backgroundColor: isOn && isOnline 
                      ? theme.colors.primary 
                      : 'rgba(0, 0, 0, 0.1)' 
                  }
                ]}
                onPress={handleToggle}
                disabled={!isOnline}
              >
                <View 
                  style={[
                    styles.toggleIndicator, 
                    { 
                      backgroundColor: theme.colors.white,
                      transform: [{ translateX: isOn && isOnline ? 12 : 0 }] 
                    }
                  ]} 
                />
              </TouchableOpacity>
            )
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text 
            style={[
              styles.deviceName, 
              { 
                color: isOnline ? theme.colors.text : theme.colors.secondaryText 
              }
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
          
          <Text 
            style={[styles.deviceType, { color: theme.colors.secondaryText }]}
            numberOfLines={1}
          >
            {type} {room ? `• ${room}` : ''}
          </Text>
          
          {(primaryValue !== undefined || secondaryValue !== undefined) && (
            <View style={styles.valuesContainer}>
              {primaryValue !== undefined && (
                <View style={styles.valueItem}>
                  <Text 
                    style={[
                      styles.valueText, 
                      { 
                        color: isOnline 
                          ? theme.colors.primary 
                          : theme.colors.secondaryText 
                      }
                    ]}
                  >
                    {primaryValue}
                    {primaryValueUnit && (
                      <Text style={styles.unitText}>
                        {primaryValueUnit}
                      </Text>
                    )}
                  </Text>
                </View>
              )}
              
              {secondaryValue !== undefined && (
                <View style={styles.valueItem}>
                  <Text 
                    style={[
                      styles.secondaryValueText, 
                      { color: theme.colors.secondaryText }
                    ]}
                  >
                    {secondaryValue}
                    {secondaryValueUnit && (
                      <Text style={styles.secondaryUnitText}>
                        {secondaryValueUnit}
                      </Text>
                    )}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.statusContainer}>
          {!isOnline && (
            <Text style={[styles.offlineText, { color: theme.colors.error }]}>
              Offline
            </Text>
          )}
          
          <View style={styles.indicators}>
            {getBatteryIcon() && (
              <View style={styles.indicator}>
                <Ionicons 
                  name={getBatteryIcon()} 
                  size={14} 
                  color={
                    batteryLevel && batteryLevel <= 20 
                      ? theme.colors.error 
                      : theme.colors.secondaryText
                  } 
                />
                {batteryLevel !== undefined && (
                  <Text style={[styles.indicatorText, { color: theme.colors.secondaryText }]}>
                    {batteryLevel}%
                  </Text>
                )}
              </View>
            )}
            
            {getSignalIcon() && (
              <View style={styles.indicator}>
                <Ionicons 
                  name={getSignalIcon()} 
                  size={14} 
                  color={
                    signalStrength && signalStrength <= 25 
                      ? theme.colors.warning 
                      : theme.colors.secondaryText
                  } 
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
  },
  toggleIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  infoContainer: {
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  deviceType: {
    fontSize: 12,
    marginBottom: 8,
  },
  valuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  valueItem: {
    marginRight: 12,
    marginTop: 4,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  secondaryValueText: {
    fontSize: 14,
  },
  secondaryUnitText: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  indicatorText: {
    fontSize: 10,
    marginLeft: 2,
  },
}); 