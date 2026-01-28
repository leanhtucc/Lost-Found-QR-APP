import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AuthHeader } from '../components/AuthHeader';
import { RegisterForm } from './components/RegisterForm';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { useAuth } from '@hooks/useAuth';

export const RegisterScreen: React.FC = () => {
  const { isLoading, register, navigateToLogin, navigateToCodeVerify } = useAuth();

  const handleRegister = async (displayName: string, email: string, password: string) => {
    const success = await register(displayName, email, password);
    if (success) {
      // Navigate to OTP verification screen
      navigateToCodeVerify(email);
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
            <TouchableOpacity className="flex-1 py-2.5" onPress={navigateToLogin}>
              <Text className="text-center text-sm font-medium text-gray-600">Đăng nhập</Text>
            </TouchableOpacity>
            <View className="flex-1 py-2.5 bg-white rounded-lg shadow-sm">
              <Text className="text-center text-sm font-medium text-gray-900">Đăng ký</Text>
            </View>
          </View>

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          <GoogleLoginButton onPress={handleGoogleLogin} />
        </View>

        <Text className="text-center text-sm text-gray-600 mt-6">
          © 2024 PTIT Lost & Found. Made with ❤️
        </Text>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
