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

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  // Auth functions
  login: (email: string, password: string) => Promise<boolean>;
  register: (displayName: string, email: string, password: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Navigation helpers
  navigateToLogin: () => void;
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
  navigateToCodeVerify: (email: string) => void;
  navigateToMainApp: () => void;
  // Utility
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Login with email and password
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
            Alert.alert(
              'Đăng nhập thất bại',
              response.message || 'Email hoặc mật khẩu không đúng.'
            );
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
    },
    [navigation]
  );

  /**
   * Register new account
   */
  const register = useCallback(
    async (displayName: string, email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register({
          email,
          password,
          displayName,
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
        Alert.alert('Thành công', 'Xác thực email thành công! Bạn có thể sử dụng ứng dụng ngay.');
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

  return {
    isLoading,
    error,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    navigateToLogin,
    navigateToRegister,
    navigateToForgotPassword,
    navigateToCodeVerify,
    navigateToMainApp,
    clearError,
  };
};

export default useAuth;
