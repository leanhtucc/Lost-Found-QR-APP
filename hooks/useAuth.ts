/**
 * useAuth Hook
 * Handles all authentication logic including login, register, verify, etc.
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { authApi } from '@services/auth';
import { useToast } from '@contexts/ToastContext';
import { useAuthContext } from '@contexts/AuthContext';

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const MOCK_TEST_PHONE_LOCAL = '0398624656';
const AUTH_REGISTER_LOG_TAG = '[Auth:RegisterFlow]';

const normalizePhoneDigits = (phoneNumber: string): string => phoneNumber.replace(/\D/g, '');

const maskPhoneForLog = (phoneNumber: string): string => {
  const digits = normalizePhoneDigits(phoneNumber);
  if (digits.length < 3) return phoneNumber;
  return `***${digits.slice(-3)}`;
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

const logRegisterFlow = (event: string, details?: Record<string, unknown>) => {
  console.log(`${AUTH_REGISTER_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

const isMockTestPhone = (phoneNumber: string): boolean => {
  const digits = normalizePhoneDigits(phoneNumber);
  return digits === MOCK_TEST_PHONE_LOCAL || digits === `84${MOCK_TEST_PHONE_LOCAL.slice(1)}`;
};

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  firebaseVerify: (idToken: string) => Promise<boolean>;
  register: (
    displayName: string,
    email: string,
    password: string,
    phoneNumber: string,
    photoURL?: string
  ) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<boolean>;
  resendOtp: (phoneNumber: string) => Promise<boolean>;
  // Backward-compatible aliases
  verifyEmail: (phoneNumber: string, code: string) => Promise<boolean>;
  resendVerification: (phoneNumber: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Navigation helpers
  navigateToLogin: () => void;
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
  navigateToCodeVerify: (phoneNumber: string) => void;
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

  /**
   * Login with email and password
   * Shows success toast and navigates to home on success
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login({ email, password });

        if (response.success) {
          // Fetch user profile after successful login
          const profileResponse = await authApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          }

          setAuthenticated(true);
          await updateLastActivity();

          // Show success toast
          toast.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');

          // Navigate to main app after a short delay
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TabNavigator' }],
            });
          }, 500);

          return true;
        } else {
          // Check if email not verified
          if (response.message?.includes('verify')) {
            const unverifiedPhone = (response as any)?.data?.phoneNumber;
            Alert.alert(
              'Tài khoản chưa xác thực',
              'Vui lòng xác thực tài khoản của bạn trước khi đăng nhập.',
              [
                { text: 'Để sau', style: 'cancel' },
                ...(unverifiedPhone
                  ? [
                      {
                        text: 'Xác thực ngay',
                        onPress: () =>
                          navigation.navigate('CodeVerify', { phoneNumber: unverifiedPhone }),
                      },
                    ]
                  : []),
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
      phoneNumber: string,
      photoURL?: string
    ): Promise<boolean> => {
      const requestId = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const startedAt = Date.now();

      logRegisterFlow('register_start', {
        requestId,
        displayNameLength: displayName.trim().length,
        email,
        phoneMasked: maskPhoneForLog(phoneNumber),
        passwordLength: password.length,
        hasPhotoURL: Boolean(photoURL),
      });

      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register({
          email,
          password,
          displayName,
          phoneNumber,
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
            phoneMasked: maskPhoneForLog(phoneNumber),
          });
          return true;
        } else {
          const shouldBypassForMockPhone =
            isMockTestPhone(phoneNumber) &&
            /(đã được đăng ký|already|exists|duplicate)/i.test(
              `${response.message || ''} ${response.error || ''}`
            );

          logRegisterFlow('register_failure_detected', {
            requestId,
            durationMs: Date.now() - startedAt,
            message: response.message,
            error: response.error,
            shouldBypassForMockPhone,
            isMockPhone: isMockTestPhone(phoneNumber),
          });

          if (shouldBypassForMockPhone) {
            logRegisterFlow('register_mock_bypass_enabled', {
              requestId,
              phoneMasked: maskPhoneForLog(phoneNumber),
              reason: 'phone_exists_in_backend_and_mock_mode_enabled',
            });
            toast.success('Chế độ test OTP', 'Bỏ qua bước đăng ký, dùng mã test 123456 ở màn OTP.');
            return true;
          }

          logRegisterFlow('register_fail_return_false', {
            requestId,
            durationMs: Date.now() - startedAt,
            userMessage: response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          });

          setError(response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
          Alert.alert(
            'Đăng ký thất bại',
            response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
          );
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
    [toast]
  );

  /**
   * Verify OTP with phone number
   */
  const verifyOtp = useCallback(
    async (phoneNumber: string, code: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.verifyOtp({ phoneNumber, code });

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
          // Handle specific errors
          if (response.message?.includes('expired')) {
            setError('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
            Alert.alert('Mã hết hạn', 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
          } else {
            setError(response.message || 'Mã xác thực không đúng.');
            Alert.alert('Xác thực thất bại', response.message || 'Mã xác thực không đúng.');
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
   * Resend OTP code
   */
  const resendOtp = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.resendOtp({ phoneNumber });

      if (response.success) {
        Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến số điện thoại của bạn.');
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
    (phoneNumber: string) => {
      navigation.navigate('CodeVerify', { phoneNumber });
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
