import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { AuthInput } from '../../../../components/atoms/AuthInput';
import { Button } from '../../../../components/atoms/Button';
import { validateEmail } from '@services/auth';

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
      <AuthInput
        label="Email"
        placeholder="alex.guardian@findback.io"
        value={email}
        onChangeText={text => {
          setEmail(text);
          clearError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={20} color="#9CA3AF" />}
        error={errors.email}
      />

      {/* Password Input */}
      <View>
        <AuthInput
          label="Mật khẩu"
          placeholder="••••••••••••"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={text => {
            setPassword(text);
            clearError('password');
          }}
          leftIcon={<Lock size={20} color={errors.password ? '#ef4444' : '#9CA3AF'} />}
          rightIcon={
            showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        {/* Quên mật khẩu được đặt ngay dưới ô nhập password */}
        <TouchableOpacity onPress={onForgotPassword} className="self-end mt-2">
          <Text className="text-sm font-medium text-[#A1A1AA] hover:text-white">
            Quên mật khẩu?
          </Text>
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
