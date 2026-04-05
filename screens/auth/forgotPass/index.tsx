import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { validateEmail } from '@services/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isLoading, forgotPassword, navigateToRegister, navigateToLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasswordReset = async () => {
    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setError(emailResult.error || 'Email không hợp lệ');
      return;
    }

    setError('');
    const success = await forgotPassword(email.trim());
    if (success) {
      setIsSuccess(true);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isEmailValid = email.trim().length > 0;

  // Success state
  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ResponsiveContainer className="flex-1 px-6 mt-14 justify-center" variant="form">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-8"
          >
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* Success Content */}
          <View className="flex-1 justify-center items-center px-4">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
              <Text className="text-4xl">✉️</Text>
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              Kiểm tra email của bạn
            </Text>

            <Text className="text-base text-gray-500 text-center leading-6 mb-8">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email{' '}
              <Text className="font-semibold text-gray-700">{email}</Text>
            </Text>

            <Text className="text-sm text-gray-400 text-center mb-8">
              Link sẽ hết hạn sau 30 phút
            </Text>

            <TouchableOpacity
              onPress={navigateToLogin}
              className="bg-blue-600 py-4 px-8 rounded-full"
            >
              <Text className="text-white text-base font-semibold">Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6 mt-14 justify-center" variant="form">
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-8"
          >
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>

          {/* Title & Description */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900 mb-3">Quên mật khẩu?</Text>
            <Text className="text-base text-gray-500 leading-6">
              Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (error) setError('');
              }}
              placeholder="example@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="h-14 border border-gray-200 rounded-xl px-4 text-base text-gray-900 bg-gray-50"
              placeholderTextColor="#9ca3af"
            />
            {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}
          </View>

          {/* Password Reset Button */}
          <TouchableOpacity
            onPress={handlePasswordReset}
            disabled={!isEmailValid || isLoading}
            className={`h-14 rounded-full justify-center items-center mb-8 ${
              isEmailValid && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center text-base font-semibold">
                Gửi link đặt lại mật khẩu
              </Text>
            )}
          </TouchableOpacity>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Create Account Link */}
          <View className="flex-row justify-center pb-8">
            <Text className="text-base text-gray-600">Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-base font-semibold text-blue-600">Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
