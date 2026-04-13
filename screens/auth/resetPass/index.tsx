import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { validateConfirmPassword } from '@services/auth';
import { RootStackParamList } from '@navigation/index';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

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
      <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />
        <ResponsiveContainer className="flex-1 justify-center items-center px-6" variant="form">
          <View className="w-20 h-20 rounded-full bg-[#5EF1AC]/20 items-center justify-center mb-6">
            <Text className="text-4xl">✅</Text>
          </View>

          <Text className="text-2xl font-bold text-white text-center mb-4">
            Đặt lại mật khẩu thành công!
          </Text>

          <Text className="text-base text-[#A1A1AA] text-center leading-6 mb-8">
            Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
          </Text>

          <TouchableOpacity
            onPress={navigateToLogin}
            className="bg-[#7C6AF6] py-4 px-8 rounded-full"
          >
            <Text className="text-white text-base font-semibold">Đăng nhập ngay</Text>
          </TouchableOpacity>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />
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
            className="w-10 h-10 rounded-xl bg-[#1A1A24] items-center justify-center mb-8"
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Title & Description */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-white mb-3">Đặt lại mật khẩu</Text>
            <Text className="text-base text-[#A1A1AA] leading-6">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Text>
          </View>

          {/* New Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#A1A1AA] mb-2">Mật khẩu mới</Text>
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
                className="h-14 border border-[#303046] rounded-xl px-4 pr-12 text-base text-white bg-[#101221]"
                placeholderTextColor="#6B7280"
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

            {/* Password Requirements - More compact */}
            <View className="mt-2 bg-[#1A1A24] rounded-xl p-3 border border-[#303046]">
              <View className="flex-row flex-wrap">
                {passwordValidation.map(rule => (
                  <View key={rule.id} className="flex-row items-center mr-3 mb-1">
                    {rule.passed ? (
                      <CheckCircle2 size={14} color="#5EF1AC" />
                    ) : (
                      <Circle size={14} color="#6B7280" />
                    )}
                    <Text
                      className={`ml-1.5 text-[11px] ${
                        rule.passed ? 'text-[#5EF1AC]' : 'text-[#A1A1AA]'
                      }`}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-[#A1A1AA] mb-2">Xác nhận mật khẩu</Text>
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
                className="h-14 border border-[#303046] rounded-xl px-4 pr-12 text-base text-white bg-[#101221]"
                placeholderTextColor="#6B7280"
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
            {/* Password match indicator - compact */}
            {confirmPassword.length > 0 && newPassword.length > 0 && (
              <View className="flex-row items-center mt-1.5 ml-1">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle2 size={14} color="#5EF1AC" />
                    <Text className="ml-1 text-[11px] text-[#5EF1AC]">Mật khẩu khớp</Text>
                  </>
                ) : (
                  <>
                    <Circle size={14} color="#EF4444" />
                    <Text className="ml-1 text-[11px] text-red-500">Mật khẩu không khớp</Text>
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
              isFormValid && !isLoading ? 'bg-[#7C6AF6]' : 'bg-[#7C6AF6]/40'
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
              <Text className="text-base font-semibold text-[#7C6AF6]">Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
