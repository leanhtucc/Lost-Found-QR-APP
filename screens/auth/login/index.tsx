import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@contexts/ToastContext';
import { LoginForm } from './components/LoginForm';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { OverlayLoading } from '@components/atoms/OverlayLoading';
import BrandMark from '@components/icons/BrandMark';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { FIND_BACK } from '@constants/theme';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, navigateToRegister, navigateToForgotPassword } = useAuth();
  const { error: showErrorToast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

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
      const success = await login(email, password);

      setIsNormalLoggingIn(false);

      if (!success) {
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
      await signInWithGoogle();
    } catch {
      // Handled in useGoogleAuth
    }
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

      {/* Error banner (screen-level failure) */}
      {loginError ? (
        <View
          accessibilityRole="alert"
          className="flex-row items-center justify-center bg-fb-danger px-4 py-3"
        >
          <Text className="text-sm font-semibold text-white">{loginError}</Text>
        </View>
      ) : null}

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6" variant="form">
          {/* Hero */}
          <View className="items-center pb-8 pt-10">
            <LinearGradient
              colors={['rgba(43, 127, 232, 0.35)', 'rgba(43, 127, 232, 0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: -24, right: -24, height: 220 }}
            />
            <BrandMark tile width={84} height={84} accessibilityLabel="Lost and Found QR" />
            <Text className="mt-6 text-center text-[30px] font-bold tracking-tight text-fb-content">
              Chào mừng trở lại
            </Text>
            <Text className="mt-2 text-center text-base leading-6 text-fb-muted">
              Đăng nhập để theo dõi và bảo vệ đồ của bạn.
            </Text>
          </View>

          <LoginForm
            onSubmit={handleNormalLogin}
            isLoading={isLoading || isOverlayLoading}
            onForgotPassword={navigateToForgotPassword}
          />

          <SocialLoginButtons onGooglePress={handleGoogleLogin} />

          <View className="mb-4 mt-8 flex-row items-center justify-center">
            <Text className="text-sm text-fb-muted">Bạn chưa có tài khoản?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={navigateToRegister}
              hitSlop={8}
              className="ml-1 min-h-[44px] justify-center"
            >
              <Text className="text-sm font-bold text-fb-primary-light">Tham gia ngay</Text>
            </Pressable>
          </View>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
