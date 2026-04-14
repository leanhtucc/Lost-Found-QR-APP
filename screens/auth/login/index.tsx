import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@contexts/ToastContext';
import { LoginForm } from './components/LoginForm';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { FIND_BACK } from '@constants/theme';

export const LoginScreen: React.FC = () => {
  const { isLoading, login, navigateToRegister, navigateToForgotPassword, navigateToMainApp } =
    useAuth();
  const toast = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lấy hàm SignIn từ useGoogleAuth
  const {
    signInWithGoogle,
    user: googleUser,
    isNewUser: googleIsNewUser,
    error: googleError,
  } = useGoogleAuth();

  React.useEffect(() => {
    if (googleUser && googleIsNewUser !== null) {
      if (googleIsNewUser) {
        toast.success(
          'Đăng ký thành công!',
          `Chào mừng ${googleUser.displayName} đến với Lost & Found QR!`
        );
      } else {
        toast.success(
          'Đăng nhập thành công!',
          `Chào mừng bạn quay lại, ${googleUser.displayName}!`
        );
      }
      setTimeout(() => {
        navigateToMainApp();
      }, 500);
    }
  }, [googleUser, googleIsNewUser, navigateToMainApp, toast]);

  React.useEffect(() => {
    if (googleError) {
      toast.error('Đăng nhập Google thất bại', googleError);
    }
  }, [googleError, toast]);

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    const success = await login(email, password);
    if (success) {
      navigateToMainApp();
    } else {
      // Demo theo thiết kế Figma
      setLoginError('Sai mật khẩu. Còn 2 lần thử.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

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
            onSubmit={handleLogin}
            isLoading={isLoading}
            onForgotPassword={navigateToForgotPassword}
          />

          {/* Social Login */}
          <SocialLoginButtons onGooglePress={signInWithGoogle} onApplePress={() => {}} />

          {/* Register Link */}
          <View className="flex-row justify-center mt-10 mb-4">
            <Text className="text-sm font-medium text-fb-muted">Bạn chưa có tài khoản?</Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-sm font-bold text-fb-primary">Tham gia ngay</Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
