import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Keyboard } from 'react-native';
import { User, Mail, Lock, CheckCircle2, Check } from 'lucide-react-native';
import { Button } from '../../../../components/atoms/Button';
import { FormField } from '@components/kit';
import { validateEmail, validateDisplayName, validateConfirmPassword } from '@services/auth';
import { FIND_BACK } from '@constants/theme';

interface RegisterFormProps {
  onSubmit: (
    displayName: string,
    email: string,
    password: string,
    confirmPassword?: string,
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
    label: 'Tối thiểu 8 ký tự, có chữ và số',
    isValid: (password: string) =>
      password.length >= 8 &&
      password.length <= 64 &&
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

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    Keyboard.dismiss();
    if (!acceptedTerms) return;
    if (validateForm()) {
      onSubmit(
        displayName.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword,
        undefined
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

  // Strength score (0-3)
  const strengthScore = passwordValidation.filter(r => r.passed).length;
  const iconColor = (hasError: boolean) => (hasError ? FIND_BACK.danger : FIND_BACK.mutedText);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <View className="gap-5">
      <FormField
        label="Họ và tên"
        icon={<User size={20} color={iconColor(!!errors.displayName)} />}
        placeholder="Nguyễn Văn A"
        value={displayName}
        onChangeText={text => {
          setDisplayName(text);
          clearError('displayName');
        }}
        autoComplete="name"
        textContentType="name"
        error={errors.displayName}
      />

      <FormField
        label="Email"
        icon={<Mail size={20} color={iconColor(!!errors.email)} />}
        placeholder="ten@email.com"
        value={email}
        onChangeText={text => {
          setEmail(text);
          clearError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        error={errors.email}
      />

      <View>
        <FormField
          label="Mật khẩu"
          icon={<Lock size={20} color={iconColor(!!errors.password)} />}
          placeholder="Ít nhất 8 ký tự"
          value={password}
          onChangeText={text => {
            setPassword(text);
            clearError('password');
          }}
          password
          autoComplete="new-password"
          textContentType="newPassword"
          error={errors.password}
        />

        {/* Password strength: three segments plus a text label (never colour alone) */}
        <View className="mb-2 mt-3 flex-row items-center gap-1">
          {[1, 2, 3].map(index => (
            <View
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index <= strengthScore
                  ? strengthScore === 3
                    ? 'bg-fb-secondary'
                    : 'bg-fb-primary'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-xs font-semibold ${
              strengthScore === 3 ? 'text-fb-secondary' : 'text-fb-muted'
            }`}
          >
            {strengthScore === 0 ? 'Chưa nhập' : strengthScore < 3 ? 'Trung bình' : 'Mạnh'}
          </Text>
          <Text className="text-xs text-fb-muted">Gợi ý: thêm ký tự đặc biệt</Text>
        </View>
      </View>

      <FormField
        label="Xác nhận mật khẩu"
        icon={
          <CheckCircle2
            size={20}
            color={
              errors.confirmPassword
                ? FIND_BACK.danger
                : passwordsMatch
                  ? FIND_BACK.secondary
                  : FIND_BACK.mutedText
            }
          />
        }
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          clearError('confirmPassword');
        }}
        password
        autoComplete="new-password"
        textContentType="newPassword"
        success={passwordsMatch}
        error={errors.confirmPassword}
      />

      {/* Consent (required) */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
        accessibilityLabel="Đồng ý Điều khoản dịch vụ và Chính sách bảo mật"
        onPress={() => setAcceptedTerms(value => !value)}
        className="min-h-[44px] flex-row items-start gap-3"
      >
        <View
          className={`mt-0.5 h-6 w-6 items-center justify-center rounded-lg border ${
            acceptedTerms ? 'border-fb-primary bg-fb-primary' : 'border-white/30'
          }`}
        >
          {acceptedTerms ? <Check size={15} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <Text className="flex-1 text-[13px] leading-5 text-fb-muted">
          Tôi đồng ý với{' '}
          <Text className="font-semibold text-fb-primary-light">Điều khoản dịch vụ</Text> và{' '}
          <Text className="font-semibold text-fb-primary-light">Chính sách bảo mật</Text>, và cho
          phép ứng dụng dùng vị trí khi tôi báo mất hoặc nhặt đồ.
        </Text>
      </Pressable>

      <View className="mb-6">
        <Button
          variant={acceptedTerms ? 'primary' : 'secondary'}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!acceptedTerms}
          accessibilityState={{ disabled: !acceptedTerms }}
          style={{ minHeight: 56 }}
          textClassName={acceptedTerms ? 'text-white text-base font-bold' : 'text-fb-label'}
        >
          Tiếp tục
        </Button>
      </View>
    </View>
  );
};
