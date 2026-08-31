/**
 * Hooks Index
 * Re-exports all custom hooks
 */

export { useAuth, default as useAuthDefault } from './useAuth';
export { useGoogleAuth, checkGoogleSignIn, signOutGoogle } from './useGoogleAuth';
export {
  useNotificationHandler,
  default as useNotificationHandlerDefault,
} from './useNotificationHandler';
