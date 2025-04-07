import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@ecocart:onboarding_completed',
  FEATURE_TOUR_COMPLETED: '@ecocart:feature_tour_completed',
  TUTORIALS_VIEWED: '@ecocart:tutorials_viewed',
};

/**
 * Service for managing user tutorial and onboarding state
 */
class TutorialService {
  private static instance: TutorialService;

  /**
   * Get singleton instance
   */
  public static getInstance(): TutorialService {
    if (!TutorialService.instance) {
      TutorialService.instance = new TutorialService();
    }
    return TutorialService.instance;
  }

  /**
   * Check if user has completed onboarding
   */
  public async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  public async markOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error saving onboarding completion status:', error);
    }
  }

  /**
   * Reset onboarding status (for testing/development)
   */
  public async resetOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  }

  /**
   * Check if user has completed feature tour
   */
  public async hasCompletedFeatureTour(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.FEATURE_TOUR_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking feature tour status:', error);
      return false;
    }
  }

  /**
   * Mark feature tour as completed
   */
  public async markFeatureTourCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FEATURE_TOUR_COMPLETED, 'true');
    } catch (error) {
      console.error('Error saving feature tour completion status:', error);
    }
  }

  /**
   * Record that user has viewed a specific tutorial
   */
  public async markTutorialViewed(tutorialId: string): Promise<void> {
    try {
      const viewedTutorials = await this.getViewedTutorials();
      if (!viewedTutorials.includes(tutorialId)) {
        viewedTutorials.push(tutorialId);
        await AsyncStorage.setItem(
          STORAGE_KEYS.TUTORIALS_VIEWED,
          JSON.stringify(viewedTutorials)
        );
      }
    } catch (error) {
      console.error('Error marking tutorial as viewed:', error);
    }
  }

  /**
   * Get list of tutorials the user has viewed
   */
  public async getViewedTutorials(): Promise<string[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.TUTORIALS_VIEWED);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting viewed tutorials:', error);
      return [];
    }
  }

  /**
   * Check if user has viewed a specific tutorial
   */
  public async hasTutorialBeenViewed(tutorialId: string): Promise<boolean> {
    try {
      const viewedTutorials = await this.getViewedTutorials();
      return viewedTutorials.includes(tutorialId);
    } catch (error) {
      console.error('Error checking tutorial view status:', error);
      return false;
    }
  }
}

export default TutorialService; 