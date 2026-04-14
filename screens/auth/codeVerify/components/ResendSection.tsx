import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Clock3, RefreshCcw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FIND_BACK } from '@constants/theme';

interface ResendSectionProps {
  canResend: boolean;
  isLoading: boolean;
  otpSent: boolean;
  countdown: number;
  countdownScaleStyle: object;
  onResend: () => void;
}

export const ResendSection: React.FC<ResendSectionProps> = ({
  canResend,
  isLoading,
  otpSent,
  countdown,
  countdownScaleStyle,
  onResend,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(250).duration(400)} className="items-center mb-6">
      {!canResend ? (
        <View className="flex-row items-center gap-2">
          <Clock3 size={15} color={FIND_BACK.mutedText} />
          <Animated.Text style={countdownScaleStyle} className="text-fb-muted text-sm ml-2">
            {otpSent ? `Gửi lại sau ${countdown}s` : 'Đang gửi mã OTP...'}
          </Animated.Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onResend}
          disabled={isLoading}
          className="flex-row items-center gap-2 py-2 px-4 rounded-xl bg-fb-surface-muted active:opacity-70"
          accessibilityLabel="Gửi lại mã OTP"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <RefreshCcw size={14} color={FIND_BACK.primary} />
          <Text className="text-sm font-semibold text-fb-primary ml-1">Gửi lại mã OTP</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
