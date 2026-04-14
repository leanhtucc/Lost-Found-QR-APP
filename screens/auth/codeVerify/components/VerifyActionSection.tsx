import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button } from '@components/atoms/Button';
import { cn } from '@/lib/cn';
import { FIND_BACK } from '@constants/theme';

interface VerifyActionSectionProps {
  glowWrapStyle: object;
  isOtpComplete: boolean;
  isLoading: boolean;
  onVerify: () => void;
  onChangePhone: () => void;
}

export const VerifyActionSection: React.FC<VerifyActionSectionProps> = ({
  glowWrapStyle,
  isOtpComplete,
  isLoading,
  onVerify,
  onChangePhone,
}) => {
  return (
    <>
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
          style={{ minHeight: 55 }}
          title="Xác nhận >"
          textClassName="text-fb-neutral text-[18px] font-bold"
        />
      </Animated.View>

      <TouchableOpacity
        onPress={onChangePhone}
        disabled={isLoading}
        className="items-center mt-5 py-2"
        accessibilityLabel="Đổi số điện thoại"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-sm font-semibold text-fb-primary">Đổi số điện thoại</Text>
      </TouchableOpacity>
    </>
  );
};
