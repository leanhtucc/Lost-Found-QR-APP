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

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    displayName: string,
    email: string,
    password: string,
    phoneNumber: string,
    photoURL?: string
  ) => Promise<boolean>;
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
          await authApi.getProfile();

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
            Alert.alert(
              'Email chưa xác thực',
              'Vui lòng xác thực email của bạn trước khi đăng nhập.',
              [
                { text: 'Để sau', style: 'cancel' },
                {
                  text: 'Xác thực ngay',
                  onPress: () => navigation.navigate('CodeVerify', { phoneNumber: email }),
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
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        toast.error('Lỗi kết nối', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation, toast]
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

        if (response.success) {
          return true;
        } else {
          setError(response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
          Alert.alert(
            'Đăng ký thất bại',
            response.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
          );
          return false;
        }
      } catch (err) {
        const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Verify email with OTP code
   */
  const verifyEmail = useCallback(async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyEmail({ email, code });

      if (response.success) {
        // No alert needed - Congratulation screen will show the success message
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
    } catch (err) {
      const errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resend verification code
   */
  const resendVerification = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.resendVerification({ email });

      if (response.success) {
        Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn.');
        return true;
      } else {
        setError(response.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
        Alert.alert('Lỗi', response.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
        return false;
      }
    } catch (err) {
      const errorMessage = 'Không thể kết nối đến server.';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      // Still navigate to login even if API fails
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

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
      navigation.navigate('CodeVerify', { phoneNumber: email });
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
    register,
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
