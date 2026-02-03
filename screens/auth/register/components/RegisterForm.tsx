import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { InputField } from '../../../../components/InputField';
import { validateEmail, validateDisplayName, validateConfirmPassword } from '@services/auth';
import { AvatarPicker } from './AvatarPicker';

interface RegisterFormProps {
  onSubmit: (
    displayName: string,
    email: string,
    password: string,
    phoneNumber: string,
    photoURL?: string
  ) => void;
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

// Phone number validation helper
const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Số điện thoại là bắt buộc' };
  }

  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');

  // Vietnamese phone number pattern: starts with 0 and has 10 digits
  // or starts with +84 and has 9-11 digits
  const phoneRegex = /^(0[3|5|7|8|9]\d{8}|\+84[3|5|7|8|9]\d{8})$/;

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
  }

  return { isValid: true };
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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

    const phoneResult = validatePhoneNumber(phoneNumber);
    if (!phoneResult.isValid && phoneResult.error) {
      newErrors.phoneNumber = phoneResult.error;
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
      onSubmit(
        displayName.trim(),
        email.trim(),
        password,
        phoneNumber.trim(),
        photoUri || undefined
      );
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
    <View className="gap-5">
      {/* Avatar Picker */}
      <AvatarPicker value={photoUri} onChange={setPhotoUri} />

      {/* Display Name Input */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Họ và tên</Text>
        <InputField
          placeholder="Nhập họ và tên của bạn"
          value={displayName}
          onChangeText={text => {
            setDisplayName(text);
            clearError('displayName');
          }}
          className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4"
        />
        {errors.displayName && (
          <Text className="text-red-500 text-xs mt-1">{errors.displayName}</Text>
        )}
      </View>

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

      {/* Phone Number Input */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Số điện thoại</Text>
        <InputField
          placeholder="0912345678"
          value={phoneNumber}
          onChangeText={text => {
            setPhoneNumber(text);
            clearError('phoneNumber');
          }}
          keyboardType="phone-pad"
          className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4"
        />
        {errors.phoneNumber && (
          <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>
        )}
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

        {/* Password Requirements UI */}
        <View className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
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
        <Text className="text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</Text>
        <View className="relative">
          <InputField
            secureTextEntry={!showConfirmPassword}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              clearError('confirmPassword');
            }}
            className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 pr-12"
          />
          <TouchableOpacity
            className="absolute right-4 top-4 z-10"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={22} color="#9CA3AF" />
            ) : (
              <Eye size={22} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
        )}
        {/* Show match indicator when both fields have content */}
        {confirmPassword.length > 0 && password.length > 0 && (
          <View className="flex-row items-center mt-2">
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
        className={`h-14 rounded-full justify-center items-center mt-2 ${
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
