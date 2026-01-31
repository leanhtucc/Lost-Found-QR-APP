import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { validateConfirmPassword } from '@services/auth';
import { RootStackParamList } from '@navigation/index';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

// Password validation rules
interface PasswordRule {
  id: string;
  label: string;
  isValid: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: 'Độ dài từ 8-12 ký tự',
    isValid: (password: string) => password.length >= 8 && password.length <= 12,
  },
  {
    id: 'uppercase',
    label: 'Chứa ít nhất một chữ in hoa',
    isValid: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Chứa ít nhất một chữ thường',
    isValid: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Chứa ít nhất một chữ số',
    isValid: (password: string) => /\d/.test(password),
  },
];

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ResetPasswordRouteProp>();
  const { isLoading, resetPassword, navigateToLogin } = useAuth();

  // Get token from route params (from deep link)
  const token = route.params?.token || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate password validation status
  const passwordValidation = passwordRules.map(rule => ({
    ...rule,
    passed: rule.isValid(newPassword),
  }));

  const allPasswordRulesPassed = passwordValidation.every(rule => rule.passed);

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!allPasswordRulesPassed) {
      newErrors.newPassword = 'Mật khẩu chưa đáp ứng đủ yêu cầu';
    }

    const confirmResult = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmResult.isValid && confirmResult.error) {
      newErrors.confirmPassword = confirmResult.error;
    }

    if (!token) {
      newErrors.newPassword = 'Link đặt lại mật khẩu không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    const success = await resetPassword(token, newPassword);
    if (success) {
      setIsSuccess(true);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const clearError = (field: 'newPassword' | 'confirmPassword') => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = allPasswordRulesPassed && newPassword === confirmPassword && token.length > 0;

  // Success state
  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
            <Text className="text-4xl">✅</Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Đặt lại mật khẩu thành công!
          </Text>

          <Text className="text-base text-gray-500 text-center leading-6 mb-8">
            Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
          </Text>

          <TouchableOpacity
            onPress={navigateToLogin}
            className="bg-blue-600 py-4 px-8 rounded-full"
          >
            <Text className="text-white text-base font-semibold">Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 mt-14">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleGoBack}
              className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-8"
            >
              <ChevronLeft size={24} color="#1f2937" />
            </TouchableOpacity>

            {/* Title & Description */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu</Text>
              <Text className="text-base text-gray-500 leading-6">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </Text>
            </View>

            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</Text>
              <View className="relative">
                <TextInput
                  value={newPassword}
                  onChangeText={text => {
                    setNewPassword(text);
                    clearError('newPassword');
                  }}
                  placeholder="••••••••"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  className="h-14 border border-gray-200 rounded-xl px-4 pr-12 text-base text-gray-900 bg-gray-50"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-4"
                >
                  {showNewPassword ? (
                    <EyeOff size={22} color="#9CA3AF" />
                  ) : (
                    <Eye size={22} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.newPassword}</Text>
              )}

              {/* Password Requirements */}
              <View className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                {passwordValidation.map(rule => (
                  <View key={rule.id} className="flex-row items-center mb-2 last:mb-0">
                    {rule.passed ? (
                      <CheckCircle2 size={18} color="#22c55e" />
                    ) : (
                      <Circle size={18} color="#9ca3af" />
                    )}
                    <Text
                      className={`ml-2 text-sm ${rule.passed ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  className="h-14 border border-gray-200 rounded-xl px-4 pr-12 text-base text-gray-900 bg-gray-50"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={22} color="#9CA3AF" />
                  ) : (
                    <Eye size={22} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
              )}
              {/* Password match indicator */}
              {confirmPassword.length > 0 && newPassword.length > 0 && (
                <View className="flex-row items-center mt-2">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle2 size={16} color="#22c55e" />
                      <Text className="ml-1 text-sm text-green-600">Mật khẩu khớp</Text>
                    </>
                  ) : (
                    <>
                      <Circle size={16} color="#ef4444" />
                      <Text className="ml-1 text-sm text-red-500">Mật khẩu không khớp</Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={!isFormValid || isLoading}
              className={`h-14 rounded-full justify-center items-center mb-8 ${
                isFormValid && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Back to Login Link */}
            <View className="flex-row justify-center pb-8">
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-base font-semibold text-blue-600">Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
