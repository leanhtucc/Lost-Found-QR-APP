import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { useAuth } from '@hooks/useAuth';
import { RegisterForm } from './components/RegisterForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { FIND_BACK } from '@constants/theme';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList>;

const REGISTER_SCREEN_LOG_TAG = '[Auth:RegisterScreen]';

const maskEmailForLog = (email: string): string => {
  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (!localPart || !domain) return 'invalid-email';
  return `${localPart.slice(0, 1)}***@${domain}`;
};

const logRegisterScreen = (event: string, details?: Record<string, unknown>) => {
  void details;
  console.log(`${REGISTER_SCREEN_LOG_TAG} ${new Date().toISOString()} ${event}`);
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { isLoading, register } = useAuth();

  /**
   * Xử lý đăng ký:
   * 1. Gọi API backend /register
   * 2. Backend gửi OTP đến email đăng ký
   * 3. Chuyển sang màn CodeVerify kèm email
   */
  const handleRegister = async (
    displayName: string,
    email: string,
    password: string,
    confirmPassword?: string,
    photoURL?: string
  ) => {
    Keyboard.dismiss();
    const startedAt = Date.now();
    const attemptId = `ui-reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    logRegisterScreen('submit_register_pressed', {
      attemptId,
      displayNameLength: displayName.trim().length,
      emailMasked: maskEmailForLog(email),
      passwordLength: password.length,
      hasPasswordConfirmation: Boolean(confirmPassword),
      hasPhotoURL: Boolean(photoURL),
    });

    try {
      const success = await register(displayName, email, password, confirmPassword, photoURL);

      logRegisterScreen('register_result_received', {
        attemptId,
        success,
        durationMs: Date.now() - startedAt,
      });

      if (success) {
        Keyboard.dismiss();
        logRegisterScreen('navigate_to_code_verify', {
          attemptId,
          routeName: 'CodeVerify',
          params: { email: maskEmailForLog(email) },
        });

        navigation.navigate('CodeVerify', { email });
      } else {
        logRegisterScreen('stay_on_register_screen', {
          attemptId,
          reason: 'register_returned_false',
        });
      }
    } catch (error) {
      logRegisterScreen('register_submit_exception', {
        attemptId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

      {/* Header */}
      <View className="mt-2 flex-row items-center px-4 pb-2">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={handleGoBack}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full border border-fb-border-glass bg-fb-surface active:bg-fb-surface-elevated"
        >
          <ChevronLeft size={22} color={FIND_BACK.bodyText} />
        </TouchableOpacity>
        <Text className="flex-1 pr-11 text-center text-base font-bold tracking-wide text-fb-content">
          Lost and Found QR
        </Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6 mt-4 justify-center" variant="form">
          {/* Step Indicator */}
          <View className="mb-6">
            <Text className="mb-2 text-xs font-bold tracking-widest text-fb-primary-light">
              BƯỚC 1 / 2
            </Text>
            <View className="flex-row h-1 bg-fb-surface-muted rounded-full overflow-hidden">
              <View className="flex-1 bg-fb-primary rounded-full" />
              <View className="flex-1" />
            </View>
          </View>

          {/* Titles */}
          <View className="mb-8">
            <Text className="mb-2 text-[28px] font-bold leading-[34px] tracking-tight text-fb-content">
              Tạo tài khoản
            </Text>
            <Text className="text-[15px] leading-6 text-fb-muted">
              Chỉ mất 1 phút. Thông tin của bạn luôn được ẩn với người lạ.
            </Text>
          </View>

          {/* Register Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
