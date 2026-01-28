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
  ApiResponse,
  RegisterResponseData,
  LoginResponseData,
  VerifyEmailResponseData,
  ResendVerificationResponseData,
  RefreshTokenResponseData,
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
      await authStorage.saveUser(response.data.user);
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
};

export default authApi;
