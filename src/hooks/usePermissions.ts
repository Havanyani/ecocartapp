import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';

export type PermissionType = 'camera' | 'location' | 'notifications' | 'mediaLibrary';
export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'limited';

export interface PermissionState {
  camera: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
  mediaLibrary: PermissionStatus;
}

export interface UsePermissionsReturn {
  /**
   * Current state of all permissions
   */
  permissions: PermissionState;
  
  /**
   * Check if a specific permission is granted
   */
  isGranted: (type: PermissionType) => boolean;
  
  /**
   * Request a specific permission
   */
  request: (type: PermissionType) => Promise<boolean>;
  
  /**
   * Check all permissions at once
   */
  checkAllPermissions: () => Promise<void>;
  
  /**
   * Open device settings to manage permissions
   */
  openSettings: () => Promise<void>;
  
  /**
   * Shows a dialog explaining why a permission is needed
   */
  showPermissionDialog: (
    type: PermissionType, 
    title?: string, 
    message?: string
  ) => Promise<boolean>;
}

/**
 * Hook for centralized permission management
 */
export function usePermissions(): UsePermissionsReturn {
  // Initialize permission states as undetermined
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'undetermined',
    location: 'undetermined',
    notifications: 'undetermined',
    mediaLibrary: 'undetermined',
  });

  // Use the camera permissions hook from expo-camera
  const [cameraPermissionInfo, requestCameraPermission] = useCameraPermissions();

  // Check if a permission type is granted
  const isGranted = useCallback(
    (type: PermissionType): boolean => {
      return permissions[type] === 'granted';
    },
    [permissions]
  );

  // Check camera permission using the hook
  const checkCameraPermission = useCallback(async (): Promise<PermissionStatus> => {
    if (!cameraPermissionInfo) return 'undetermined';
    return cameraPermissionInfo.granted ? 'granted' : 
           cameraPermissionInfo.status === 'denied' ? 'denied' : 'undetermined';
  }, [cameraPermissionInfo]);

  // Check location permission
  const checkLocationPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'undetermined';
    }
  };

  // Check notifications permission
  const checkNotificationsPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error checking notifications permission:', error);
      return 'undetermined';
    }
  };

  // Check media library permission
  const checkMediaLibraryPermission = async (): Promise<PermissionStatus> => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return 'undetermined';
    }
  };

  // Check all permissions
  const checkAllPermissions = useCallback(async (): Promise<void> => {
    const cameraStatus = await checkCameraPermission();
    const locationStatus = await checkLocationPermission();
    const notificationsStatus = await checkNotificationsPermission();
    const mediaLibraryStatus = await checkMediaLibraryPermission();

    setPermissions({
      camera: cameraStatus,
      location: locationStatus,
      notifications: notificationsStatus,
      mediaLibrary: mediaLibraryStatus,
    });
  }, [checkCameraPermission]);

  // Check permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions, cameraPermissionInfo]);

  // Request a specific permission
  const request = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      let status: PermissionStatus = 'undetermined';

      switch (type) {
        case 'camera':
          const result = await requestCameraPermission();
          status = result.granted ? 'granted' : 'denied';
          break;
        case 'location':
          const locationPermission = await Location.requestForegroundPermissionsAsync();
          status = locationPermission.status;
          break;
        case 'notifications':
          const notificationPermission = await Notifications.requestPermissionsAsync();
          status = notificationPermission.status;
          break;
        case 'mediaLibrary':
          const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
          status = mediaLibraryPermission.status;
          break;
      }

      // Update state for this specific permission
      setPermissions(prev => ({
        ...prev,
        [type]: status,
      }));

      return status === 'granted';
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return false;
    }
  }, [requestCameraPermission]);

  // Open device settings
  const openSettings = useCallback(async (): Promise<void> => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }, []);

  // Show a permission dialog
  const showPermissionDialog = useCallback(
    async (
      type: PermissionType,
      title = 'Permission Required',
      message?: string
    ): Promise<boolean> => {
      // Define default messages for each permission type
      const defaultMessages: Record<PermissionType, string> = {
        camera: 'We need camera access to scan recycling containers',
        location: 'Location access is needed to track your recycling activities',
        notifications: 'Notifications help you stay updated on recycling opportunities',
        mediaLibrary: 'Media library access is needed to save and retrieve images',
      };

      const permissionMessage = message || defaultMessages[type];

      return new Promise((resolve) => {
        Alert.alert(
          title,
          permissionMessage,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Open Settings',
              onPress: async () => {
                await openSettings();
                resolve(false);
              },
            },
            {
              text: 'Continue',
              onPress: async () => {
                const granted = await request(type);
                resolve(granted);
              },
            },
          ],
          { cancelable: false }
        );
      });
    },
    [request, openSettings]
  );

  return {
    permissions,
    isGranted,
    request,
    checkAllPermissions,
    openSettings,
    showPermissionDialog,
  };
} 