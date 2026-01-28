import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { InputField } from '../../../../components/InputField';
import { validateEmail, validateDisplayName, validateConfirmPassword } from '@services/auth';

interface RegisterFormProps {
  onSubmit: (displayName: string, email: string, password: string) => void;
  isLoading: boolean;
}

// Password validation rules
interface PasswordRule {
  id: string;
  label: string;
  isValid: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: 'Độ dài từ 8-12 ký tự bao gồm cả chữ và số',
    isValid: (password: string) =>
      password.length >= 8 &&
      password.length <= 12 &&
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password),
  },
  {
    id: 'uppercase',
    label: 'Chứa ít nhất một chữ in hoa',
    isValid: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'Chứa ít nhất một chữ số',
    isValid: (password: string) => /\d/.test(password),
  },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate password validation status
  const passwordValidation = useMemo(() => {
    return passwordRules.map(rule => ({
      ...rule,
      passed: rule.isValid(password),
    }));
  }, [password]);

  const allPasswordRulesPassed = passwordValidation.every(rule => rule.passed);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const displayNameResult = validateDisplayName(displayName);
    if (!displayNameResult.isValid && displayNameResult.error) {
      newErrors.displayName = displayNameResult.error;
    }

    const emailResult = validateEmail(email);
    if (!emailResult.isValid && emailResult.error) {
      newErrors.email = emailResult.error;
    }

    // Check password rules
    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (!allPasswordRulesPassed) {
      newErrors.password = 'Mật khẩu chưa đáp ứng đủ yêu cầu';
    }

    // Check confirm password
    const confirmResult = validateConfirmPassword(password, confirmPassword);
    if (!confirmResult.isValid && confirmResult.error) {
      newErrors.confirmPassword = confirmResult.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(displayName.trim(), email.trim(), password);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <View className="gap-4">
      {/* Display Name Input */}
      <View>
        <View className="relative">
          <View className="absolute left-3 top-4 z-10">
            <User size={20} color="#6B7280" />
          </View>
          <InputField
            placeholder="Họ và tên"
            value={displayName}
            onChangeText={text => {
              setDisplayName(text);
              clearError('displayName');
            }}
            className="pl-10 h-12 rounded-xl bg-gray-50 border-0"
          />
        </View>
        {errors.displayName && (
          <Text className="text-red-500 text-xs mt-1 ml-1">{errors.displayName}</Text>
        )}
      </View>

      {/* Email Input */}
      <View>
        <View className="relative">
          <View className="absolute left-3 top-4 z-10">
            <Mail size={20} color="#6B7280" />
          </View>
          <InputField
            placeholder="Email"
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

        {/* Password Requirements UI */}
        <View className="mt-3 bg-gray-50 rounded-xl p-3">
          {passwordValidation.map(rule => (
            <View key={rule.id} className="flex-row items-center mb-2 last:mb-0">
              {rule.passed ? (
                <CheckCircle2 size={18} color="#22c55e" />
              ) : (
                <Circle size={18} color="#9ca3af" />
              )}
              <Text className={`ml-2 text-sm ${rule.passed ? 'text-green-600' : 'text-gray-500'}`}>
                {rule.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Confirm Password Input */}
      <View>
        <View className="relative">
          <View className="absolute left-3 top-4 z-10">
            <Lock size={20} color="#6B7280" />
          </View>
          <InputField
            secureTextEntry={!showConfirmPassword}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              clearError('confirmPassword');
            }}
            className="pl-10 pr-10 h-12 rounded-xl bg-gray-50 border-0"
          />
          <TouchableOpacity
            className="absolute right-3 top-4 z-10"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>
        )}
        {/* Show match indicator when both fields have content */}
        {confirmPassword.length > 0 && password.length > 0 && (
          <View className="flex-row items-center mt-2 ml-1">
            {password === confirmPassword ? (
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
          <Text className="text-white text-base font-semibold">Tạo tài khoản</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
