/**
 * ToastContext
 * Global toast notification system
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast, ToastConfig } from '@components/Toast';

type ToastOptions = Pick<ToastConfig, 'actionLabel' | 'onAction' | 'duration'>;

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  // Shorthand methods
  success: (title: string, message?: string, options?: ToastOptions) => void;
  error: (title: string, message?: string, options?: ToastOptions) => void;
  warning: (title: string, message?: string, options?: ToastOptions) => void;
  info: (title: string, message?: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>({
    type: 'info',
    title: '',
  });

  const showToast = useCallback((newConfig: ToastConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  // Shorthand methods
  const success = useCallback(
    (title: string, message?: string, options?: ToastOptions) => {
      showToast({ type: 'success', title, message, ...options });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: ToastOptions) => {
      showToast({ type: 'error', title, message, ...options });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: ToastOptions) => {
      showToast({ type: 'warning', title, message, ...options });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: ToastOptions) => {
      showToast({ type: 'info', title, message, ...options });
    },
    [showToast]
  );

  const value = useMemo<ToastContextType>(
    () => ({
      showToast,
      hideToast,
      success,
      error,
      warning,
      info,
    }),
    [error, hideToast, info, showToast, success, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        visible={visible}
        type={config.type}
        title={config.title}
        message={config.message}
        duration={config.duration}
        actionLabel={config.actionLabel}
        onAction={config.onAction}
        onClose={hideToast}
        onHide={config.onHide}
      />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
