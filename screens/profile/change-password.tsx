import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  authApi,
  getApiErrorCode,
  validateConfirmPassword,
  validatePassword,
} from '@/services/auth';
import type { RootStackParamList } from '@/navigation';
import {
  PasswordInputField,
  PasswordMatchIndicator,
  PasswordRulesList,
  passwordRules,
} from '@/screens/auth/resetPass/components';
import { SettingsScreenHeader } from './components';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, setAuthenticated, setUser } = useAuthContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const rules = useMemo(
    () => passwordRules.map(rule => ({ ...rule, passed: rule.isValid(newPassword) })),
    [newPassword]
  );
  const matches = newPassword.length > 0 && newPassword === confirmPassword;

  const submit = async () => {
    const nextErrors: typeof errors = {};
    if (!currentPassword) nextErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    const passwordResult = validatePassword(newPassword);
    if (!passwordResult.isValid) nextErrors.newPassword = passwordResult.error;
    const confirmResult = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmResult.isValid) nextErrors.confirmPassword = confirmResult.error;
    if (currentPassword && currentPassword === newPassword) {
      nextErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const response = await authApi.changePassword({ currentPassword, newPassword });
    setSubmitting(false);
    if (!response.success) {
      const code = getApiErrorCode(response);
      if (code === 'PASSWORD_NOT_SUPPORTED_FOR_PROVIDER') {
        Alert.alert('Không hỗ trợ', 'Tài khoản này đăng nhập bằng nhà cung cấp bên ngoài.', [
          { text: 'Đóng', onPress: () => navigation.goBack() },
        ]);
      } else if (code === 'RATE_LIMITED') {
        Alert.alert('Thử quá nhiều lần', 'Vui lòng chờ 15 phút rồi thử lại.');
      } else {
        setErrors(previous => ({
          ...previous,
          currentPassword: response.message || 'Mật khẩu hiện tại không đúng.',
        }));
      }
      return;
    }

    setAuthenticated(false);
    setUser(null);
    Alert.alert('Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại bằng mật khẩu mới.', [
      {
        text: 'Đăng nhập',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
      },
    ]);
  };

  if (user?.authProvider !== 'password') {
    return (
      <SafeAreaView className="flex-1 bg-fb-neutral">
        <SettingsScreenHeader title="Đổi mật khẩu" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base leading-6 text-fb-muted">
            Tài khoản này đăng nhập bằng nhà cung cấp bên ngoài và không sử dụng mật khẩu FindBack.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <SettingsScreenHeader title="Đổi mật khẩu" onBack={() => navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-5">
          <PasswordInputField
            label="Mật khẩu hiện tại"
            value={currentPassword}
            secure={!showCurrent}
            onToggleSecure={() => setShowCurrent(value => !value)}
            onChangeText={value => {
              setCurrentPassword(value);
              setErrors(previous => ({ ...previous, currentPassword: undefined }));
            }}
            error={errors.currentPassword}
          />
        </View>
        <View className="mb-5">
          <PasswordInputField
            label="Mật khẩu mới"
            value={newPassword}
            secure={!showNew}
            onToggleSecure={() => setShowNew(value => !value)}
            onChangeText={value => {
              setNewPassword(value);
              setErrors(previous => ({ ...previous, newPassword: undefined }));
            }}
            error={errors.newPassword}
          />
          <PasswordRulesList rules={rules} />
        </View>
        <View className="mb-7">
          <PasswordInputField
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            secure={!showConfirm}
            onToggleSecure={() => setShowConfirm(value => !value)}
            onChangeText={value => {
              setConfirmPassword(value);
              setErrors(previous => ({ ...previous, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
          />
          <PasswordMatchIndicator show={confirmPassword.length > 0} isMatched={matches} />
        </View>

        <TouchableOpacity
          disabled={submitting}
          onPress={() => void submit()}
          className="h-14 items-center justify-center rounded-full bg-fb-primary"
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-bold text-white">Đổi mật khẩu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
