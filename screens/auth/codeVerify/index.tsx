import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import {
  CodeVerifyError,
  CodeVerifyHeader,
  CodeVerifyIllustration,
  CodeVerifyProgress,
  CodeVerifyTitle,
  OtpInputSection,
  ResendSection,
  VerifyActionSection,
} from './components';
import { useCodeVerifyState } from './hooks/useCodeVerifyState';

type CodeVerifyRouteProp = RouteProp<RootStackParamList, 'CodeVerify'>;
type CodeVerifyNavigationProp = StackNavigationProp<RootStackParamList>;

export const CodeVerifyScreen: React.FC = () => {
  const navigation = useNavigation<CodeVerifyNavigationProp>();
  const route = useRoute<CodeVerifyRouteProp>();
  const email = route.params.email;

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const {
    otp,
    isLoading,
    error,
    countdown,
    canResend,
    otpSent,
    isOtpComplete,
    currentFocusIndex,
    maskedEmail,
    otpInputRef,
    shakeOffset,
    progressBarStyle,
    glowWrapStyle,
    countdownScaleStyle,
    handleOtpChange,
    handleVerify,
    handleResendOtp,
    focusOtpInput,
  } = useCodeVerifyState({
    email,
    onGoBack: handleGoBack,
  });

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top', 'bottom']}>
      <CodeVerifyHeader onBack={handleGoBack} />

      <ResponsiveContainer className="flex-1 px-6 mt-4" variant="form">
        <CodeVerifyProgress progressBarStyle={progressBarStyle} />
        <CodeVerifyIllustration />
        <CodeVerifyTitle maskedEmail={maskedEmail} />

        <CodeVerifyError error={error || undefined} shakeOffset={shakeOffset} />

        <OtpInputSection
          otp={otp}
          onOtpChange={handleOtpChange}
          inputRef={otpInputRef}
          onFocusInput={focusOtpInput}
          currentFocusIndex={currentFocusIndex}
          isOtpComplete={isOtpComplete}
          shakeOffset={shakeOffset}
        />

        <ResendSection
          canResend={canResend}
          isLoading={isLoading}
          otpSent={otpSent}
          countdown={countdown}
          countdownScaleStyle={countdownScaleStyle}
          onResend={handleResendOtp}
        />

        <VerifyActionSection
          glowWrapStyle={glowWrapStyle}
          isOtpComplete={isOtpComplete}
          isLoading={isLoading}
          onVerify={handleVerify}
          onChangeEmail={handleGoBack}
        />
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

export default CodeVerifyScreen;
