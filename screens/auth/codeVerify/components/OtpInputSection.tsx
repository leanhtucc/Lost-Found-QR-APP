import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SharedValue } from 'react-native-reanimated';
import { AnimatedOtpBox } from './AnimatedOtpBox';
import { OTP_LENGTH } from '../constants/constants';

interface OtpInputSectionProps {
  otp: string;
  onOtpChange: (value: string) => void;
  inputRef: React.RefObject<TextInput | null>;
  onFocusInput: () => void;
  currentFocusIndex: number;
  isOtpComplete: boolean;
  shakeOffset: SharedValue<number>;
}

export const OtpInputSection: React.FC<OtpInputSectionProps> = ({
  otp,
  onOtpChange,
  inputRef,
  onFocusInput,
  currentFocusIndex,
  isOtpComplete,
  shakeOffset,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} className="relative mb-7">
      <TextInput
        ref={inputRef}
        value={otp}
        onChangeText={onOtpChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        caretHidden
        contextMenuHidden
        style={[StyleSheet.absoluteFillObject, { zIndex: 10, opacity: 0 }]}
      />

      <TouchableOpacity activeOpacity={1} onPress={onFocusInput} onPressIn={onFocusInput}>
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
  );
};
