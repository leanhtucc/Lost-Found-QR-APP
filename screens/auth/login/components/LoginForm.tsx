import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, Square, CheckSquare } from 'lucide-react-native';
import { InputField } from '../../../../components/InputField';
import { validateEmail } from '@services/auth';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
  rememberMe?: boolean;
  onRememberMeChange?: (value: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  onForgotPassword,
  rememberMe = false,
  onRememberMeChange,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = validateEmail(email);
    if (!emailResult.isValid && emailResult.error) {
      newErrors.email = emailResult.error;
    }

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
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
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
        <InputField
          placeholder="example@gmail.com"
          value={email}
          onChangeText={text => {
            setEmail(text);
            clearError('email');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4"
        />
        {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
      </View>

      {/* Password Input */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu</Text>
        <View className="relative">
          <InputField
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            value={password}
            onChangeText={text => {
              setPassword(text);
              clearError('password');
            }}
            className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 pr-12"
          />
          <TouchableOpacity
            className="absolute right-4 top-4 z-10"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={22} color="#9CA3AF" />
            ) : (
              <Eye size={22} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
      </View>

      {/* Remember Me & Forgot Password Row */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => onRememberMeChange?.(!rememberMe)}
        >
          {rememberMe ? (
            <CheckSquare size={20} color="#2563EB" />
          ) : (
            <Square size={20} color="#9CA3AF" />
          )}
          <Text className="text-sm text-gray-600 ml-2">Ghi nhớ đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onForgotPassword}>
          <Text className="text-sm font-medium text-blue-600">Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`h-14 rounded-full justify-center items-center mt-2 ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
        }`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-base font-semibold">Đăng nhập</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
