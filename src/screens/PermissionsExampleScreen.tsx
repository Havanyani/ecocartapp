import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/hooks/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

/**
 * Example screen demonstrating the usePermissions hook
 */
export default function PermissionsExampleScreen() {
  const { theme } = useTheme();
  const {
    permissions,
    isGranted,
    request,
    openSettings,
    showPermissionDialog
  } = usePermissions();

  // Get status icon based on permission status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return (
          <MaterialIcons
            name="check-circle"
            size={24}
            color={theme.colors.success}
          />
        );
      case 'denied':
        return (
          <MaterialIcons
            name="cancel"
            size={24}
            color={theme.colors.error}
          />
        );
      default:
        return (
          <MaterialIcons
            name="help"
            size={24}
            color={theme.colors.warning}
          />
        );
    }
  };

  // Render a permission item
  const renderPermissionItem = (
    type: 'camera' | 'location' | 'notifications' | 'mediaLibrary',
    label: string,
    description: string
  ) => {
    const status = permissions[type];
    
    return (
      <View
        style={[
          styles.permissionItem,
          { backgroundColor: theme.colors.cardBackground }
        ]}
      >
        <View style={styles.permissionHeader}>
          <View style={styles.permissionInfo}>
            {getStatusIcon(status)}
            <Text style={[styles.permissionLabel, { color: theme.colors.text }]}>
              {label}
            </Text>
          </View>
          <Text
            style={[
              styles.permissionStatus,
              {
                color:
                  status === 'granted'
                    ? theme.colors.success
                    : status === 'denied'
                    ? theme.colors.error
                    : theme.colors.textSecondary
              }
            ]}
          >
            {status === 'granted'
              ? 'Granted'
              : status === 'denied'
              ? 'Denied'
              : 'Not Determined'}
          </Text>
        </View>

        <Text style={[styles.permissionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => request(type)}
          >
            <Text style={styles.buttonText}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={() => showPermissionDialog(type)}
          >
            <Text style={styles.buttonText}>Show Dialog</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Permission Management
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Demonstrates usePermissions hook
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderPermissionItem(
          'camera',
          'Camera',
          'Required for AR scanning and taking pictures of recyclable items'
        )}

        {renderPermissionItem(
          'location',
          'Location',
          'Used to find nearby recycling centers and track your collection activities'
        )}

        {renderPermissionItem(
          'notifications',
          'Notifications',
          'Get reminders about recycling days and updates on eco points'
        )}

        {renderPermissionItem(
          'mediaLibrary',
          'Media Library',
          'Save and access photos of recyclable items'
        )}

        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
          onPress={openSettings}
        >
          <MaterialIcons name="settings" size={24} color="white" />
          <Text style={styles.settingsButtonText}>Open Device Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  permissionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  permissionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
}); 