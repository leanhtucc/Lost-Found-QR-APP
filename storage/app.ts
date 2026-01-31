/**
 * App Storage
 * Handles general app settings storage (onboarding status, preferences, etc.)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'app_onboarding_completed',
} as const;

/**
 * App storage utilities
 */
export const appStorage = {
  /**
   * Check if onboarding has been completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as completed
   */
  async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  /**
   * Reset onboarding status (for testing)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },
};

export default appStorage;
