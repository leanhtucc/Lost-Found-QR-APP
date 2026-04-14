import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FIND_BACK } from '@constants/theme';

interface ForgotPassFormViewProps {
  email: string;
  error: string;
  isLoading: boolean;
  isEmailValid: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onRegister: () => void;
}

export const ForgotPassFormView: React.FC<ForgotPassFormViewProps> = ({
  email,
  error,
  isLoading,
  isEmailValid,
  onEmailChange,
  onSubmit,
  onRegister,
}) => {
  return (
    <>
      <View className="mb-10">
        <Text className="text-3xl font-bold text-gray-900 mb-3">Quên mật khẩu?</Text>
        <Text className="text-base text-gray-500 leading-6">
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="h-14 border border-gray-200 rounded-xl px-4 text-base text-gray-900 bg-gray-50"
          placeholderTextColor={FIND_BACK.mutedText}
        />
        {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!isEmailValid || isLoading}
        className={`h-14 rounded-full justify-center items-center mb-8 ${
          isEmailValid && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color={FIND_BACK.bodyText} />
        ) : (
          <Text className="text-white text-center text-base font-semibold">
            Gửi link đặt lại mật khẩu
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-1" />

      <View className="flex-row justify-center pb-8">
        <Text className="text-base text-gray-600">Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text className="text-base font-semibold text-blue-600">Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
