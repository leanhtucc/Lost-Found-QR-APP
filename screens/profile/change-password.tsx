import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { CheckCircle2, LogIn } from 'lucide-react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  authApi,
  getApiErrorCode,
  validateConfirmPassword,
  validatePassword,
} from '@/services/auth';
import type { RootStackParamList } from '@/navigation';
import { FIND_BACK } from '@/constants/theme';
import {
  PasswordInputField,
  PasswordMatchIndicator,
  PasswordRulesList,
  passwordRules,
} from '@/screens/auth/resetPass/components';
import { SettingsScreenHeader } from './components';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

    // Hiển thị modal thành công, chỉ chuyển trang sau khi user bấm xác nhận
    setShowSuccessModal(true);
  };

  const handleConfirmLogin = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout after password change:', error);
    } finally {
      setLoggingOut(false);
      setShowSuccessModal(false);
    }
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
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={80}
        extraKeyboardSpace={60}
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
      </KeyboardAwareScrollView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          // Prevent closing without confirmation
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconContainer}>
              <CheckCircle2 size={36} color={FIND_BACK.secondary} />
            </View>

            <Text style={styles.modalTitle}>Đổi mật khẩu thành công</Text>

            <Text style={styles.modalDescription}>
              Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại bằng mật khẩu mới
              để tiếp tục.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loggingOut}
              onPress={() => void handleConfirmLogin()}
              style={styles.modalButton}
            >
              {loggingOut ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <LogIn size={20} color="#FFFFFF" style={styles.modalButtonIcon} />
                  <Text style={styles.modalButtonText}>Đăng nhập lại</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#17171F',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(46, 204, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FIND_BACK.bodyText,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: FIND_BACK.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: FIND_BACK.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonIcon: {
    marginRight: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
