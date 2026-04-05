import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react-native';
import { AuthInput } from '../../../../components/atoms/AuthInput';
import { Button } from '../../../../components/atoms/Button';
import { validateEmail, validateDisplayName, validateConfirmPassword } from '@services/auth';

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
    label: '8-12 ký tự, có chữ và số',
    isValid: (password: string) =>
      password.length >= 8 &&
      password.length <= 12 &&
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password),
  },
  {
    id: 'uppercase',
    label: 'Chữ in hoa',
    isValid: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'Chữ số',
    isValid: (password: string) => /\d/.test(password),
  },
];

const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Số điện thoại là bắt buộc' };
  }
  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
  const phoneRegex = /^(0[3|5|7|8|9]\d{8}|\+84[3|5|7|8|9]\d{8})$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ' };
  }
  return { isValid: true };
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (!password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (!allPasswordRulesPassed) {
      newErrors.password = 'Mật khẩu chưa đáp ứng đủ yêu cầu';
    }

    const confirmResult = validateConfirmPassword(password, confirmPassword);
    if (!confirmResult.isValid && confirmResult.error) {
      newErrors.confirmPassword = confirmResult.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(displayName.trim(), email.trim(), password, phoneNumber.trim(), undefined);
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

  // Tính điểm đánh giá (0-3)
  const strengthScore = passwordValidation.filter(r => r.passed).length;

  return (
    <View className="gap-5">
      {/* Display Name Input */}
      <AuthInput
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        value={displayName}
        onChangeText={text => {
          setDisplayName(text);
          clearError('displayName');
        }}
        leftIcon={<User size={20} color="#9CA3AF" />}
        error={errors.displayName}
      />

      {/* Phone Number Input */}
      <AuthInput
        label="Số điện thoại"
        placeholder="0912345678"
        value={phoneNumber}
        onChangeText={text => {
          setPhoneNumber(text);
          clearError('phoneNumber');
        }}
        keyboardType="phone-pad"
        leftIcon={<Phone size={20} color="#9CA3AF" />}
        error={errors.phoneNumber}
      />

      {/* Email Input */}
      <AuthInput
        label="Email"
        placeholder="example@gmail.com"
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
          className="mb-0"
        />

        {/* Password Strength Indicator */}
        <View className="flex-row items-center gap-1 mt-3 mb-2">
          {[1, 2, 3].map(index => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= strengthScore
                  ? strengthScore === 3
                    ? 'bg-[#22c55e]'
                    : 'bg-[#7C6AF6]'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-semibold text-[#A1A1AA]">
            {strengthScore === 0 ? 'Chưa nhập' : strengthScore < 3 ? 'Trung bình' : 'Mạnh'}
          </Text>
          <Text className="text-[10px] text-gray-500">Gợi ý: Thêm ký tự đặc biệt</Text>
        </View>
      </View>

      {/* Confirm Password Input */}
      <AuthInput
        label="Xác nhận mật khẩu"
        placeholder="••••••••••••"
        secureTextEntry={!showPassword}
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          clearError('confirmPassword');
        }}
        leftIcon={
          <CheckCircle2
            size={20}
            color={
              errors.confirmPassword
                ? '#ef4444'
                : confirmPassword && password === confirmPassword
                  ? '#22c55e'
                  : '#9CA3AF'
            }
          />
        }
        error={errors.confirmPassword}
      />

      <View className="mt-4 mb-6">
        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={isLoading}
          style={{ minHeight: 56 }}
          textClassName="text-white text-base font-bold"
        >
          Tiếp tục
        </Button>
      </View>
    </View>
  );
};
