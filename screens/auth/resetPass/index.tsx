import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@hooks/useAuth';
import { validatePassword, validateConfirmPassword } from '@services/auth';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isLoading, navigateToLogin, navigateToRegister } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    const passwordResult = validatePassword(newPassword);
    if (!passwordResult.isValid && passwordResult.error) {
      newErrors.newPassword = passwordResult.error;
    }

    const confirmResult = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmResult.isValid && confirmResult.error) {
      newErrors.confirmPassword = confirmResult.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    // TODO: Implement reset password API
    // For now, just show success and navigate to login
    Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công!', [
      {
        text: 'Đăng nhập',
        onPress: navigateToLogin,
      },
    ]);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const clearError = (field: 'newPassword' | 'confirmPassword') => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid =
    newPassword.length >= 8 && confirmPassword.length >= 8 && newPassword === confirmPassword;

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
            <Text className="text-3xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu</Text>
            <Text className="text-base text-gray-500 leading-6">
              Nhập mật khẩu mới của bạn. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ
              thường và số.
            </Text>
          </View>

          {/* New Password Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</Text>
            <View className="relative">
              <TextInput
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  clearError('newPassword');
                }}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                className={`border rounded-xl px-4 py-4 pr-12 text-base text-gray-900 ${
                  errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-blue-50'
                }`}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-4"
              >
                {showNewPassword ? (
                  <Eye size={22} color="#6b7280" />
                ) : (
                  <EyeOff size={22} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text className="text-red-500 text-sm mt-1">{errors.newPassword}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className={`border rounded-xl px-4 py-4 pr-12 text-base text-gray-900 ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                }`}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4"
              >
                {showConfirmPassword ? (
                  <Eye size={22} color="#6b7280" />
                ) : (
                  <EyeOff size={22} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={!isFormValid || isLoading}
            className={`py-4 rounded-full mb-8 ${
              isFormValid && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

export default ResetPasswordScreen;
