import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { validateEmail } from '@services/auth';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isLoading, resendVerification, navigateToRegister, navigateToCodeVerify } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setError(emailResult.error || 'Email không hợp lệ');
      return;
    }

    setError('');
    const success = await resendVerification(email.trim());
    if (success) {
      navigateToCodeVerify(email.trim());
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isEmailValid = email.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-12">
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
              Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu.
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Địa chỉ Email</Text>
            <TextInput
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (error) setError('');
              }}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900 bg-white"
              placeholderTextColor="#9ca3af"
            />
            {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}
          </View>

          {/* Password Reset Button */}
          <TouchableOpacity
            onPress={handlePasswordReset}
            disabled={!isEmailValid || isLoading}
            className={`py-4 rounded-full mb-8 ${
              isEmailValid && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Create Account Link */}
          <TouchableOpacity onPress={navigateToRegister} className="pb-8">
            <Text className="text-center text-blue-600 text-base font-medium underline">
              Tạo tài khoản mới
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
