import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@contexts/ToastContext';
import { LoginForm } from './components/LoginForm';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { OverlayLoading } from '@components/atoms/OverlayLoading';
import { LoginSuccessModal } from '../components/LoginSuccessModal';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { FIND_BACK } from '@constants/theme';
import type { User } from '@services/auth/types';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, completeLogin, navigateToRegister, navigateToForgotPassword } =
    useAuth();
  const { error: showErrorToast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Success Modal State
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    userName?: string;
    isNewUser?: boolean;
  }>({ visible: false });

  // Overlay Loading State
  const [isNormalLoggingIn, setIsNormalLoggingIn] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('Đang đăng nhập...');

  // Google Auth
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

  // Show error if Google sign-in fails (except user cancellation)
  useEffect(() => {
    if (googleError && googleError !== 'Đăng nhập bị hủy') {
      showErrorToast('Đăng nhập Google thất bại', googleError);
    }
  }, [googleError, showErrorToast]);

  const handleNormalLogin = async (email: string, password: string) => {
    setLoginError(null);
    setOverlayMessage('Đang đăng nhập...');
    setIsNormalLoggingIn(true);

    try {
      const resultHolder: { user: User | null } = { user: null };
      const success = await login(email, password, {
        autoNavigate: false,
        onSuccess: user => {
          resultHolder.user = user;
        },
      });

      setIsNormalLoggingIn(false);

      if (success) {
        setSuccessModal({
          visible: true,
          userName:
            resultHolder.user?.displayName || resultHolder.user?.full_name || email.split('@')[0],
          isNewUser: false,
        });
      } else {
        setLoginError('Email hoặc mật khẩu không đúng.');
      }
    } catch {
      setIsNormalLoggingIn(false);
      setLoginError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setOverlayMessage('Đang kết nối tài khoản Google...');

    try {
      await signInWithGoogle({
        autoNavigate: false,
        onSuccess: (user, isNewUser) => {
          setSuccessModal({
            visible: true,
            userName: user?.displayName || user?.full_name || user?.email?.split('@')[0],
            isNewUser: Boolean(isNewUser),
          });
        },
      });
    } catch {
      // Handled in useGoogleAuth
    }
  };

  const handleSuccessConfirm = () => {
    setSuccessModal(prev => ({ ...prev, visible: false }));
    completeLogin();
  };

  const isOverlayLoading = isNormalLoggingIn || googleLoading;

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

      {/* Loading Overlay */}
      <OverlayLoading
        visible={isOverlayLoading}
        message={overlayMessage}
        subMessage="Vui lòng chờ trong giây lát..."
      />

      {/* Login Success Modal */}
      <LoginSuccessModal
        visible={successModal.visible}
        userName={successModal.userName}
        isNewUser={successModal.isNewUser}
        onConfirm={handleSuccessConfirm}
      />

      {/* Error Banner theo Figma (Chạy fixed ở Top) */}
      {loginError && (
        <View className="bg-fb-danger px-4 py-3 flex-row items-center justify-center">
          <Text className="text-white text-sm font-medium">
            ({'! '}) {loginError}
          </Text>
        </View>
      )}

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6 mt-12 justify-center" variant="form">
          {/* Titles */}
          <View className="mb-10">
            <Text className="text-[32px] font-bold text-white mb-2 tracking-tight">
              Chào mừng trở lại
            </Text>
            <Text className="text-base text-fb-muted leading-6">
              Đăng nhập để tiếp tục bảo vệ những món đồ giá trị của bạn.
            </Text>
          </View>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleNormalLogin}
            isLoading={isLoading || isOverlayLoading}
            onForgotPassword={navigateToForgotPassword}
          />

          {/* Social Login */}
          <SocialLoginButtons onGooglePress={handleGoogleLogin} />

          {/* Register Link */}
          <View className="flex-row justify-center mt-10 mb-4">
            <Text className="text-sm font-medium text-fb-muted">Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={navigateToRegister} className="ml-1">
              <Text className="text-sm font-bold text-fb-primary">Tham gia ngay</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
