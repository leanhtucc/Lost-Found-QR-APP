import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react-native';
import { Button } from '../../../../components/atoms/Button';
import { validateEmail, validateDisplayName, validateConfirmPassword } from '@services/auth';
import { FIND_BACK } from '@constants/theme';

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
  const [isDisplayNameFocused, setIsDisplayNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
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
      <View className="w-full">
        <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
          Họ và tên
        </Text>
        <View
          className={`flex-row items-center h-[56px] rounded-2xl bg-fb-surface-muted px-4 border ${
            errors.displayName
              ? 'border-red-500'
              : isDisplayNameFocused
                ? 'border-fb-primary'
                : 'border-transparent'
          }`}
        >
          <View className="mr-4">
            <User size={20} color={errors.displayName ? FIND_BACK.danger : FIND_BACK.mutedText} />
          </View>
          <TextInput
            className="flex-1 text-white text-[15px] h-full"
            placeholder="Nguyễn Văn A"
            placeholderTextColor={FIND_BACK.mutedText}
            value={displayName}
            onChangeText={text => {
              setDisplayName(text);
              clearError('displayName');
            }}
            onFocus={() => setIsDisplayNameFocused(true)}
            onBlur={() => setIsDisplayNameFocused(false)}
          />
          <View className="ml-4 p-1" pointerEvents="none">
            <View style={{ width: 20, height: 20 }} />
          </View>
        </View>
        {errors.displayName ? (
          <Text className="text-red-500 text-[13px] mt-2">{errors.displayName}</Text>
        ) : null}
      </View>

      {/* Phone Number Input */}
      <View className="w-full">
        <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
          Số điện thoại
        </Text>
        <View
          className={`flex-row items-center h-[56px] rounded-2xl bg-fb-surface-muted px-4 border ${
            errors.phoneNumber
              ? 'border-red-500'
              : isPhoneFocused
                ? 'border-fb-primary'
                : 'border-transparent'
          }`}
        >
          <View className="mr-4">
            <Phone size={20} color={errors.phoneNumber ? FIND_BACK.danger : FIND_BACK.mutedText} />
          </View>
          <TextInput
            className="flex-1 text-white text-[15px] h-full"
            placeholder="0912345678"
            placeholderTextColor={FIND_BACK.mutedText}
            value={phoneNumber}
            onChangeText={text => {
              setPhoneNumber(text);
              clearError('phoneNumber');
            }}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            keyboardType="phone-pad"
          />
          <View className="ml-4 p-1" pointerEvents="none">
            <View style={{ width: 20, height: 20 }} />
          </View>
        </View>
        {errors.phoneNumber ? (
          <Text className="text-red-500 text-[13px] mt-2">{errors.phoneNumber}</Text>
        ) : null}
      </View>

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
            <Mail size={20} color={errors.email ? FIND_BACK.danger : FIND_BACK.mutedText} />
          </View>
          <TextInput
            className="flex-1 text-white text-[15px] h-full"
            placeholder="example@gmail.com"
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

        {/* Password Strength Indicator */}
        <View className="flex-row items-center gap-1 mt-3 mb-2">
          {[1, 2, 3].map(index => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= strengthScore
                  ? strengthScore === 3
                    ? 'bg-fb-secondary'
                    : 'bg-fb-primary'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-semibold text-fb-muted">
            {strengthScore === 0 ? 'Chưa nhập' : strengthScore < 3 ? 'Trung bình' : 'Mạnh'}
          </Text>
          <Text className="text-[10px] text-gray-500">Gợi ý: Thêm ký tự đặc biệt</Text>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View className="w-full">
        <Text className="text-gray-400 text-xs font-semibold tracking-wider mb-2 uppercase">
          Xác nhận mật khẩu
        </Text>
        <View
          className={`flex-row items-center h-[56px] rounded-2xl bg-fb-surface-muted px-4 border ${
            errors.confirmPassword
              ? 'border-red-500'
              : isConfirmPasswordFocused
                ? 'border-fb-primary'
                : 'border-transparent'
          }`}
        >
          <View className="mr-4">
            <CheckCircle2
              size={20}
              color={
                errors.confirmPassword
                  ? FIND_BACK.danger
                  : confirmPassword && password === confirmPassword
                    ? FIND_BACK.secondary
                    : FIND_BACK.mutedText
              }
            />
          </View>
          <TextInput
            className="flex-1 text-white text-[15px] h-full"
            placeholder="••••••••••••"
            placeholderTextColor={FIND_BACK.mutedText}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              clearError('confirmPassword');
            }}
            onFocus={() => setIsConfirmPasswordFocused(true)}
            onBlur={() => setIsConfirmPasswordFocused(false)}
          />
          <View className="ml-4 p-1" pointerEvents="none">
            <View style={{ width: 20, height: 20 }} />
          </View>
        </View>
        {errors.confirmPassword ? (
          <Text className="text-red-500 text-[13px] mt-2">{errors.confirmPassword}</Text>
        ) : null}
      </View>

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
