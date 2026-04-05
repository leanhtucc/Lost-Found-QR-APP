/**
 * Google Sign-In Hook using @react-native-google-signin/google-signin
 * Handles Google authentication flow for React Native
 */

import { useState } from 'react';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { authApi } from '@services/auth';
import { ENV } from '@constants/environment';
import type { User } from '@services/auth/types';

interface UseGoogleAuthResult {
  /** Trigger Google Sign In */
  signInWithGoogle: () => Promise<void>;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** User data after successful login */
  user: User | null;
  /** Whether this is a new user */
  isNewUser: boolean | null;
}

/**
 * Hook to handle Google authentication with @react-native-google-signin
 *
 * IMPORTANT: This only works with Development Build or Production APK/IPA
 * Will NOT work with Expo Go
 *
 * @example
 * const { signInWithGoogle, loading, error } = useGoogleAuth();
 *
 * <Button onPress={signInWithGoogle} disabled={loading}>
 *   {loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
 * </Button>
 */
export const useGoogleAuth = (): UseGoogleAuthResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  // Configure GoogleSignin
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    scopes: ['email', 'profile'],
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
  });

  /**
   * Trigger Google Sign In flow
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      // Check if sign in was successful and we have an idToken
      if (isSuccessResponse(response) && response.data.idToken) {
        const idToken = response.data.idToken;

        // Send ID Token to backend
        const result = await authApi.googleLogin({ idToken });

        if (result.success && result.data) {
          setUser(result.data.user);
          setIsNewUser(result.data.isNewUser);
          setError(null);
        } else {
          setError(result.message || 'Login failed');
          setUser(null);
          setIsNewUser(null);
        }
      } else {
        setError('Failed to get ID token from Google');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);

      if (err.code === 'SIGN_IN_CANCELLED') {
        setError('Đăng nhập bị hủy');
      } else if (err.code === 'IN_PROGRESS') {
        setError('Đăng nhập đang được thực hiện');
      } else if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        setError('Google Play Services không khả dụng');
      } else {
        setError(err.message || 'Đã xảy ra lỗi khi đăng nhập');
      }

      setUser(null);
      setIsNewUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
    user,
    isNewUser,
  };
};

/**
 * Check if user is currently signed in
 */
export const checkGoogleSignIn = async () => {
  const isSignedIn = await GoogleSignin.signInSilently();
  if (isSignedIn) {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  }
  return null;
};

/**
 * Sign out from Google
 */
export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return true;
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    return false;
  }
};
