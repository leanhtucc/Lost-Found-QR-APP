import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AuthHeader } from '../components/AuthHeader';
import { LoginForm } from './components/LoginForm';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, navigateToRegister, navigateToForgotPassword, navigateToMainApp } =
    useAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      navigateToMainApp();
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implement Google login
    Alert.alert('Thông báo', 'Chức năng đăng nhập Google đang được phát triển');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-4 min-h-screen">
        <AuthHeader />

        <View className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Tab Switcher */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            <View className="flex-1 py-2.5 bg-white rounded-lg shadow-sm">
              <Text className="text-center text-sm font-medium text-gray-900">Đăng nhập</Text>
            </View>
            <TouchableOpacity className="flex-1 py-2.5" onPress={navigateToRegister}>
              <Text className="text-center text-sm font-medium text-gray-600">Đăng ký</Text>
            </TouchableOpacity>
          </View>

          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            onForgotPassword={navigateToForgotPassword}
          />
          <GoogleLoginButton onPress={handleGoogleLogin} />
        </View>

        <Text className="text-center text-sm text-gray-600 mt-6">
          © 2024 PTIT Lost & Found. Made with ❤️
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
