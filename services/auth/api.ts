/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

import {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleLoginRequest,
  FirebaseVerifyRequest,
  ApiResponse,
  RegisterResponseData,
  LoginResponseData,
  VerifyOtpResponseData,
  ResendOtpResponseData,
  VerifyEmailResponseData,
  ResendVerificationResponseData,
  RefreshTokenResponseData,
  ForgotPasswordResponseData,
  ResetPasswordResponseData,
  GoogleLoginResponseData,
  FirebaseVerifyResponseData,
  User,
  normalizeUser,
} from './types';
import { authStorage } from '@storage/auth';
import { buildAuthUrl } from '@services/shared/url';

const AUTH_API_LOG_TAG = '[Auth:ApiService]';

const maskEmailForLog = (email?: string): string => {
  if (!email) return '';
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return 'invalid-email';
  return `${localPart.slice(0, 1)}***@${domain}`;
};

const logAuthApi = (event: string, details?: Record<string, unknown>) => {
  console.log(`${AUTH_API_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

interface LegacyTokenPair {
  accessToken?: string;
  refreshToken?: string;
}

type AuthTokenPayload = {
  accessToken?: string;
  refreshToken?: string;
  token?: string | LegacyTokenPair;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const extractAuthTokens = (
  payload?: AuthTokenPayload
): { accessToken: string; refreshToken: string } | null => {
  if (!payload) return null;

  if (isNonEmptyString(payload.accessToken) && isNonEmptyString(payload.refreshToken)) {
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  }

  if (payload.token && typeof payload.token === 'object') {
    const tokenPayload = payload.token as LegacyTokenPair;
    if (isNonEmptyString(tokenPayload.accessToken) && isNonEmptyString(tokenPayload.refreshToken)) {
      return {
        accessToken: tokenPayload.accessToken,
        refreshToken: tokenPayload.refreshToken,
      };
    }
  }

  if (isNonEmptyString(payload.token)) {
    return {
      accessToken: payload.token,
      refreshToken: isNonEmptyString(payload.refreshToken) ? payload.refreshToken : payload.token,
    };
  }

  return null;
};

const withInvalidAuthPayload = <T>(response: ApiResponse<T>, message: string): ApiResponse<T> => ({
  ...response,
  success: false,
  message,
  error: 'INVALID_AUTH_PAYLOAD',
});

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = buildAuthUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = await authStorage.getAccessToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      error: 'NETWORK_ERROR',
    };
  }
}

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Step 1: Register new account
   * User will receive verification code via email
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponseData>> {
    const requestId = `api-reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();

    logAuthApi('register_request_start', {
      requestId,
      endpoint: '/register',
      emailMasked: maskEmailForLog(data.email),
      displayNameLength: data.displayName?.length,
      hasPhotoURL: Boolean(data.photoURL),
      passwordLength: data.password?.length,
    });

    const response = await apiRequest<RegisterResponseData>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    logAuthApi('register_request_result', {
      requestId,
      durationMs: Date.now() - startedAt,
      success: response.success,
      message: response.message,
      error: response.error,
      hasData: Boolean(response.data),
    });

    return response;
  },

  /**
   * Step 2: Verify OTP sent to the registration email
   * Returns tokens on success
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponseData>> {
    const requestId = `api-verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();

    logAuthApi('verify_otp_request_start', {
      requestId,
      endpoint: '/verify-otp',
      emailMasked: maskEmailForLog(data.email),
      codeLength: data.code?.length,
    });

    const response = await apiRequest<VerifyOtpResponseData>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const extractedTokens = extractAuthTokens(response.data);

    logAuthApi('verify_otp_request_result', {
      requestId,
      durationMs: Date.now() - startedAt,
      success: response.success,
      message: response.message,
      error: response.error,
      hasData: Boolean(response.data),
      hasAccessToken: Boolean(extractedTokens?.accessToken),
      hasRefreshToken: Boolean(extractedTokens?.refreshToken),
      hasUser: Boolean(response.data?.user),
    });

    // Store tokens on success
    if (response.success && response.data) {
      if (!extractedTokens) {
        logAuthApi('verify_otp_tokens_missing', {
          requestId,
          durationMs: Date.now() - startedAt,
          responseDataKeys: Object.keys(response.data),
        });
        return withInvalidAuthPayload(
          response,
          'Thiếu access token hoặc refresh token từ phản hồi verify OTP.'
        );
      }

      await authStorage.saveTokens(extractedTokens.accessToken, extractedTokens.refreshToken);

      // Only save user if it exists in response
      if (response.data.user) {
        const normalizedUser = normalizeUser(response.data.user);
        response.data.user = normalizedUser;
        await authStorage.saveUser(normalizedUser);
        logAuthApi('verify_otp_user_saved', {
          requestId,
          userId: normalizedUser.id,
          emailMasked: maskEmailForLog(normalizedUser.email),
        });
      } else {
        // If user is not in response, fetch profile to get user data
        console.log('verifyOtp: user not in response, fetching profile...');
        try {
          await this.getProfile();
        } catch (profileError) {
          console.warn('verifyOtp: failed to fetch profile:', profileError);
        }
      }
    }

    return response;
  },

  /**
   * Backward-compatible wrapper for legacy callers.
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<VerifyEmailResponseData>> {
    return this.verifyOtp(data);
  },

  /**
   * Resend OTP to the registration email
   */
  async resendOtp(data: ResendOtpRequest): Promise<ApiResponse<ResendOtpResponseData>> {
    const requestId = `api-resend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = Date.now();

    logAuthApi('resend_otp_request_start', {
      requestId,
      endpoint: '/resend-otp',
      emailMasked: maskEmailForLog(data.email),
    });

    const response = await apiRequest<ResendOtpResponseData>('/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    logAuthApi('resend_otp_request_result', {
      requestId,
      durationMs: Date.now() - startedAt,
      success: response.success,
      message: response.message,
      error: response.error,
    });

    return response;
  },

  /**
   * Backward-compatible wrapper for legacy callers.
   */
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<ApiResponse<ResendVerificationResponseData>> {
    return this.resendOtp(data);
  },

  /**
   * Login with email and password
   * Only for verified users
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiRequest<LoginResponseData>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens on success
    if (response.success && response.data) {
      const extractedTokens = extractAuthTokens(response.data);
      if (!extractedTokens) {
        return withInvalidAuthPayload(response, 'Thiếu access token hoặc refresh token từ login.');
      }

      await authStorage.saveTokens(extractedTokens.accessToken, extractedTokens.refreshToken);
    }

    return response;
  },

  /**
   * Login with Google
   * Sends Google ID Token to backend
   */
  async googleLogin(data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponseData>> {
    const response = await apiRequest<GoogleLoginResponseData>('/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens and user on success
    if (response.success && response.data) {
      const extractedTokens = extractAuthTokens(response.data);
      if (!extractedTokens) {
        return withInvalidAuthPayload(
          response,
          'Thiếu access token hoặc refresh token từ Google login.'
        );
      }

      await authStorage.saveTokens(extractedTokens.accessToken, extractedTokens.refreshToken);
      if (response.data.user) {
        const normalizedUser = normalizeUser(response.data.user);
        response.data.user = normalizedUser;
        await authStorage.saveUser(normalizedUser);
      }
    }

    return response;
  },

  /**
   * Verify Firebase authentication
   * Sends Firebase ID Token to backend after successful Firebase OTP/Login
   */
  async firebaseVerify(
    data: FirebaseVerifyRequest
  ): Promise<ApiResponse<FirebaseVerifyResponseData>> {
    const response = await apiRequest<FirebaseVerifyResponseData>('/firebase-verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens and user on success
    if (response.success && response.data) {
      const extractedTokens = extractAuthTokens(response.data);
      if (!extractedTokens) {
        return withInvalidAuthPayload(
          response,
          'Thiếu access token hoặc refresh token từ phản hồi firebase-verify.'
        );
      }

      await authStorage.saveTokens(extractedTokens.accessToken, extractedTokens.refreshToken);
      if (response.data.user) {
        const normalizedUser = normalizeUser(response.data.user);
        response.data.user = normalizedUser;
        await authStorage.saveUser(normalizedUser);
      }
    }

    return response;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponseData>> {
    const response = await apiRequest<RefreshTokenResponseData>('/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Update stored tokens on success
    if (response.success && response.data) {
      const extractedTokens = extractAuthTokens(response.data);
      if (!extractedTokens) {
        return withInvalidAuthPayload(
          response,
          'Thiếu access token hoặc refresh token từ refresh.'
        );
      }

      await authStorage.saveTokens(extractedTokens.accessToken, extractedTokens.refreshToken);
    }

    return response;
  },

  /**
   * Get current user profile
   * Requires authentication
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiRequest<User>('/profile', {
      method: 'GET',
    });

    // Update stored user on success
    if (response.success && response.data) {
      const normalizedUser = normalizeUser(response.data);
      response.data = normalizedUser;
      await authStorage.saveUser(normalizedUser);
    }

    return response;
  },

  /**
   * Update user profile
   * Requires authentication
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await apiRequest<User>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    // Update stored user on success
    if (response.success && response.data) {
      const normalizedUser = normalizeUser(response.data);
      response.data = normalizedUser;
      await authStorage.saveUser(normalizedUser);
    }

    return response;
  },

  /**
   * Logout current user
   * Clears local tokens
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>('/logout', {
      method: 'POST',
    });

    // Clear local storage regardless of response
    await authStorage.clearAll();

    return response;
  },

  /**
   * Delete user account
   * Requires authentication
   */
  async deleteAccount(): Promise<ApiResponse<null>> {
    const response = await apiRequest<null>('/account', {
      method: 'DELETE',
    });

    // Clear local storage on success
    if (response.success) {
      await authStorage.clearAll();
    }

    return response;
  },

  /**
   * Request password reset
   * Sends email with reset link
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<ForgotPasswordResponseData>> {
    return apiRequest<ForgotPasswordResponseData>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with token
   * Token received from email link
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponseData>> {
    return apiRequest<ResetPasswordResponseData>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default authApi;
