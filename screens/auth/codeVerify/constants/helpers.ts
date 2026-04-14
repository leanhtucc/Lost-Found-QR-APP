import { CODE_VERIFY_LOG_TAG } from './constants';

export const maskPhoneForLog = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length < 3) return phoneNumber;
  return `***${digits.slice(-3)}`;
};

export const logCodeVerify = (event: string, details?: Record<string, unknown>) => {
  console.log(`${CODE_VERIFY_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

export const maskPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 3) return value;
  const normalized = digits.startsWith('84')
    ? digits
    : digits.startsWith('0')
      ? `84${digits.slice(1)}`
      : digits;
  return `+84 *** *** ${normalized.slice(-3)}`;
};
