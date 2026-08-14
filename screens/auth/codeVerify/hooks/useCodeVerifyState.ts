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
import { useAuth } from '@hooks/useAuth';
import { OTP_LENGTH, RESEND_COUNTDOWN } from '../constants/constants';
import { logCodeVerify, maskEmailAddress, maskEmailForLog } from '../constants/helpers';

interface UseCodeVerifyStateParams {
  email: string;
  onGoBack: () => void;
}

export const useCodeVerifyState = ({ email, onGoBack }: UseCodeVerifyStateParams) => {
  const otpInputRef = useRef<TextInput>(null);
  const { isLoading, error, verifyOtp, resendOtp, clearError } = useAuth();

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const otpSent = true;

  const shakeOffset = useSharedValue(0);
  const verifyButtonGlow = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const countdownScale = useSharedValue(1);

  useEffect(() => {
    logCodeVerify('screen_mount', { emailMasked: maskEmailForLog(email) });
    progressWidth.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    return () => {
      logCodeVerify('screen_unmount', { emailMasked: maskEmailForLog(email) });
    };
  }, [email, progressWidth]);

  useEffect(() => {
    if (countdown > 0) {
      countdownScale.value = withSequence(
        withSpring(1.15, { damping: 6 }),
        withSpring(1, { damping: 8 })
      );
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown, countdownScale]);

  useEffect(() => {
    const timer = setTimeout(() => otpInputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

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
    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ. Vui lòng đăng ký lại.');
      onGoBack();
      return;
    }

    const success = await verifyOtp(email, otp);
    if (!success) {
      setOtp('');
      otpInputRef.current?.focus();
    }
  }, [email, isLoading, isOtpComplete, onGoBack, otp, verifyOtp]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend || isLoading) return;
    const success = await resendOtp(email);
    if (!success) return;
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    setOtp('');
    otpInputRef.current?.focus();
  }, [canResend, email, isLoading, resendOtp]);

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

  return {
    otp,
    isLoading,
    error,
    countdown,
    canResend,
    otpSent,
    isOtpComplete,
    currentFocusIndex: Math.min(otp.length, OTP_LENGTH - 1),
    maskedEmail: maskEmailAddress(email),
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
