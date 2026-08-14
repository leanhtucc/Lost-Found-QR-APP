import { CODE_VERIFY_LOG_TAG } from './constants';

export const maskEmailForLog = (email: string): string => {
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return 'invalid-email';
  return `${localPart.slice(0, 1)}***@${domain}`;
};

export const logCodeVerify = (event: string, details?: Record<string, unknown>) => {
  console.log(`${CODE_VERIFY_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

export const maskEmailAddress = (email: string): string => {
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return email;

  const visibleLocal =
    localPart.length > 2
      ? `${localPart.slice(0, 2)}***${localPart.slice(-1)}`
      : `${localPart.slice(0, 1)}***`;

  return `${visibleLocal}@${domain}`;
};
