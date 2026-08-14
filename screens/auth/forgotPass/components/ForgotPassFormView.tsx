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
        <Text className="mb-3 text-3xl font-bold text-fb-content">Quên mật khẩu?</Text>
        <Text className="text-base leading-6 text-fb-muted">
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-fb-muted">
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="h-14 rounded-2xl border border-fb-border-subtle bg-fb-surface-muted px-4 text-base text-fb-content"
          placeholderTextColor={FIND_BACK.mutedText}
        />
        {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!isEmailValid || isLoading}
        accessibilityRole="button"
        className={`mb-8 h-14 items-center justify-center rounded-2xl ${
          isEmailValid && !isLoading ? 'bg-fb-primary' : 'bg-fb-surface-elevated'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color={FIND_BACK.bodyText} />
        ) : (
          <Text className="text-center text-base font-semibold text-fb-content">
            Gửi link đặt lại mật khẩu
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-1" />

      <View className="flex-row justify-center pb-8">
        <Text className="text-base text-fb-muted">Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text className="text-base font-semibold text-fb-primary-light">Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
