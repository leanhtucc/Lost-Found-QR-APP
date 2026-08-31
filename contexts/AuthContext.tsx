/**
 * AuthContext
 * Global authentication state management
 * Handles login state, auto-logout, and session management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authStorage } from '@storage/auth';
import { deviceStorage } from '@storage/device';
import { authApi } from '@services/auth';
import { User } from '@services/auth/types';
import { sessionEvents } from '@/lib/sessionEvents';
import { SessionExpiredModal } from '@components/SessionExpiredModal';
import { pushNotificationService } from '@/services/notifications';

// Session timeout in milliseconds (7 days)
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

// Storage key for last activity
const LAST_ACTIVITY_KEY = 'auth_last_activity';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;

  // Actions
  setAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  checkAuthStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateLastActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isSessionExpiredModalVisible, setIsSessionExpiredModalVisible] = useState(false);
  const appState = useRef(AppState.currentState);

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = useCallback(async () => {
    try {
      const now = Date.now().toString();
      await authStorage.setItem(LAST_ACTIVITY_KEY, now);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }, []);

  /**
   * Check if session has expired
   */
  const checkSessionExpired = useCallback(async (): Promise<boolean> => {
    try {
      const lastActivity = await authStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivity) return false;

      const lastActivityTime = parseInt(lastActivity, 10);
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      return timeSinceLastActivity > SESSION_TIMEOUT;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }, []);

  /**
   * Logout user and clear all data
   */
  const logout = useCallback(async () => {
    try {
      await pushNotificationService.unregisterDevice().catch(error => {
        console.warn('Unable to unregister push device during logout:', error);
      });
      const deviceId = await deviceStorage.getDeviceId();
      if (deviceId) {
        await authApi.unregisterDevice(deviceId).catch(error => {
          console.warn('Unable to unregister this device during logout:', error);
        });
      }
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await authStorage.clearAll();
      await authStorage.removeItem(LAST_ACTIVITY_KEY);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleSessionExpiredConfirm = useCallback(async () => {
    setIsSessionExpiredModalVisible(false);
    await logout();
  }, [logout]);

  /**
   * Listen for global session expiration events (e.g. 401 response from backend)
   */
  useEffect(() => {
    const unsubscribe = sessionEvents.onSessionExpired(() => {
      setIsSessionExpiredModalVisible(true);
    });
    return unsubscribe;
  }, []);

  /**
   * Check authentication status on app start
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if user has token
      const hasToken = await authStorage.isAuthenticated();
      if (!hasToken) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // Check if session expired
      const sessionExpired = await checkSessionExpired();
      if (sessionExpired) {
        console.log('Session expired, logging out...');
        await logout();
        return false;
      }

      // Get user data
      const userData = await authStorage.getUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        await updateLastActivity();
        return true;
      }

      // Try to fetch profile if no local user data
      try {
        const profileResponse = await authApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
          await updateLastActivity();
          return true;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      // Token exists but couldn't get user - logout
      await logout();
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkSessionExpired, logout, updateLastActivity]);

  /**
   * Handle app state changes (background/foreground)
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Check if session expired while app was in background
        if (isAuthenticated) {
          const sessionExpired = await checkSessionExpired();
          if (sessionExpired) {
            console.log('Session expired while in background, logging out...');
            await logout();
          } else {
            await updateLastActivity();
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, checkSessionExpired, logout, updateLastActivity]);

  /**
   * Register push device token and listen for token refreshes when user is authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    void pushNotificationService.registerDeviceToken();
    const unsubscribeRefresh = pushNotificationService.setupTokenRefreshListener();

    return () => {
      unsubscribeRefresh();
    };
  }, [isAuthenticated]);

  /**
   * Check auth status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    setAuthenticated: setIsAuthenticated,
    setUser,
    checkAuthStatus,
    logout,
    updateLastActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        visible={isSessionExpiredModalVisible}
        onConfirm={handleSessionExpiredConfirm}
      />
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
