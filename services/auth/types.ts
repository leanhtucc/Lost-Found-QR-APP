/**
 * Auth API Type Definitions
 * Based on API documentation
 */

import { COLORS } from '@constants/theme';

// ==================== REQUEST TYPES ====================

/**
 * Register request body
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "Password123",
 *   "displayName": "John Doe",
 *   "phoneNumber": "0912345678",
 *   "photoURL": "https://example.com/avatar.jpg"
 * }
 */
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
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
 * Verify OTP request body
 */
export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

/**
 * Resend OTP request body
 */
export interface ResendOtpRequest {
  phoneNumber: string;
}

// Backward-compatible aliases for existing imports
export type VerifyEmailRequest = VerifyOtpRequest;
export type ResendVerificationRequest = ResendOtpRequest;

/**
 * Google login request body
 */
export interface GoogleLoginRequest {
  idToken: string;
}

/**
 * Firebase verify request body
 */
export interface FirebaseVerifyRequest {
  idToken: string;
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
 * User Level/Tier based on trust score
 */
export type UserLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * User data from API - Professional Lost & Found
 */
export interface User {
  id: string;
  uid: string; // Firebase UID (legacy support)
  memberId: string; // UUID - Primary identifier for professional users
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string; // User's address
  bio?: string; // User biography/description
  trustScore: number; // Trust score (0-100)
  isVerified: boolean; // Verified account status
  totalReturned: number; // Number of items successfully returned
  createdAt: string;
  updatedAt?: string;
}

/**
 * Get user level based on trust score
 */
export function getUserLevel(trustScore: number): UserLevel {
  if (trustScore >= 90) return 'platinum';
  if (trustScore >= 70) return 'gold';
  if (trustScore >= 50) return 'silver';
  return 'bronze';
}

/**
 * Get level display info
 */
export function getLevelInfo(level: UserLevel): { label: string; color: string; icon: string } {
  const levels = {
    bronze: { label: 'Đồng', color: COLORS.trustBronze, icon: 'award' },
    silver: { label: 'Bạc', color: COLORS.trustSilver, icon: 'award' },
    gold: { label: 'Vàng', color: COLORS.trustGold, icon: 'award' },
    platinum: { label: 'Bạch Kim', color: COLORS.trustPlatinum, icon: 'crown' },
  };
  return levels[level];
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
 * Verify OTP response data
 * Some backends return `token`, others return access/refresh pair.
 */
export interface VerifyOtpResponseData {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: User;
  isNewUser?: boolean;
}

// Backward-compatible alias for existing imports
export type VerifyEmailResponseData = VerifyOtpResponseData;

/**
 * Login response data
 */
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Resend OTP response data
 */
export interface ResendOtpResponseData {
  message: string;
}

// Backward-compatible alias for existing imports
export type ResendVerificationResponseData = ResendOtpResponseData;

/**
 * Google login response data
 */
export interface GoogleLoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

/**
 * Firebase verify response data
 */
export interface FirebaseVerifyResponseData {
  isNewUser: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  // Backward compatibility for legacy payloads that still nest tokens.
  token?: {
    accessToken?: string;
    refreshToken?: string;
  };
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
