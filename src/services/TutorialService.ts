import { SafeStorage } from '@/utils/storage';

// Constants
const TUTORIAL_STORAGE_KEY = '@ecocart:completed_tutorials';
const ONBOARDING_COMPLETE_KEY = '@ecocart:onboarding_complete';
const LAST_TUTORIAL_VERSION_KEY = '@ecocart:last_tutorial_version';

// Tutorial IDs for different feature tours
export enum TutorialID {
  WELCOME_TOUR = 'welcome_tour',
  MATERIALS_TOUR = 'materials_tour',
  COLLECTION_SCHEDULING_TOUR = 'collection_scheduling_tour',
  ANALYTICS_TOUR = 'analytics_tour',
  PROFILE_TOUR = 'profile_tour',
  OFFLINE_MODE_TOUR = 'offline_mode_tour',
  PERFORMANCE_SETTINGS_TOUR = 'performance_settings_tour',
  DARK_MODE_TOUR = 'dark_mode_tour',
}

interface TutorialService {
  // Check if a specific tutorial has been completed
  isTutorialCompleted(tutorialId: TutorialID): Promise<boolean>;
  
  // Mark a tutorial as completed
  markTutorialCompleted(tutorialId: TutorialID): Promise<void>;
  
  // Reset a specific tutorial so it shows again next time
  resetTutorial(tutorialId: TutorialID): Promise<void>;
  
  // Reset all tutorials
  resetAllTutorials(): Promise<void>;
  
  // Check if app onboarding has been completed
  isOnboardingCompleted(): Promise<boolean>;
  
  // Mark onboarding as completed
  markOnboardingCompleted(): Promise<void>;
  
  // Reset onboarding status
  resetOnboarding(): Promise<void>;
  
  // Get list of all completed tutorials
  getCompletedTutorials(): Promise<TutorialID[]>;
  
  // Check if tutorial version has changed and reset if needed
  checkAndUpdateTutorialVersion(currentVersion: string): Promise<boolean>;
}

class TutorialServiceImpl implements TutorialService {
  // Private singleton instance
  private static instance: TutorialServiceImpl;
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  // Get singleton instance
  public static getInstance(): TutorialServiceImpl {
    if (!TutorialServiceImpl.instance) {
      TutorialServiceImpl.instance = new TutorialServiceImpl();
    }
    return TutorialServiceImpl.instance;
  }
  
  // Check if a specific tutorial has been completed
  public async isTutorialCompleted(tutorialId: TutorialID): Promise<boolean> {
    try {
      const completedTutorials = await this.getCompletedTutorials();
      return completedTutorials.includes(tutorialId);
    } catch (error) {
      console.error('Error checking tutorial completion:', error);
      return false;
    }
  }
  
  // Mark a tutorial as completed
  public async markTutorialCompleted(tutorialId: TutorialID): Promise<void> {
    try {
      const completedTutorials = await this.getCompletedTutorials();
      
      if (!completedTutorials.includes(tutorialId)) {
        completedTutorials.push(tutorialId);
        await AsyncStorage.setItem(
          TUTORIAL_STORAGE_KEY, 
          JSON.stringify(completedTutorials)
        );
      }
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
    }
  }
  
  // Reset a specific tutorial so it shows again next time
  public async resetTutorial(tutorialId: TutorialID): Promise<void> {
    try {
      const completedTutorials = await this.getCompletedTutorials();
      const updatedTutorials = completedTutorials.filter(id => id !== tutorialId);
      
      await AsyncStorage.setItem(
        TUTORIAL_STORAGE_KEY, 
        JSON.stringify(updatedTutorials)
      );
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  }
  
  // Reset all tutorials
  public async resetAllTutorials(): Promise<void> {
    try {
      await SafeStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting all tutorials:', error);
    }
  }
  
  // Check if app onboarding has been completed
  public async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await SafeStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
  
  // Mark onboarding as completed
  public async markOnboardingCompleted(): Promise<void> {
    try {
      await SafeStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  }
  
  // Reset onboarding status
  public async resetOnboarding(): Promise<void> {
    try {
      await SafeStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  }
  
  // Get list of all completed tutorials
  public async getCompletedTutorials(): Promise<TutorialID[]> {
    try {
      const value = await SafeStorage.getItem(TUTORIAL_STORAGE_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting completed tutorials:', error);
      return [];
    }
  }
  
  // Check if tutorial version has changed and reset if needed
  public async checkAndUpdateTutorialVersion(currentVersion: string): Promise<boolean> {
    try {
      const lastVersion = await SafeStorage.getItem(LAST_TUTORIAL_VERSION_KEY);
      
      // If version has changed, reset tutorials
      if (lastVersion !== currentVersion) {
        // Save new version
        await SafeStorage.setItem(LAST_TUTORIAL_VERSION_KEY, currentVersion);
        
        // Optionally reset tutorials for major version changes
        // This is a simple example; you might want a more sophisticated version comparison
        if (lastVersion && !currentVersion.startsWith(lastVersion.split('.')[0])) {
          await this.resetAllTutorials();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking tutorial version:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const TutorialService = TutorialServiceImpl.getInstance();

export default TutorialService; 