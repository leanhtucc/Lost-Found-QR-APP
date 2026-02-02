import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@contexts/ToastContext';
import { LoginForm } from './components/LoginForm';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import type { User } from '@services/auth/types';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, navigateToRegister, navigateToForgotPassword, navigateToMainApp } =
    useAuth();
  const toast = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      navigateToMainApp();
    }
  };

  const handleGoogleSuccess = async (user: User, isNewUser: boolean) => {
    // User đã được authenticate và tokens đã được lưu vào storage
    // Show success message
    if (isNewUser) {
      toast.success(
        'Đăng ký thành công!',
        `Chào mừng ${user.displayName} đến với Lost & Found QR!`
      );
    } else {
      toast.success('Đăng nhập thành công!', `Chào mừng bạn quay lại, ${user.displayName}!`);
    }

    // Navigate to main app after a short delay
    setTimeout(() => {
      navigateToMainApp();
    }, 500);
  };

  const handleGoogleError = (error: string) => {
    toast.error('Đăng nhập Google thất bại', error);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 mt-14">
          {/* Welcome Text */}
          <View className="mb-2">
            <Text className="text-base text-gray-500">Chào mừng bạn quay trở lại!</Text>
          </View>

          {/* Title */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900">Đăng nhập</Text>
          </View>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            onForgotPassword={navigateToForgotPassword}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
          />

          {/* Google Sign In */}
          <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

          {/* Register Link */}
          <View className="flex-row justify-center mt-8 mb-6">
            <Text className="text-base text-gray-600">Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-base font-semibold text-blue-600">Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
