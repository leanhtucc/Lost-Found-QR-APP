import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { useFirebasePhoneAuth } from '@hooks/useFirebasePhoneAuth';
import { CustomNumpad } from '@components/atoms/CustomNumpad';
import { Button } from '@components/atoms/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/cn';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 59;

type CodeVerifyRouteProp = RouteProp<RootStackParamList, 'CodeVerify'>;
type CodeVerifyNavigationProp = StackNavigationProp<RootStackParamList>;

export const CodeVerifyScreen: React.FC = () => {
  const navigation = useNavigation<CodeVerifyNavigationProp>();
  const route = useRoute<CodeVerifyRouteProp>();
  const phoneNumber = route.params?.phoneNumber || '';

  // Sử dụng hook Firebase Phone Auth thay vì useAuth
  const {
    isLoading,
    error,
    normalizedPhone,
    sendOtp,
    verifyOtpAndAuthenticate,
    resendOtp,
    clearError,
  } = useFirebasePhoneAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  /**
   * Tự động gửi OTP khi màn hình được mount
   * Chỉ gửi 1 lần duy nhất
   */
  useEffect(() => {
    if (phoneNumber && !otpSent) {
      const initSendOtp = async () => {
        const success = await sendOtp(phoneNumber);
        if (success) {
          setOtpSent(true);
        } else {
          // Nếu gửi OTP thất bại, hiển thị alert và cho phép thử lại
          Alert.alert('Không thể gửi mã OTP', 'Vui lòng kiểm tra số điện thoại và thử lại.', [
            { text: 'Quay lại', onPress: () => navigation.goBack() },
            { text: 'Thử lại', onPress: () => setOtpSent(false) },
          ]);
        }
      };
      initSendOtp();
    }
  }, [phoneNumber, otpSent, sendOtp, navigation]);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (!otpSent) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, otpSent]);

  const currentFocusIndex = otp.findIndex(v => v === '');
  const isOtpComplete = otp.every(digit => digit !== '');

  const handleDigit = useCallback(
    (digit: string) => {
      setOtp(prev => {
        const idx = prev.findIndex(v => v === '');
        if (idx !== -1) {
          const newOtp = [...prev];
          newOtp[idx] = digit;
          return newOtp;
        }
        return prev;
      });
      // Xóa lỗi khi user bắt đầu nhập lại
      clearError();
    },
    [clearError]
  );

  const handleBackspace = useCallback(() => {
    setOtp(prev => {
      const idx = prev.findIndex(v => v === '');
      const idxToClear = idx === -1 ? OTP_LENGTH - 1 : idx - 1;
      if (idxToClear >= 0) {
        const newOtp = [...prev];
        newOtp[idxToClear] = '';
        return newOtp;
      }
      return prev;
    });
    clearError();
  }, [clearError]);

  /**
   * Xử lý xác thực OTP:
   * 1. Verify OTP với Firebase
   * 2. Lấy idToken → gửi lên backend /api/auth/firebase-verify
   * 3. Nếu thành công → chuyển sang Congratulation
   */
  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) return;

    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng thử lại.');
      navigation.goBack();
      return;
    }

    const success = await verifyOtpAndAuthenticate(otpCode);
    // Navigation đã được xử lý bên trong hook nếu thành công
    if (!success) {
      // Reset OTP nếu sai để user nhập lại
      setOtp(Array(OTP_LENGTH).fill(''));
    }
  };

  /**
   * Gửi lại mã OTP
   */
  const handleResendOtp = async () => {
    if (!canResend) return;

    const success = await resendOtp();
    if (success) {
      setCountdown(RESEND_COUNTDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Hiển thị số điện thoại đã chuẩn hóa hoặc số gốc
  const displayPhone = normalizedPhone || phoneNumber;

  return (
    <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E13" />

      {/* Header */}
      <View className="flex-row items-center px-4 h-14 mt-2">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center active:opacity-70"
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white mr-10 tracking-wider">
          FindBack
        </Text>
      </View>

      <ResponsiveContainer className="flex-1 px-6 mt-4" variant="form">
        {/* Step Indicator */}
        <View className="mb-6">
          <Text className="text-[10px] font-bold text-[#7C6AF6] tracking-widest mb-2">
            BƯỚC 2/2
          </Text>
          <View className="flex-row h-1 bg-[#1A1A24] rounded-full overflow-hidden">
            <View className="flex-1 bg-[#7C6AF6] rounded-full" />
          </View>
        </View>

        {/* Graphic Placeholder (Cityscape mock) */}
        <LinearGradient
          colors={['#1A1A24', '#0E0E13']}
          className="h-32 w-full rounded-2xl mb-8 items-center justify-center border border-white/5"
        >
          <Text className="text-white/20 text-xs">Image Placeholder</Text>
        </LinearGradient>

        <View className="mb-8">
          <Text className="text-[28px] font-bold text-white mb-2">Xác minh số điện thoại</Text>
          <Text className="text-[15px] text-[#A1A1AA] leading-6">
            Nhập mã xác thực đã được gửi đến số{' '}
            <Text className="font-semibold text-white">{displayPhone}</Text>
          </Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        {/* Custom OTP Boxes */}
        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => {
            const isFocused = currentFocusIndex === index;
            const hasValue = digit !== '';

            return (
              <View
                key={index}
                className={cn(
                  'w-12 h-14 rounded-2xl items-center justify-center border',
                  isFocused
                    ? 'border-[#7C6AF6] bg-[#1A1A24]'
                    : hasValue
                      ? 'border-[#22c55e]/50 bg-[#1A1A24]'
                      : 'border-transparent bg-[#1A1A24]'
                )}
              >
                <Text className="text-2xl font-bold text-white">{digit}</Text>
              </View>
            );
          })}
        </View>

        {/* Resend OTP */}
        <View className="items-center mb-8">
          {!canResend ? (
            <Text className="text-[#A1A1AA] text-sm">
              {otpSent ? `Gửi lại sau ${countdown}s` : 'Đang gửi mã OTP...'}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
              <Text className="text-sm font-semibold text-[#7C6AF6]">Gửi lại mã OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <Button
          variant={isOtpComplete ? 'success' : 'secondary'}
          onPress={handleVerify}
          disabled={!isOtpComplete || isLoading}
          loading={isLoading}
          style={{ minHeight: 56 }}
          textClassName="text-white text-base font-bold"
        >
          Xác nhận {isOtpComplete ? '>' : ''}
        </Button>
      </ResponsiveContainer>

      {/* Numpad */}
      <ResponsiveContainer className="mt-auto w-full" variant="form">
        <CustomNumpad onPressDigit={handleDigit} onPressBackspace={handleBackspace} />
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CodeVerifyScreen;
