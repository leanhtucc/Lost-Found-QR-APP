import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { useAuth } from '@hooks/useAuth';
import { RegisterForm } from './components/RegisterForm';
import { SocialLoginButtons } from '../components/SocialLoginButtons';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { isLoading, register, navigateToLogin, navigateToCodeVerify } = useAuth();

  const handleRegister = async (
    displayName: string,
    email: string,
    password: string,
    phoneNumber: string,
    photoURL?: string
  ) => {
    const success = await register(displayName, email, password, phoneNumber, photoURL);
    if (success) {
      // Navigate to OTP verification screen
      navigateToCodeVerify(email);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Google đang được phát triển');
  };

  const handleAppleLogin = async () => {
    Alert.alert('Thông báo', 'Chức năng đăng nhập Apple đang được phát triển');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-9">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-4"
          >
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* Welcome Text */}
          <View className="mb-2">
            <Text className="text-base text-gray-500">Tạo tài khoản mới</Text>
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900">Đăng ký</Text>
          </View>

          {/* Register Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Social Login */}
          <SocialLoginButtons onGooglePress={handleGoogleLogin} onApplePress={handleAppleLogin} />

          {/* Login Link */}
          <View className="flex-row justify-center mt-8 mb-6">
            <Text className="text-base text-gray-600">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-base font-semibold text-blue-600">Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
