import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthHeader } from '../components/AuthHeader';
import { RegisterForm } from './components/RegisterForm';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export const RegisterScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async (
    fullName: string,
    phone: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      // TODO: Implement registration logic
      console.log('Register:', { fullName, phone, email, password });
      // await registerAPI(fullName, phone, email, password);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // TODO: Implement Google login
      console.log('Google login');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
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
