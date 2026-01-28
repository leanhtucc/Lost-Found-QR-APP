/**
 * Auth Validation Utilities
 * Client-side validation matching API validation rules
 */

import { PASSWORD_RULES, DISPLAY_NAME_RULES } from './types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email là bắt buộc' };
  }

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }

  return { isValid: true };
}

/**
 * Validate password according to API rules
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Mật khẩu là bắt buộc' };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    return {
      isValid: false,
      error: `Mật khẩu phải có ít nhất ${PASSWORD_RULES.minLength} ký tự`,
    };
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có ít nhất 1 chữ HOA',
    };
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có ít nhất 1 chữ thường',
    };
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Mật khẩu phải có ít nhất 1 số',
    };
  }

  return { isValid: true };
}

/**
 * Validate display name according to API rules
 * - Minimum 2 characters, maximum 50 characters
 * - Only letters, numbers, spaces (supports Vietnamese)
 */
export function validateDisplayName(displayName: string): ValidationResult {
  if (!displayName || displayName.trim().length === 0) {
    return { isValid: false, error: 'Tên hiển thị là bắt buộc' };
  }

  const trimmedName = displayName.trim();

  if (trimmedName.length < DISPLAY_NAME_RULES.minLength) {
    return {
      isValid: false,
      error: `Tên hiển thị phải có ít nhất ${DISPLAY_NAME_RULES.minLength} ký tự`,
    };
  }

  if (trimmedName.length > DISPLAY_NAME_RULES.maxLength) {
    return {
      isValid: false,
      error: `Tên hiển thị không được quá ${DISPLAY_NAME_RULES.maxLength} ký tự`,
    };
  }

  if (!DISPLAY_NAME_RULES.pattern.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Tên hiển thị chỉ được chứa chữ cái, số và khoảng trắng',
    };
  }

  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // Optional field
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL không hợp lệ' };
  }
}

/**
 * Validate OTP code
 */
export function validateOtpCode(code: string, length: number = 6): ValidationResult {
  if (!code) {
    return { isValid: false, error: 'Mã xác thực là bắt buộc' };
  }

  if (code.length !== length) {
    return {
      isValid: false,
      error: `Mã xác thực phải có ${length} chữ số`,
    };
  }

  if (!/^\d+$/.test(code)) {
    return {
      isValid: false,
      error: 'Mã xác thực chỉ được chứa số',
    };
  }

  return { isValid: true };
}

/**
 * Validate confirm password matches
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Xác nhận mật khẩu là bắt buộc' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }

  return { isValid: true };
}

/**
 * Validate entire register form
 */
export function validateRegisterForm(data: {
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
}): ValidationResult {
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) return emailValidation;

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) return passwordValidation;

  const displayNameValidation = validateDisplayName(data.displayName);
  if (!displayNameValidation.isValid) return displayNameValidation;

  if (data.photoURL) {
    const urlValidation = validateUrl(data.photoURL);
    if (!urlValidation.isValid) return urlValidation;
  }

  return { isValid: true };
}

/**
 * Validate login form
 */
export function validateLoginForm(data: { email: string; password: string }): ValidationResult {
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) return emailValidation;

  if (!data.password) {
    return { isValid: false, error: 'Mật khẩu là bắt buộc' };
  }

  return { isValid: true };
}
