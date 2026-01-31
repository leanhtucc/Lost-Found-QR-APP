/**
 * Auth Storage
 * Handles secure storage of authentication data (tokens, user info)
 * Uses expo-secure-store for sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@services/auth/types';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

/**
 * Auth storage utilities
 */
export const authStorage = {
  // ==================== TOKEN MANAGEMENT ====================

  /**
   * Save access and refresh tokens securely
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Get both tokens
   */
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    return { accessToken, refreshToken };
  },

  /**
   * Clear tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // ==================== USER MANAGEMENT ====================

  /**
   * Save user data
   */
  async saveUser(user: User): Promise<void> {
    try {
      // Validate user before saving to prevent AsyncStorage error
      if (!user) {
        console.warn('saveUser: user is null or undefined, skipping save');
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  /**
   * Get user data
   */
  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Clear user data
   */
  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Clear all auth data
   */
  async clearAll(): Promise<void> {
    await Promise.all([this.clearTokens(), this.clearUser()]);
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  },

  /**
   * Get all auth data
   */
  async getAuthData(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
  }> {
    const [tokens, user] = await Promise.all([this.getTokens(), this.getUser()]);
    return {
      ...tokens,
      user,
    };
  },
};

export default authStorage;
