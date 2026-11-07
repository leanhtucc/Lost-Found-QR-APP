import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../../components/atoms/Button';
import { FormField } from '@components/kit';
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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const next: { email?: string; password?: string } = {};

    const emailResult = validateEmail(email);
    if (!emailResult.isValid && emailResult.error) {
      next.email = emailResult.error;
    }

    if (!password) {
      next.password = 'Mật khẩu không được để trống';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
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
      <FormField
        label="Email"
        icon={<Mail size={20} color={FIND_BACK.mutedText} />}
        placeholder="ten@email.com"
        value={email}
        onChangeText={text => {
          setEmail(text);
          clearError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />

      <View>
        <FormField
          label="Mật khẩu"
          icon={<Lock size={20} color={errors.password ? FIND_BACK.danger : FIND_BACK.mutedText} />}
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={text => {
            setPassword(text);
            clearError('password');
          }}
          password
          autoComplete="password"
          textContentType="password"
          error={errors.password}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onForgotPassword}
          hitSlop={8}
          className="mt-1 min-h-[44px] items-end justify-center"
        >
          <Text className="text-sm font-semibold text-fb-primary-light">Quên mật khẩu?</Text>
        </Pressable>
      </View>

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
  );
};
