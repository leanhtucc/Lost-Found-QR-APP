import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Mail } from 'lucide-react-native';
import { Button } from '@components/atoms/Button';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@constants/theme';

interface VerifyActionSectionProps {
  glowWrapStyle: object;
  isOtpComplete: boolean;
  isLoading: boolean;
  onVerify: () => void;
  onChangeEmail: () => void;
}

export const VerifyActionSection: React.FC<VerifyActionSectionProps> = ({
  glowWrapStyle,
  isOtpComplete,
  isLoading,
  onVerify,
  onChangeEmail,
}) => {
  return (
    <View className="w-full mt-2">
      <Animated.View
        style={[
          glowWrapStyle,
          {
            shadowColor: FIND_BACK.secondary,
            shadowOffset: { width: 0, height: 6 },
            elevation: Platform.OS === 'android' ? 8 : 0,
          },
        ]}
      >
        <Button
          variant="success"
          onPress={onVerify}
          disabled={!isOtpComplete || isLoading}
          loading={isLoading}
          className={cn(
            'bg-fb-secondary rounded-2xl w-full',
            !isOtpComplete || isLoading ? 'opacity-60' : 'opacity-100'
          )}
          style={{ minHeight: 56 }}
          title="Xác nhận"
          textClassName="text-fb-neutral text-[18px] font-bold"
        />
      </Animated.View>

      <TouchableOpacity
        onPress={onChangeEmail}
        disabled={isLoading}
        className="flex-row items-center justify-center mt-5 py-3.5 px-6 rounded-2xl bg-fb-surface-muted/70 border border-white/10 active:opacity-70 active:bg-fb-surface-muted"
        accessibilityLabel="Đổi email"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Mail size={18} color={FIND_BACK.primaryLight} strokeWidth={2} />
        <Text className="text-[16px] font-semibold text-fb-primary-light ml-2 tracking-wide">
          Đổi email
        </Text>
      </TouchableOpacity>
    </View>
  );
};
