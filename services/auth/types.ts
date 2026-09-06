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
 *   "photoURL": "https://example.com/avatar.jpg"
 * }
 */
export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation?: string;
  confirmPassword?: string;
  displayName: string;
  full_name?: string;
  phoneNumber?: string;
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
  email: string;
  code: string;
}

/**
 * Resend OTP request body
 */
export interface ResendOtpRequest {
  email: string;
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
  photoURL?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
}

export type AuthProvider = 'password' | 'google' | 'firebase_phone' | 'apple';
export type TrustLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type ProfileLanguage = 'vi' | 'en';

export interface ProfileTrust {
  score: number;
  level: TrustLevel;
  isVerified: boolean;
  completedReturns: number;
}

export interface ProfileStats {
  protectedItems: number;
  safeItems: number;
  lostItems: number;
  activeLostReports: number;
  completedReturns: number;
  qrScans: number;
  trust_score?: number;
  items_lost?: number;
  items_returned?: number;
}

export interface ProfilePreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  proximityEnabled: boolean;
  notificationRadiusMeters: number;
  language: ProfileLanguage;
  updatedAt?: string;
}

export type UpdateProfilePreferencesRequest = Partial<
  Pick<
    ProfilePreferences,
    'pushEnabled' | 'emailEnabled' | 'proximityEnabled' | 'notificationRadiusMeters' | 'language'
  >
>;

export interface RegisterDeviceRequest {
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  pushToken: string;
  appVersion?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AccountDeletionResult {
  scheduledDeletionAt: string;
  recoverableUntil: string;
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
  error?:
    | string
    | {
        code?: string;
        fields?: Record<string, string>;
        detail?: string;
      };
  timestamp?: string;
}

export const getApiErrorCode = (response: ApiResponse<unknown>): string | undefined =>
  typeof response.error === 'string' ? response.error : response.error?.code;

export const getApiFieldErrors = (
  response: ApiResponse<unknown>
): Record<string, string> | undefined =>
  typeof response.error === 'object' ? response.error.fields : undefined;

/**
 * User Level/Tier based on trust score
 */
export type UserLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * User data from API - Professional Lost & Found
 */
export interface User {
  id: string;
  uid?: string; // Firebase UID (legacy support)
  memberId?: string; // UUID - Primary identifier for professional users
  email: string;
  displayName: string;
  photoURL?: string | null;
  phoneNumber?: string | null;
  address?: string | null; // User's address
  bio?: string | null; // User biography/description
  authProvider?: AuthProvider;
  emailVerified?: boolean;
  trustScore?: number; // Trust score (0-100)
  isVerified?: boolean; // Verified account status
  totalReturned?: number; // Number of items successfully returned
  itemsLost?: number; // Number of lost items reported
  createdAt?: string;
  updatedAt?: string;

  // Backend compatibility properties
  member_id?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_verified?: boolean;
  trust?: ProfileTrust;
  stats?: ProfileStats;
  preferences?: ProfilePreferences;
  stream_token?: string;
}

/**
 * Utility function to normalize user object from backend response,
 * supporting both camelCase and snake_case properties seamlessly.
 */
export function normalizeUser(raw: any): User {
  if (!raw) return raw;
  const stats = raw.stats || {};
  const rawTrust = raw.trust || {};
  const rawPreferences = raw.preferences || {};
  const trustScore =
    typeof rawTrust.score === 'number'
      ? rawTrust.score
      : typeof raw.trustScore === 'number'
        ? raw.trustScore
        : typeof stats.trust_score === 'number'
          ? stats.trust_score
          : 50;
  const isVerified =
    typeof rawTrust.isVerified === 'boolean'
      ? rawTrust.isVerified
      : typeof raw.isVerified === 'boolean'
        ? raw.isVerified
        : typeof raw.is_verified === 'boolean'
          ? raw.is_verified
          : false;
  const completedReturns =
    typeof rawTrust.completedReturns === 'number'
      ? rawTrust.completedReturns
      : typeof stats.completedReturns === 'number'
        ? stats.completedReturns
        : typeof raw.totalReturned === 'number'
          ? raw.totalReturned
          : typeof stats.items_returned === 'number'
            ? stats.items_returned
            : 0;
  return {
    ...raw,
    id: raw.id || raw.uid || raw.memberId || raw.member_id || '',
    uid: raw.uid || raw.id || '',
    memberId: raw.memberId || raw.member_id || (raw.id ? `USER_${raw.id}` : 'A3F2'),
    email: raw.email || '',
    displayName: raw.displayName || raw.full_name || raw.name || 'Người dùng',
    photoURL: raw.photoURL ?? raw.avatar_url ?? raw.avatar ?? null,
    phoneNumber: raw.phoneNumber ?? raw.phone ?? null,
    address: raw.address ?? raw.addressCity ?? null,
    bio: raw.bio ?? null,
    authProvider: raw.authProvider || 'password',
    emailVerified: Boolean(raw.emailVerified),
    trustScore,
    isVerified,
    totalReturned: completedReturns,
    itemsLost:
      typeof raw.itemsLost === 'number'
        ? raw.itemsLost
        : typeof stats.items_lost === 'number'
          ? stats.items_lost
          : 0,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || undefined,
    trust: {
      score: trustScore,
      level: rawTrust.level || 'BRONZE',
      isVerified,
      completedReturns,
    },
    stats: {
      protectedItems: stats.protectedItems ?? 0,
      safeItems: stats.safeItems ?? 0,
      lostItems: stats.lostItems ?? raw.itemsLost ?? stats.items_lost ?? 0,
      activeLostReports: stats.activeLostReports ?? 0,
      completedReturns,
      qrScans: stats.qrScans ?? 0,
      trust_score: stats.trust_score,
      items_lost: stats.items_lost,
      items_returned: stats.items_returned,
    },
    preferences: {
      pushEnabled: rawPreferences.pushEnabled ?? true,
      emailEnabled: rawPreferences.emailEnabled ?? false,
      proximityEnabled: rawPreferences.proximityEnabled ?? true,
      notificationRadiusMeters: rawPreferences.notificationRadiusMeters ?? 3000,
      language: rawPreferences.language === 'en' ? 'en' : 'vi',
      updatedAt: rawPreferences.updatedAt,
    },
  };
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
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  expire_in?: number;
  refresh_token_expire_in?: number;
  auth_type?: string;
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
