/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

import {
  RegisterRequest,
  LoginRequest,
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
  VerifyEmailResponseData,
  ResendVerificationResponseData,
  RefreshTokenResponseData,
  ForgotPasswordResponseData,
  ResetPasswordResponseData,
  GoogleLoginResponseData,
  FirebaseVerifyResponseData,
  User,
} from './types';
import { authStorage } from '@storage/auth';
import { getAuthApiUrl } from '@constants/environment';

// Get API URL from environment
const AUTH_BASE_URL = getAuthApiUrl();

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${AUTH_BASE_URL}${endpoint}`;

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
    return apiRequest<RegisterResponseData>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Step 2: Verify email with code
   * Returns tokens on success
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<VerifyEmailResponseData>> {
    const response = await apiRequest<VerifyEmailResponseData>('/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens on success
    if (response.success && response.data) {
      await authStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
      // Only save user if it exists in response
      if (response.data.user) {
        await authStorage.saveUser(response.data.user);
      } else {
        // If user is not in response, fetch profile to get user data
        console.log('verifyEmail: user not in response, fetching profile...');
        try {
          await this.getProfile();
        } catch (profileError) {
          console.warn('verifyEmail: failed to fetch profile:', profileError);
        }
      }
    }

    return response;
  },

  /**
   * Resend verification code
   */
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<ApiResponse<ResendVerificationResponseData>> {
    return apiRequest<ResendVerificationResponseData>('/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
      await authStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
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
      await authStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
      await authStorage.saveUser(response.data.user);
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
      // Backend returns a single 'token' which acts as access/refresh token in this context
      await authStorage.saveTokens(response.data.token, response.data.token);
      await authStorage.saveUser(response.data.user);
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
      await authStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
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
      await authStorage.saveUser(response.data);
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
      await authStorage.saveUser(response.data);
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
