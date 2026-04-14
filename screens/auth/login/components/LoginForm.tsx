import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../../components/atoms/Button';
import { validateEmail } from '@services/auth';
import { FIND_BACK } from '@constants/theme';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
  rememberMe?: boolean;
  onRememberMeChange?: (value: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = validateEmail(email);
    if (!emailResult.isValid && emailResult.error) {
      newErrors.email = emailResult.error;
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email.trim(), password);
    }
  };

  const clearError = (field: 'email' | 'password') => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View className="gap-5">
      {/* Email Input */}
      <View className="w-full">
        <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
          Email
        </Text>
        <View
          className={`flex-row items-center h-[56px] rounded-2xl bg-fb-surface-muted px-4 border ${
            errors.email
              ? 'border-red-500'
              : isEmailFocused
                ? 'border-fb-primary'
                : 'border-transparent'
          }`}
        >
          <View className="mr-4">
            <Mail size={20} color={FIND_BACK.mutedText} />
          </View>
          <TextInput
            className="flex-1 text-white text-[15px] h-full"
            placeholder="alex.guardian@findback.io"
            placeholderTextColor={FIND_BACK.mutedText}
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearError('email');
            }}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* Cân đối với khoảng trống của icon mắt ở mật khẩu */}
          <View className="ml-4 p-1" pointerEvents="none">
            <View style={{ width: 20, height: 20 }} />
          </View>
        </View>
        {errors.email ? (
          <Text className="text-red-500 text-[13px] mt-2">{errors.email}</Text>
        ) : null}
      </View>

      {/* Password Input */}
      <View>
        <View className="w-full">
          <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
            Mật khẩu
          </Text>
          <View
            className={`flex-row items-center h-[56px] rounded-2xl bg-fb-surface-muted px-4 border ${
              errors.password
                ? 'border-red-500'
                : isPasswordFocused
                  ? 'border-fb-primary'
                  : 'border-transparent'
            }`}
          >
            <View className="mr-4">
              <Lock size={20} color={errors.password ? FIND_BACK.danger : FIND_BACK.mutedText} />
            </View>
            <TextInput
              className="flex-1 text-white text-[15px] h-full"
              placeholder="••••••••••••"
              placeholderTextColor={FIND_BACK.mutedText}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={text => {
                setPassword(text);
                clearError('password');
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity className="ml-4 p-1" onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={FIND_BACK.mutedText} />
              ) : (
                <Eye size={20} color={FIND_BACK.mutedText} />
              )}
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text className="text-red-500 text-[13px] mt-2">{errors.password}</Text>
          ) : null}
        </View>

        {/* Quên mật khẩu được đặt ngay dưới ô nhập password */}
        <TouchableOpacity onPress={onForgotPassword} className="self-end mt-2">
          <Text className="text-sm font-medium text-fb-muted hover:text-white">Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <View className="mt-4">
        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={isLoading}
          style={{ minHeight: 56 }}
          textClassName="text-white text-base font-bold"
        >
          Đăng nhập
        </Button>
      </View>
    </View>
  );
};
