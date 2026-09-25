/**
 * useAuth Hook
 * Handles all authentication logic including login, register, verify, etc.
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { authApi, User } from '@services/auth';
import { useToast } from '@contexts/ToastContext';
import { useAuthContext } from '@contexts/AuthContext';

export interface LoginOptions {
  autoNavigate?: boolean;
  onSuccess?: (user: User | null) => void;
}

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const AUTH_REGISTER_LOG_TAG = '[Auth:RegisterFlow]';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const maskEmailForLog = (email: string): string => {
  const [localPart, domain] = normalizeEmail(email).split('@');
  if (!localPart || !domain) return 'invalid-email';
  return `${localPart.slice(0, 1)}***@${domain}`;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
};

const formatAuthErrorMessage = (
  response: { message?: string; error?: unknown },
  fallbackMessage: string = 'Đã có lỗi xảy ra. Vui lòng thử lại.'
): string => {
  if (response.error && typeof response.error === 'object' && 'fields' in response.error) {
    const fields = (response.error as { fields?: Record<string, string> }).fields;
    if (fields && typeof fields === 'object') {
      const messages = Object.values(fields).filter(Boolean);
      if (messages.length > 0) {
        return messages
          .map(msg => {
            if (/password confirmation is required/i.test(msg))
              return 'Vui lòng xác nhận mật khẩu.';
            if (/password confirmation does not match/i.test(msg))
              return 'Mật khẩu xác nhận không khớp.';
            if (/password must be at least 8/i.test(msg))
              return 'Mật khẩu phải có ít nhất 8 ký tự.';
            if (/password must contain/i.test(msg))
              return 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.';
            if (/email.*required/i.test(msg)) return 'Email là bắt buộc.';
            if (/email.*valid/i.test(msg)) return 'Email không hợp lệ.';
            if (/already (exists|taken|registered|in use)/i.test(msg))
              return 'Email này đã được sử dụng.';
            return msg;
          })
          .join('\n');
      }
    }
  }

  if (response.message && response.message !== 'Request data is invalid') {
    if (/already (exists|taken|registered|in use)/i.test(response.message)) {
      return 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
    }
    return response.message;
  }

  return fallbackMessage;
};

const logRegisterFlow = (event: string, details?: Record<string, unknown>) => {
  console.log(`${AUTH_REGISTER_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  // Auth functions
  login: (email: string, password: string, options?: LoginOptions) => Promise<boolean>;
  completeLogin: () => void;
  firebaseVerify: (idToken: string) => Promise<boolean>;
  register: (
    displayName: string,
    email: string,
    password: string,
    confirmPassword?: string,
    photoURL?: string
  ) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  // Backward-compatible aliases
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Navigation helpers
  navigateToLogin: () => void;
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
  navigateToCodeVerify: (email: string) => void;
  navigateToMainApp: () => void;
  navigateToResetPassword: (token: string) => void;
  // Utility
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigation = useNavigation<AuthNavigationProp>();
  const toast = useToast();
  const { setAuthenticated, setUser, updateLastActivity } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const completeLogin = useCallback(() => {
    setAuthenticated(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigator' }],
    });
  }, [navigation, setAuthenticated]);

  /**
   * Login with email and password
   * Shows success toast and navigates to home on success
   */
  const login = useCallback(
    async (email: string, password: string, options?: LoginOptions): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login({ email, password });

        if (response.success) {
          // Fetch user profile after successful login
          let loadedUser: User | null = null;
          const profileResponse = await authApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            loadedUser = profileResponse.data;
            setUser(profileResponse.data);
          }

          await updateLastActivity();
          options?.onSuccess?.(loadedUser);

          if (options?.autoNavigate !== false) {
            setAuthenticated(true);

            // Show success toast
            toast.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');

            // Navigate to main app after a short delay
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'TabNavigator' }],
              });
            }, 500);
          }

          return true;
        } else {
          // Check if email not verified
          if (/(verify|verification|xác thực|xác minh|chưa xác)/i.test(response.message || '')) {
            Alert.alert(
              'Tài khoản chưa xác thực',
              'Vui lòng xác thực email của bạn trước khi đăng nhập.',
              [
                { text: 'Để sau', style: 'cancel' },
                {
                  text: 'Xác thực ngay',
                  onPress: () =>
                    navigation.navigate('CodeVerify', { email: normalizeEmail(email) }),
                },
              ]
            );
          } else {
            setError(response.message || 'Email hoặc mật khẩu không đúng.');
            toast.error(
              'Đăng nhập thất bại',
              response.message || 'Email hoặc mật khẩu không đúng.'
            );
          }
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        toast.error('Lỗi kết nối', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, setAuthenticated, setUser, toast, updateLastActivity]
  );

  /**
   * Verify Firebase authentication
   * Sends Firebase ID Token to backend
   */
  const firebaseVerify = useCallback(
    async (idToken: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.firebaseVerify({ idToken });

        if (response.success) {
          if (response.data?.user) {
            setUser(response.data.user);
          }
          setAuthenticated(true);
          await updateLastActivity();

          toast.success('Xác thực thành công', 'Chào mừng bạn đến với ứng dụng!');
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TabNavigator' }],
            });
          }, 500);
          return true;
        } else {
          setError(response.message || 'Xác thực thất bại.');
          toast.error('Xác thực thất bại', response.message || 'Vui lòng thử lại.');
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        toast.error('Lỗi kết nối', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, setAuthenticated, setUser, toast, updateLastActivity]
  );

  /**
   * Register new account
   */
  const register = useCallback(
    async (
      displayName: string,
      email: string,
      password: string,
      confirmPassword?: string,
      photoURL?: string
    ): Promise<boolean> => {
      const requestId = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startedAt = Date.now();
      const normalizedEmail = normalizeEmail(email);

      logRegisterFlow('register_start', {
        requestId,
        displayNameLength: displayName.trim().length,
        emailMasked: maskEmailForLog(normalizedEmail),
        passwordLength: password.length,
        hasPasswordConfirmation: Boolean(confirmPassword),
        hasPhotoURL: Boolean(photoURL),
      });

      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register({
          email: normalizedEmail,
          password,
          password_confirmation: confirmPassword || password,
          displayName: displayName.trim(),
          full_name: displayName.trim(),
          photoURL,
        });

        logRegisterFlow('register_response', {
          requestId,
          durationMs: Date.now() - startedAt,
          success: response.success,
          message: response.message,
          error: response.error,
          hasData: Boolean(response.data),
        });

        if (response.success) {
          logRegisterFlow('register_success', {
            requestId,
            durationMs: Date.now() - startedAt,
            nextStep: 'navigate_to_code_verify',
            emailMasked: maskEmailForLog(normalizedEmail),
          });
          return true;
        } else {
          const userMessage = formatAuthErrorMessage(
            response,
            'Đã có lỗi xảy ra. Vui lòng thử lại.'
          );

          logRegisterFlow('register_failure_detected', {
            requestId,
            durationMs: Date.now() - startedAt,
            message: response.message,
            error: response.error,
            userMessage,
          });

          logRegisterFlow('register_fail_return_false', {
            requestId,
            durationMs: Date.now() - startedAt,
            userMessage,
          });

          setError(userMessage);
          Alert.alert('Đăng ký thất bại', userMessage);
          return false;
        }
      } catch (err) {
        logRegisterFlow('register_exception', {
          requestId,
          durationMs: Date.now() - startedAt,
          exception: serializeError(err),
        });

        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
        logRegisterFlow('register_finish', {
          requestId,
          totalDurationMs: Date.now() - startedAt,
          isLoadingSetTo: false,
        });
      }
    },
    []
  );

  /**
   * Verify the OTP sent to the registration email.
   */
  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<boolean> => {
      const normalizedEmail = normalizeEmail(email);
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.verifyOtp({ email: normalizedEmail, code });

        if (response.success) {
          if (response.data?.user) {
            setUser(response.data.user);
          } else {
            const profileResponse = await authApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data);
            }
          }

          setAuthenticated(true);
          await updateLastActivity();

          toast.success('Xác thực thành công', 'Chào mừng bạn đến với ứng dụng!');
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TabNavigator' }],
            });
          }, 500);
          return true;
        } else {
          // Check if the user was already verified previously
          if (
            response.message?.includes('No pending registration found') ||
            response.message?.includes('không tìm thấy đăng ký')
          ) {
            Alert.alert(
              'Tài khoản đã xác thực',
              'Tài khoản này đã hoàn tất xác thực trước đó. Vui lòng đăng nhập để tiếp tục.',
              [
                {
                  text: 'Đăng nhập ngay',
                  onPress: () =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    }),
                },
              ]
            );
            return false;
          }

          if (response.message?.includes('expired') || response.message?.includes('hết hạn')) {
            setError('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
            Alert.alert('Mã hết hạn', 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
          } else {
            const errorMessage = formatAuthErrorMessage(response, 'Mã xác thực không đúng.');
            setError(errorMessage);
            Alert.alert('Xác thực thất bại', errorMessage);
          }
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, setAuthenticated, setUser, toast, updateLastActivity]
  );

  /**
   * Resend OTP code to the registration email.
   */
  const resendOtp = useCallback(async (email: string): Promise<boolean> => {
    const normalizedEmail = normalizeEmail(email);
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.resendOtp({ email: normalizedEmail });

      if (response.success) {
        Alert.alert('Đã gửi mã', 'Mã OTP mới đã được gửi đến email của bạn.');
        return true;
      } else {
        setError(response.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
        Alert.alert('Lỗi', response.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const errorMessage = 'Không thể kết nối đến server.';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Backward-compatible aliases
  const verifyEmail = verifyOtp;
  const resendVerification = resendOtp;

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setAuthenticated(false);
      setUser(null);
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setAuthenticated(false);
      setUser(null);
      // Still navigate to login even if API fails
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigation, setAuthenticated, setUser]);

  /**
   * Request password reset email
   */
  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.forgotPassword({ email });

      if (response.success) {
        Alert.alert(
          'Email đã gửi',
          'Nếu tài khoản tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.'
        );
        return true;
      } else {
        // Still show success message for security (don't reveal if email exists)
        Alert.alert(
          'Email đã gửi',
          'Nếu tài khoản tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.'
        );
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại.';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.resetPassword({ token, newPassword });

        if (response.success) {
          Alert.alert(
            'Thành công',
            'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.'
          );
          return true;
        } else {
          // Handle specific error messages
          if (response.message?.includes('expired')) {
            setError('Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.');
            Alert.alert('Hết hạn', 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.');
          } else if (response.message?.includes('Invalid')) {
            setError('Link đặt lại mật khẩu không hợp lệ.');
            Alert.alert('Không hợp lệ', 'Link đặt lại mật khẩu không hợp lệ.');
          } else {
            setError(response.message || 'Không thể đặt lại mật khẩu.');
            Alert.alert('Lỗi', response.message || 'Không thể đặt lại mật khẩu.');
          }
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại.';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ==================== NAVIGATION HELPERS ====================

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const navigateToRegister = useCallback(() => {
    navigation.navigate('AuthRegister');
  }, [navigation]);

  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const navigateToCodeVerify = useCallback(
    (email: string) => {
      navigation.navigate('CodeVerify', { email: normalizeEmail(email) });
    },
    [navigation]
  );

  const navigateToMainApp = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigator' }],
    });
  }, [navigation]);

  const navigateToResetPassword = useCallback(
    (token: string) => {
      navigation.navigate('ResetPassword', { token } as any);
    },
    [navigation]
  );

  return {
    isLoading,
    error,
    login,
    completeLogin,
    firebaseVerify,
    register,
    verifyOtp,
    resendOtp,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    navigateToLogin,
    navigateToRegister,
    navigateToForgotPassword,
    navigateToCodeVerify,
    navigateToMainApp,
    navigateToResetPassword,
    clearError,
  };
};

export default useAuth;
