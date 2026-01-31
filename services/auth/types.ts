/**
 * Auth API Type Definitions
 * Based on API documentation
 */

// ==================== REQUEST TYPES ====================

/**
 * Register request body
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "Password123",
 *   "displayName": "John Doe",
 *   "photoURL": "https://example.com/avatar.jpg"
 * }
 */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Verify email request body
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

/**
 * Resend verification request body
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Refresh token request body
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Update profile request body
 */
export interface UpdateProfileRequest {
  displayName?: string;
  photoURL?: string;
  pushToken?: string;
}

/**
 * Forgot password request body
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request body
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ==================== RESPONSE TYPES ====================

/**
 * Base API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * User data from API
 */
export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  totalReturned: number;
  createdAt: string;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Register response data
 */
export interface RegisterResponseData {
  message: string;
  email: string;
}

/**
 * Verify email response data
 * Note: Backend only returns tokens, user data must be fetched via /profile
 */
export interface VerifyEmailResponseData {
  message: string;
  accessToken: string;
  refreshToken: string;
  user?: User; // Optional - backend doesn't return user in verify-email
}

/**
 * Login response data
 */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Resend verification response data
 */
export interface ResendVerificationResponseData {
  message: string;
}

/**
 * Refresh token response data
 */
export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Forgot password response data
 */
export interface ForgotPasswordResponseData {
  message: string;
}

/**
 * Reset password response data
 */
export interface ResetPasswordResponseData {
  message: string;
}

// ==================== ERROR TYPES ====================

/**
 * API error response
 */
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}

/**
 * Validation error codes
 */
export enum AuthErrorCode {
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  CODE_EXPIRED = 'CODE_EXPIRED',
  INVALID_CODE = 'INVALID_CODE',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_DISPLAY_NAME = 'INVALID_DISPLAY_NAME',
  INVALID_EMAIL = 'INVALID_EMAIL',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ==================== AUTH STATE ====================

/**
 * Auth state for context/store
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Validation rules (from API docs)
 */
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

export const DISPLAY_NAME_RULES = {
  minLength: 2,
  maxLength: 50,
  pattern: /^[\p{L}\p{N}\s]+$/u, // Letters, numbers, spaces (supports Vietnamese)
};
