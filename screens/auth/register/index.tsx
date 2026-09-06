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
  console.log(`${REGISTER_SCREEN_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
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
      <View className="flex-row items-center px-4 h-14 mt-2">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center active:opacity-70"
        >
          <ChevronLeft size={28} color={FIND_BACK.bodyText} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white mr-10 tracking-wider">
          FindBack
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
            <Text className="text-[10px] font-bold text-fb-primary tracking-widest mb-2">
              BƯỚC 1/2
            </Text>
            <View className="flex-row h-1 bg-fb-surface-muted rounded-full overflow-hidden">
              <View className="flex-1 bg-fb-primary rounded-full" />
              <View className="flex-1" />
            </View>
          </View>

          {/* Titles */}
          <View className="mb-8">
            <Text className="text-[28px] font-bold text-white mb-2">Thông tin cá nhân</Text>
            <Text className="text-[15px] text-fb-muted leading-6">
              Hãy bắt đầu bằng cách tạo hồ sơ an toàn của bạn.
            </Text>
          </View>

          {/* Register Form */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Terms text */}
          <Text className="text-center text-[11px] text-fb-muted mt-4 mb-2 px-4 leading-4">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng
            tôi.
          </Text>
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
