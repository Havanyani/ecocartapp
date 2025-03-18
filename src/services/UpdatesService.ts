/**
 * Updates Service - Handles Over-The-Air (OTA) updates via Expo Updates
 */
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { isProduction } from '@/config/environments';

/**
 * Result of checking for updates
 */
export type UpdateCheckResult = {
  isAvailable: boolean;
  manifest?: Updates.Manifest;
  error?: Error;
};

/**
 * Service for handling OTA updates
 */
export class UpdatesService {
  /**
   * Check if an update is available
   * 
   * @returns Promise resolving to update check result
   */
  static async checkForUpdate(): Promise<UpdateCheckResult> {
    if (!isUpdateAvailable()) {
      return { isAvailable: false };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      return { isAvailable: update.isAvailable, manifest: update.manifest };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { isAvailable: false, error: error as Error };
    }
  }

  /**
   * Fetch and install an available update
   * 
   * @returns Promise resolving to boolean indicating success
   */
  static async fetchAndInstallUpdate(): Promise<boolean> {
    if (!isUpdateAvailable()) {
      return false;
    }

    try {
      const { isAvailable } = await this.checkForUpdate();
      
      if (!isAvailable) {
        return false;
      }

      // Fetch the update
      await Updates.fetchUpdateAsync();
      
      // Reload the app to apply the update
      await Updates.reloadAsync();
      
      return true;
    } catch (error) {
      console.error('Error installing update:', error);
      return false;
    }
  }

  /**
   * Prompt the user to update the app
   * 
   * @param force Whether to force the update without user confirmation
   * @returns Promise resolving to boolean indicating if update was applied
   */
  static async promptForUpdate(force = false): Promise<boolean> {
    const { isAvailable, error } = await this.checkForUpdate();
    
    if (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
    
    if (!isAvailable) {
      return false;
    }
    
    if (force) {
      return this.fetchAndInstallUpdate();
    }
    
    return new Promise((resolve) => {
      Alert.alert(
        'Update Available',
        'A new version of the app is available. Would you like to update now?',
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Update',
            onPress: async () => {
              const success = await this.fetchAndInstallUpdate();
              resolve(success);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }
}

/**
 * Check if updates are available on this platform
 * 
 * @returns Whether updates are available
 */
function isUpdateAvailable(): boolean {
  // Check if the Updates module is available
  return !!Updates;
}

/**
 * Initialize the updates listener
 * 
 * This should be called in the App component
 */
export function initializeUpdates(): void {
  if (!isProduction) {
    console.log('Updates disabled in development mode');
    return;
  }
  
  try {
    // No event listeners - use manual checking instead
    console.log('Updates service initialized - use UpdatesService.checkForUpdate() to check manually');

    // Optional: Set up periodic update check (every 30 minutes)
    if (typeof setInterval !== 'undefined') {
      setInterval(async () => {
        const result = await UpdatesService.checkForUpdate();
        if (result.isAvailable) {
          console.log('Update available through scheduled check');
        }
      }, 30 * 60 * 1000);
    }
  } catch (err) {
    console.warn('Failed to set up Updates listeners:', err);
  }
} 