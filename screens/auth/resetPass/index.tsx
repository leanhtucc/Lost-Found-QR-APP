import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useAuth } from '@hooks/useAuth';
import { validateConfirmPassword } from '@services/auth';
import { RootStackParamList } from '@navigation/index';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { FIND_BACK } from '@constants/theme';
import {
  PasswordInputField,
  PasswordMatchIndicator,
  PasswordRulesList,
  ResetPassBackButton,
  ResetPassSuccessView,
  passwordRules,
} from './components';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ResetPasswordRouteProp>();
  const { isLoading, resetPassword, navigateToLogin } = useAuth();

  const token = route.params?.token || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordValidation = useMemo(
    () => passwordRules.map(rule => ({ ...rule, passed: rule.isValid(newPassword) })),
    [newPassword]
  );

  const allPasswordRulesPassed = useMemo(
    () => passwordValidation.every(rule => rule.passed),
    [passwordValidation]
  );

  const isMatched = newPassword === confirmPassword;
  const showMatchStatus = confirmPassword.length > 0 && newPassword.length > 0;
  const isFormValid = allPasswordRulesPassed && isMatched && token.length > 0;

  const clearError = (field: 'newPassword' | 'confirmPassword') => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!allPasswordRulesPassed) nextErrors.newPassword = 'Mật khẩu chưa đáp ứng đủ yêu cầu';

    const confirmResult = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmResult.isValid && confirmResult.error) {
      nextErrors.confirmPassword = confirmResult.error;
    }

    if (!token) nextErrors.newPassword = 'Link đặt lại mật khẩu không hợp lệ';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    const success = await resetPassword(token, newPassword);
    if (success) setIsSuccess(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

      {isSuccess ? (
        <ResponsiveContainer className="flex-1" variant="form">
          <ResetPassSuccessView onLogin={navigateToLogin} />
        </ResponsiveContainer>
      ) : (
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
        >
          <ResponsiveContainer className="flex-1 px-6 mt-14 justify-center" variant="form">
            <ResetPassBackButton onPress={() => navigation.goBack()} />

            <View className="mb-8">
              <Text className="text-3xl font-bold text-white mb-3">Đặt lại mật khẩu</Text>
              <Text className="text-base text-fb-muted leading-6">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </Text>
            </View>

            <View className="mb-4">
              <PasswordInputField
                label="Mật khẩu mới"
                value={newPassword}
                secure={showNewPassword}
                onToggleSecure={() => setShowNewPassword(prev => !prev)}
                onChangeText={value => {
                  setNewPassword(value);
                  clearError('newPassword');
                }}
                error={errors.newPassword}
              />
              <PasswordRulesList rules={passwordValidation} />
            </View>

            <View className="mb-6">
              <PasswordInputField
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                secure={showConfirmPassword}
                onToggleSecure={() => setShowConfirmPassword(prev => !prev)}
                onChangeText={value => {
                  setConfirmPassword(value);
                  clearError('confirmPassword');
                }}
                error={errors.confirmPassword}
              />

              <PasswordMatchIndicator show={showMatchStatus} isMatched={isMatched} />
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={!isFormValid || isLoading}
              className={`h-14 rounded-full justify-center items-center mb-8 ${
                isFormValid && !isLoading ? 'bg-fb-primary' : 'bg-fb-primary/40'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color={FIND_BACK.bodyText} />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-1" />

            <View className="flex-row justify-center pb-8">
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-base font-semibold text-fb-primary">Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </ResponsiveContainer>
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
