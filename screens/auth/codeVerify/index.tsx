import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { useAuth } from '@hooks/useAuth';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 30;

type CodeVerifyRouteProp = RouteProp<RootStackParamList, 'CodeVerify'>;
type CodeVerifyNavigationProp = StackNavigationProp<RootStackParamList>;

export const CodeVerifyScreen: React.FC = () => {
  const navigation = useNavigation<CodeVerifyNavigationProp>();
  const route = useRoute<CodeVerifyRouteProp>();
  const email = route.params?.phoneNumber || '';

  const { isLoading, verifyEmail, resendVerification } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Lỗi', `Vui lòng nhập đủ ${OTP_LENGTH} chữ số`);
      return;
    }

    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ. Vui lòng thử lại.');
      navigation.goBack();
      return;
    }

    const success = await verifyEmail(email, otpCode);
    if (success) {
      // Navigate to congratulation screen after successful verification
      navigation.reset({
        index: 0,
        routes: [{ name: 'Congratulation' as const }],
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !email) return;

    const success = await resendVerification(email);
    if (success) {
      setCountdown(RESEND_COUNTDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-12">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mb-8"
        >
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>

        {/* Title & Description */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900 mb-3">Xác thực OTP</Text>
          <Text className="text-base text-gray-500 leading-6">
            Nhập mã xác thực 6 chữ số đã được gửi đến email{' '}
            <Text className="font-medium text-gray-700">{email}</Text>
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View className="flex-row justify-between mb-10">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold ${
                digit
                  ? 'border-blue-600 bg-blue-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
              placeholderTextColor="#d1d5db"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={!isOtpComplete || isLoading}
          className={`py-4 rounded-full mb-8 ${
            isOtpComplete && !isLoading ? 'bg-blue-600' : 'bg-blue-300'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isLoading ? 'Đang xác thực...' : 'Xác thực'}
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="items-center">
          {!canResend && (
            <Text className="text-gray-500 text-base mb-2">Gửi lại mã sau {countdown}s</Text>
          )}
          <TouchableOpacity onPress={handleResendOtp} disabled={!canResend || isLoading}>
            <Text
              className={`text-base font-medium ${canResend ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Gửi lại mã OTP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CodeVerifyScreen;
