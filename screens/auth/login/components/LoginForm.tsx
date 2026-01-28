import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { InputField } from '../../../../components/InputField';
import { validateEmail } from '@services/auth';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, onForgotPassword }) => {
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
    <View className="gap-4">
      {/* Email Input */}
      <View>
        <View className="relative">
          <View className="absolute left-3 top-4 z-10">
            <Mail size={20} color="#6B7280" />
          </View>
          <InputField
            placeholder="Email (@stu.ptit.edu.vn)"
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            className="pl-10 h-12 rounded-xl bg-gray-50 border-0"
          />
        </View>
        {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>}
      </View>

      {/* Password Input */}
      <View>
        <View className="relative">
          <View className="absolute left-3 top-4 z-10">
            <Lock size={20} color="#6B7280" />
          </View>
          <InputField
            secureTextEntry={!showPassword}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={text => {
              setPassword(text);
              clearError('password');
            }}
            className="pl-10 pr-10 h-12 rounded-xl bg-gray-50 border-0"
          />
          <TouchableOpacity
            className="absolute right-3 top-4 z-10"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`h-12 rounded-xl justify-center items-center mt-2 ${
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

      {/* Forgot Password */}
      <TouchableOpacity onPress={onForgotPassword} className="items-center mt-4">
        <Text className="text-sm text-gray-600">
          Quên mật khẩu? <Text className="text-blue-600 font-medium">Khôi phục</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};
