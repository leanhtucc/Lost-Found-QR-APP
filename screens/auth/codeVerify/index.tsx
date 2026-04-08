import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Clock3, MessageSquare, RefreshCcw } from 'lucide-react-native';
import * as SMS from 'expo-sms';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  cancelAnimation,
  ZoomIn,
} from 'react-native-reanimated';
import { RootStackParamList } from '@navigation/index';
import { useFirebasePhoneAuth } from '@hooks/useFirebasePhoneAuth';
import { Button } from '@components/atoms/Button';
import { cn } from '@/lib/cn';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { ImageOtpPhoneNumber } from '@components/icons';

// ─── Hằng số ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 59;
const CODE_VERIFY_LOG_TAG = '[Auth:CodeVerifyScreen]';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const maskPhoneForLog = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length < 3) return phoneNumber;
  return `***${digits.slice(-3)}`;
};

const logCodeVerify = (event: string, details?: Record<string, unknown>) => {
  console.log(`${CODE_VERIFY_LOG_TAG} ${new Date().toISOString()} ${event}`, details || {});
};

const maskPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 3) return value;
  const normalized = digits.startsWith('84')
    ? digits
    : digits.startsWith('0')
      ? `84${digits.slice(1)}`
      : digits;
  return `+84 *** *** ${normalized.slice(-3)}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type CodeVerifyRouteProp = RouteProp<RootStackParamList, 'CodeVerify'>;
type CodeVerifyNavigationProp = StackNavigationProp<RootStackParamList>;

// ─── Sub-component: OTP Box có animation ─────────────────────────────────────
const AnimatedOtpBox = React.memo(
  ({
    digit,
    isFocused,
    hasValue,
    index,
    shakeOffset,
  }: {
    digit: string;
    isFocused: boolean;
    hasValue: boolean;
    index: number;
    shakeOffset: SharedValue<number>;
  }) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    // ✨ Design Spell: Scale spring khi digit thay đổi
    useEffect(() => {
      if (hasValue) {
        scale.value = withSequence(
          withSpring(1.18, { damping: 8 }),
          withSpring(1, { damping: 10 })
        );
        glowOpacity.value = withTiming(1, { duration: 150 });
      } else {
        scale.value = withSpring(1);
        glowOpacity.value = withTiming(0, { duration: 100 });
      }
    }, [hasValue, digit, scale, glowOpacity]);

    // ✨ Design Spell: Pulsing border khi focused
    useEffect(() => {
      if (isFocused) {
        glowOpacity.value = withRepeat(
          withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
          -1,
          true
        );
      } else {
        cancelAnimation(glowOpacity);
        glowOpacity.value = withTiming(hasValue ? 1 : 0, { duration: 200 });
      }
    }, [glowOpacity, hasValue, isFocused]);

    const boxStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: shakeOffset.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: interpolate(glowOpacity.value, [0, 1], [0, 0.6]),
      borderColor: isFocused ? '#9E8CFF' : '#5EF1AC',
    }));

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={boxStyle}>
        {/* Glow border */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 16,
              borderWidth: 1.5,
              margin: -1,
            },
            glowStyle,
          ]}
        />
        <View
          className={cn(
            'w-12 h-14 rounded-2xl items-center justify-center border',
            isFocused
              ? 'border-[#9E8CFF] bg-[#101221]'
              : hasValue
                ? 'border-[#303046] bg-[#101221]'
                : 'border-transparent bg-[#101221]'
          )}
        >
          <Text
            className={cn(
              'text-3xl font-semibold leading-none',
              hasValue ? 'text-white' : 'text-white/30'
            )}
          >
            {hasValue ? digit : '–'}
          </Text>
        </View>
      </Animated.View>
    );
  }
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const CodeVerifyScreen: React.FC = () => {
  const navigation = useNavigation<CodeVerifyNavigationProp>();
  const route = useRoute<CodeVerifyRouteProp>();
  const phoneNumber = route.params?.phoneNumber || '';
  const otpInputRef = useRef<TextInput>(null);

  const {
    isLoading,
    error,
    normalizedPhone,
    sendOtp,
    verifyOtpAndAuthenticate,
    resendOtp,
    clearError,
  } = useFirebasePhoneAuth();

  // State
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [isSmsLoading, setIsSmsLoading] = useState(false);

  // Shared values cho animation
  const shakeOffset = useSharedValue(0);
  const verifyButtonGlow = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const countdownScale = useSharedValue(1);

  // ─── Kiểm tra SMS khả dụng khi mount ────────────────────────────────────
  useEffect(() => {
    const checkSmsAvailability = async () => {
      try {
        const available = await SMS.isAvailableAsync();
        setSmsAvailable(available);
        logCodeVerify('sms_availability_check', { available });
      } catch {
        setSmsAvailable(false);
      }
    };
    checkSmsAvailability();
  }, []);

  // ─── Mount log ───────────────────────────────────────────────────────────
  useEffect(() => {
    logCodeVerify('screen_mount', {
      routePhoneMasked: maskPhoneForLog(phoneNumber),
    });
    return () => {
      logCodeVerify('screen_unmount', { routePhoneMasked: maskPhoneForLog(phoneNumber) });
    };
  }, [phoneNumber]);

  // ─── Gửi OTP lần đầu ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phoneNumber && !otpSent) {
      const requestId = `code-init-${Date.now()}`;
      logCodeVerify('init_send_otp_start', {
        requestId,
        phoneMasked: maskPhoneForLog(phoneNumber),
      });

      const initSendOtp = async () => {
        const success = await sendOtp(phoneNumber);
        if (success) {
          setOtpSent(true);
          // ✨ Animate progress bar về đầy (step 2/2)
          progressWidth.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
          return;
        }
        Alert.alert('Không thể gửi mã OTP', 'Vui lòng kiểm tra số điện thoại và thử lại.', [
          { text: 'Quay lại', onPress: () => navigation.goBack() },
          { text: 'Thử lại', onPress: () => setOtpSent(false) },
        ]);
      };
      initSendOtp();
    }
  }, [phoneNumber, otpSent, sendOtp, navigation, progressWidth]);

  // ─── Đếm ngược ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!otpSent) return;
    if (countdown > 0) {
      // ✨ Số đếm ngược có scale bounce nhỏ
      countdownScale.value = withSequence(
        withSpring(1.15, { damping: 6 }),
        withSpring(1, { damping: 8 })
      );
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown, countdownScale, otpSent]);

  // ─── Auto-focus ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!otpSent) return;
    const t = setTimeout(() => otpInputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [otpSent]);

  // ─── Glow khi OTP đủ ─────────────────────────────────────────────────────
  const isOtpComplete = otp.length === OTP_LENGTH;
  useEffect(() => {
    if (isOtpComplete) {
      verifyButtonGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
        -1,
        true
      );
    } else {
      cancelAnimation(verifyButtonGlow);
      verifyButtonGlow.value = withTiming(0);
    }
  }, [isOtpComplete, verifyButtonGlow]);

  // ─── Shake khi lỗi ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      shakeOffset.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [error, shakeOffset]);

  const currentFocusIndex = Math.min(otp.length, OTP_LENGTH - 1);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleOtpChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      setOtp(digitsOnly);
      clearError();
    },
    [clearError]
  );

  const handleVerify = useCallback(async () => {
    if (!isOtpComplete || isLoading) return;
    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng thử lại.');
      navigation.goBack();
      return;
    }
    const success = await verifyOtpAndAuthenticate(otp);
    if (!success) {
      setOtp('');
      otpInputRef.current?.focus();
    }
  }, [isOtpComplete, isLoading, phoneNumber, otp, verifyOtpAndAuthenticate, navigation]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend || isLoading) return;
    const success = await resendOtp();
    if (!success) return;
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    setOtp('');
    otpInputRef.current?.focus();
  }, [canResend, isLoading, resendOtp]);

  /**
   * ✨ expo-sms: Mở ứng dụng SMS để người dùng xem tin nhắn OTP đã được BE gửi.
   * Trên Android: mở SMS composer với số điện thoại. iOS: tương tự.
   * Giúp người dùng nhanh chóng tìm mã mà không cần thoát app thủ công.
   */
  const handleOpenSms = useCallback(async () => {
    if (!smsAvailable || isSmsLoading) return;

    setIsSmsLoading(true);
    logCodeVerify('open_sms_pressed', { phoneMasked: maskPhoneForLog(phoneNumber) });

    try {
      const { result } = await SMS.sendSMSAsync(
        [phoneNumber], // địa chỉ gửi → để trống body, chỉ pre-fill số điện thoại
        '' // Message trống vì đây là để xem inbox, không phải compose
      );
      logCodeVerify('open_sms_result', { result });
    } catch (err) {
      logCodeVerify('open_sms_error', { error: String(err) });
      Alert.alert('Không thể mở SMS', 'Vui lòng mở ứng dụng Tin nhắn thủ công để xem mã OTP.');
    } finally {
      setIsSmsLoading(false);
    }
  }, [smsAvailable, isSmsLoading, phoneNumber]);

  const focusOtpInput = useCallback(() => otpInputRef.current?.focus(), []);
  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  const displayPhone = normalizedPhone || phoneNumber;
  const maskedPhone = maskPhoneNumber(displayPhone);

  // ─── Animated Styles ──────────────────────────────────────────────────────
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const glowWrapStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(verifyButtonGlow.value, [0, 1], [0.18, 0.55]),
    shadowRadius: interpolate(verifyButtonGlow.value, [0, 1], [10, 22]),
  }));

  const countdownScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-[#0E0E13]" edges={['top', 'bottom']}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center px-4 h-14 mt-2"
      >
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Quay lại"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white mr-10 tracking-wider">
          FindBack
        </Text>
      </Animated.View>

      <ResponsiveContainer className="flex-1 px-6 mt-4" variant="form">
        {/* ─── Progress Step ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} className="mb-7 items-start">
          <View className="bg-[#1A1A24] rounded-full px-4 py-2 mb-3">
            <Text className="text-[10px] font-bold text-[#B39CFF] tracking-widest">BƯỚC 2/2</Text>
          </View>
          <View className="w-full h-1 bg-[#1A1A24] rounded-full overflow-hidden">
            <Animated.View className="h-full bg-[#7C6AF6] rounded-full" style={progressBarStyle} />
          </View>
        </Animated.View>

        {/* ─── Hình minh hoạ ─────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="h-32 w-full rounded-2xl overflow-hidden mb-8 border border-white/5"
        >
          <ImageOtpPhoneNumber width="100%" height="100%" />
        </Animated.View>

        {/* ─── Tiêu đề ───────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mb-7 items-center">
          <Text className="text-[28px] font-bold text-white mb-2">Xác minh số điện thoại</Text>
          <Text className="text-[15px] text-[#A1A1AA] leading-6 text-center">
            Mã 6 số đã gửi đến <Text className="font-semibold text-white">{maskedPhone}</Text>
          </Text>
        </Animated.View>

        {/* ─── Error banner với shake ─────────────────────────────────────── */}
        {error && (
          <Animated.View
            entering={ZoomIn.duration(200)}
            style={{ transform: [{ translateX: shakeOffset }] }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4"
          >
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </Animated.View>
        )}

        {/* ─── OTP Boxes ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="relative mb-7">
          {/* Input ẩn */}
          <TextInput
            ref={otpInputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={OTP_LENGTH}
            caretHidden
            contextMenuHidden
            style={[StyleSheet.absoluteFillObject, { zIndex: 10, opacity: 0 }]}
          />

          <TouchableOpacity activeOpacity={1} onPress={focusOtpInput} onPressIn={focusOtpInput}>
            <View className="flex-row justify-between">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const digit = otp[index] ?? '';
                const isFocused = !isOtpComplete && currentFocusIndex === index;
                const hasValue = digit !== '';

                return (
                  <AnimatedOtpBox
                    key={index}
                    digit={digit}
                    isFocused={isFocused}
                    hasValue={hasValue}
                    index={index}
                    shakeOffset={shakeOffset}
                  />
                );
              })}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Countdown / Resend + SMS button ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} className="items-center mb-6">
          {!canResend ? (
            <View className="flex-row items-center gap-2">
              <Clock3 size={15} color="#A1A1AA" />
              <Animated.Text style={countdownScaleStyle} className="text-[#A1A1AA] text-sm ml-2">
                {otpSent ? `Gửi lại sau ${countdown}s` : 'Đang gửi mã OTP...'}
              </Animated.Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isLoading}
              className="flex-row items-center gap-2 py-2 px-4 rounded-xl bg-[#1A1A24] active:opacity-70"
              accessibilityLabel="Gửi lại mã OTP"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RefreshCcw size={14} color="#7C6AF6" />
              <Text className="text-sm font-semibold text-[#7C6AF6] ml-1">Gửi lại mã OTP</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {smsAvailable && otpSent && (
          <Animated.View entering={FadeInDown.delay(300).springify()} className="items-center mb-5">
            <TouchableOpacity
              onPress={handleOpenSms}
              disabled={isSmsLoading}
              activeOpacity={0.75}
              className="flex-row items-center gap-2 py-3 px-5 rounded-2xl border border-[#2A2A3A] bg-[#14141F]"
              accessibilityLabel="Mở ứng dụng SMS để xem mã"
            >
              <MessageSquare size={16} color={isSmsLoading ? '#555' : '#B39CFF'} />
              <Text
                className={cn(
                  'text-sm font-medium',
                  isSmsLoading ? 'text-[#555]' : 'text-[#B39CFF]'
                )}
              >
                {isSmsLoading ? 'Đang mở...' : 'Xem tin nhắn SMS'}
              </Text>
            </TouchableOpacity>
            <Text className="text-[11px] text-[#555] mt-2 text-center">
              Mở nhanh inbox SMS để tìm mã OTP
            </Text>
          </Animated.View>
        )}

        <Animated.View
          style={[
            glowWrapStyle,
            {
              shadowColor: '#5EF1AC',
              shadowOffset: { width: 0, height: 6 },
              elevation: Platform.OS === 'android' ? 8 : 0,
            },
          ]}
        >
          <Button
            variant="success"
            onPress={handleVerify}
            disabled={!isOtpComplete || isLoading}
            loading={isLoading}
            className={cn(
              'bg-[#5EF1AC] rounded-2xl w-full',
              !isOtpComplete || isLoading ? 'opacity-60' : 'opacity-100'
            )}
            style={{ minHeight: 55 }}
            title="Xác nhận >"
            textClassName="text-[#004128] text-[18px] font-bold"
          />
        </Animated.View>

        {/* ─── Đổi số điện thoại ─────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={isLoading}
          className="items-center mt-5 py-2"
          accessibilityLabel="Đổi số điện thoại"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-sm font-semibold text-[#7C6AF6]">Đổi số điện thoại</Text>
        </TouchableOpacity>
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CodeVerifyScreen;
