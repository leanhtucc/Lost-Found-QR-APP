/**
 * Google Sign-In Hook using @react-native-google-signin/google-signin
 * Handles Google authentication flow for React Native
 */

import { useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { authApi } from '@services/auth';
import { ENV } from '@constants/environment';
import type { User } from '@services/auth/types';
import { useAuthContext } from '@contexts/AuthContext';

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

GoogleSignin.configure({
  webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
  scopes: ['email', 'profile'],
  ...(ENV.GOOGLE_IOS_CLIENT_ID ? { iosClientId: ENV.GOOGLE_IOS_CLIENT_ID } : {}),
});

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
  const { setAuthenticated, setUser: setAuthenticatedUser, updateLastActivity } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

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
          setAuthenticatedUser(result.data.user);
          setAuthenticated(true);
          await updateLastActivity();
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
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);

      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Đăng nhập bị hủy');
      } else if (isErrorWithCode(err) && err.code === statusCodes.IN_PROGRESS) {
        setError('Đăng nhập đang được thực hiện');
      } else if (isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services không khả dụng');
      } else if (isErrorWithCode(err) && err.code === '10') {
        setError(
          'Cấu hình Google của APK chưa khớp. Hãy kiểm tra package name và SHA-1/SHA-256 của keystore.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng nhập');
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
