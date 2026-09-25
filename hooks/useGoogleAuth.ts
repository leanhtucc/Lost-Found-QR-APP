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
import { Platform } from 'react-native';
import { authApi } from '@services/auth';
import { ENV } from '@constants/environment';
import type { User } from '@services/auth/types';
import { useAuthContext } from '@contexts/AuthContext';

const GOOGLE_AUTH_LOG_TAG = '[Auth:Google]';

const maskEmailForLog = (email?: string | null): string => {
  if (!email) return '';
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return 'invalid-email';
  return `${localPart.slice(0, 1)}***@${domain}`;
};

const getGoogleClientProject = (clientId: string): string => clientId.split('-', 1)[0] || 'unknown';

interface GoogleTokenDiagnostics {
  audienceMatchesConfiguredClient: boolean | null;
  audienceProject: string | null;
  emailVerified: boolean | null;
  expiresInSeconds: number | null;
  issuer: string | null;
}

const getGoogleTokenDiagnostics = (idToken: string): GoogleTokenDiagnostics => {
  try {
    const encodedPayload = idToken.split('.')[1];
    if (!encodedPayload) throw new Error('JWT payload is missing');

    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const payload = JSON.parse(globalThis.atob(paddedPayload)) as {
      aud?: unknown;
      email_verified?: unknown;
      exp?: unknown;
      iss?: unknown;
    };
    const audience = typeof payload.aud === 'string' ? payload.aud : null;
    const expiresAt = typeof payload.exp === 'number' ? payload.exp : null;

    return {
      audienceMatchesConfiguredClient: audience ? audience === ENV.GOOGLE_WEB_CLIENT_ID : null,
      audienceProject: audience ? getGoogleClientProject(audience) : null,
      emailVerified: typeof payload.email_verified === 'boolean' ? payload.email_verified : null,
      expiresInSeconds: expiresAt ? expiresAt - Math.floor(Date.now() / 1000) : null,
      issuer: typeof payload.iss === 'string' ? payload.iss : null,
    };
  } catch (error) {
    logGoogleAuth('warn', 'id_token_diagnostics_failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      audienceMatchesConfiguredClient: null,
      audienceProject: null,
      emailVerified: null,
      expiresInSeconds: null,
      issuer: null,
    };
  }
};

const getBackendErrorCode = (error: unknown): string | null => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' || typeof code === 'number' ? String(code) : null;
  }
  return null;
};

const logGoogleAuth = (
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, unknown> = {}
) => {
  console[level](`${GOOGLE_AUTH_LOG_TAG} ${new Date().toISOString()} ${event}`, details);
};

export interface SignInWithGoogleOptions {
  autoNavigate?: boolean;
  onSuccess?: (user: User | null, isNewUser: boolean | null) => void;
}

interface UseGoogleAuthResult {
  /** Trigger Google Sign In */
  signInWithGoogle: (options?: SignInWithGoogleOptions) => Promise<void>;
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

logGoogleAuth('info', 'configured', {
  platform: Platform.OS,
  googleProject: getGoogleClientProject(ENV.GOOGLE_WEB_CLIENT_ID),
  hasWebClientId: Boolean(ENV.GOOGLE_WEB_CLIENT_ID),
  hasIosClientId: Boolean(ENV.GOOGLE_IOS_CLIENT_ID),
  apiHost: (() => {
    try {
      return new URL(ENV.API_URL).host;
    } catch {
      return 'invalid-api-url';
    }
  })(),
  environment: ENV.ENVIRONMENT,
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
  const signInWithGoogle = async (options?: SignInWithGoogleOptions) => {
    const requestId = `google-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();

    try {
      setLoading(true);
      setError(null);

      logGoogleAuth('info', 'sign_in_start', {
        requestId,
        platform: Platform.OS,
        googleProject: getGoogleClientProject(ENV.GOOGLE_WEB_CLIENT_ID),
      });

      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      logGoogleAuth('info', 'play_services_ok', { requestId });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      logGoogleAuth('info', 'native_sign_in_result', {
        requestId,
        responseType: response.type,
        hasIdToken: isSuccessResponse(response) && Boolean(response.data.idToken),
        idTokenLength: isSuccessResponse(response) ? response.data.idToken?.length || 0 : 0,
        emailMasked: isSuccessResponse(response) ? maskEmailForLog(response.data.user.email) : '',
      });

      // Check if sign in was successful and we have an idToken
      if (isSuccessResponse(response) && response.data.idToken) {
        const idToken = response.data.idToken;
        const tokenDiagnostics = getGoogleTokenDiagnostics(idToken);

        logGoogleAuth('info', 'id_token_diagnostics', {
          requestId,
          ...tokenDiagnostics,
        });

        // Send ID Token to backend
        logGoogleAuth('info', 'backend_request_start', {
          requestId,
          endpoint: '/api/auth/google',
          idTokenLength: idToken.length,
          tokenSegmentCount: idToken.split('.').length,
        });
        const result = await authApi.googleLogin({ idToken });

        logGoogleAuth(result.success ? 'info' : 'warn', 'backend_request_result', {
          requestId,
          durationMs: Date.now() - startedAt,
          success: result.success,
          message: result.message,
          errorCode: getBackendErrorCode(result.error),
          hasData: Boolean(result.data),
          hasUser: Boolean(result.data?.user),
          isNewUser: result.data?.isNewUser ?? null,
        });

        if (result.success && result.data) {
          setUser(result.data.user);
          setAuthenticatedUser(result.data.user);
          await updateLastActivity();
          setIsNewUser(result.data.isNewUser);
          setError(null);

          options?.onSuccess?.(result.data.user, result.data.isNewUser);

          if (options?.autoNavigate !== false) {
            setAuthenticated(true);
          }

          logGoogleAuth('info', 'auth_context_updated', {
            requestId,
            durationMs: Date.now() - startedAt,
            userId: result.data.user.id,
            emailMasked: maskEmailForLog(result.data.user.email),
            isNewUser: result.data.isNewUser,
          });
        } else {
          const backendErrorCode = getBackendErrorCode(result.error);
          setError(
            `${result.message || 'Login failed'}${backendErrorCode ? ` (${backendErrorCode})` : ''}`
          );
          setUser(null);
          setIsNewUser(null);
        }
      } else {
        logGoogleAuth('warn', 'id_token_missing', {
          requestId,
          responseType: response.type,
          durationMs: Date.now() - startedAt,
        });
        setError('Failed to get ID token from Google');
      }
    } catch (err: unknown) {
      logGoogleAuth('error', 'sign_in_exception', {
        requestId,
        durationMs: Date.now() - startedAt,
        code: isErrorWithCode(err) ? String(err.code) : null,
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : typeof err,
      });

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
      logGoogleAuth('info', 'sign_in_finished', {
        requestId,
        durationMs: Date.now() - startedAt,
      });
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
