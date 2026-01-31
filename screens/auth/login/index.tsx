import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '@hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { SocialLoginButtons } from '../components/SocialLoginButtons';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, navigateToRegister, navigateToForgotPassword, navigateToMainApp } =
    useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      navigateToMainApp();
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Google đang được phát triển');
  };

  const handleAppleLogin = async () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Apple đang được phát triển');
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

          {/* Social Login */}
          <SocialLoginButtons onGooglePress={handleGoogleLogin} onApplePress={handleAppleLogin} />

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
