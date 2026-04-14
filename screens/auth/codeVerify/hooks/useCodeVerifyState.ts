import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useFirebasePhoneAuth } from '@hooks/useFirebasePhoneAuth';
import { OTP_LENGTH, RESEND_COUNTDOWN } from '../constants/constants';
import { logCodeVerify, maskPhoneForLog, maskPhoneNumber } from '../constants/helpers';

interface UseCodeVerifyStateParams {
  phoneNumber: string;
  onGoBack: () => void;
}

export const useCodeVerifyState = ({ phoneNumber, onGoBack }: UseCodeVerifyStateParams) => {
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

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const shakeOffset = useSharedValue(0);
  const verifyButtonGlow = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const countdownScale = useSharedValue(1);

  useEffect(() => {
    logCodeVerify('screen_mount', { routePhoneMasked: maskPhoneForLog(phoneNumber) });
    return () => {
      logCodeVerify('screen_unmount', { routePhoneMasked: maskPhoneForLog(phoneNumber) });
    };
  }, [phoneNumber]);

  useEffect(() => {
    if (!phoneNumber || otpSent) return;

    const requestId = `code-init-${Date.now()}`;
    logCodeVerify('init_send_otp_start', {
      requestId,
      phoneMasked: maskPhoneForLog(phoneNumber),
    });

    const initSendOtp = async () => {
      const success = await sendOtp(phoneNumber);
      if (success) {
        setOtpSent(true);
        progressWidth.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        return;
      }

      Alert.alert('Không thể gửi mã OTP', 'Vui lòng kiểm tra số điện thoại và thử lại.', [
        { text: 'Quay lại', onPress: onGoBack },
        { text: 'Thử lại', onPress: () => setOtpSent(false) },
      ]);
    };

    initSendOtp();
  }, [onGoBack, otpSent, phoneNumber, progressWidth, sendOtp]);

  useEffect(() => {
    if (!otpSent) return;
    if (countdown > 0) {
      countdownScale.value = withSequence(
        withSpring(1.15, { damping: 6 }),
        withSpring(1, { damping: 8 })
      );
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown, countdownScale, otpSent]);

  useEffect(() => {
    if (!otpSent) return;
    const timer = setTimeout(() => otpInputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [otpSent]);

  const isOtpComplete = otp.length === OTP_LENGTH;
  useEffect(() => {
    if (isOtpComplete) {
      verifyButtonGlow.value = withRepeat(
        withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
        -1,
        true
      );
      return;
    }
    cancelAnimation(verifyButtonGlow);
    verifyButtonGlow.value = withTiming(0);
  }, [isOtpComplete, verifyButtonGlow]);

  useEffect(() => {
    if (!error) return;
    shakeOffset.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  }, [error, shakeOffset]);

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
      onGoBack();
      return;
    }

    const success = await verifyOtpAndAuthenticate(otp);
    if (!success) {
      setOtp('');
      otpInputRef.current?.focus();
    }
  }, [isLoading, isOtpComplete, onGoBack, otp, phoneNumber, verifyOtpAndAuthenticate]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend || isLoading) return;
    const success = await resendOtp();
    if (!success) return;
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    setOtp('');
    otpInputRef.current?.focus();
  }, [canResend, isLoading, resendOtp]);

  const focusOtpInput = useCallback(() => otpInputRef.current?.focus(), []);

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

  const displayPhone = normalizedPhone || phoneNumber;

  return {
    otp,
    isLoading,
    error,
    countdown,
    canResend,
    otpSent,
    isOtpComplete,
    currentFocusIndex: Math.min(otp.length, OTP_LENGTH - 1),
    maskedPhone: maskPhoneNumber(displayPhone),
    otpInputRef,
    shakeOffset,
    progressBarStyle,
    glowWrapStyle,
    countdownScaleStyle,
    handleOtpChange,
    handleVerify,
    handleResendOtp,
    focusOtpInput,
  };
};
