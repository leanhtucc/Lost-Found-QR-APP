import React from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CodeVerifyTitleProps {
  maskedEmail: string;
}

export const CodeVerifyTitle: React.FC<CodeVerifyTitleProps> = ({ maskedEmail }) => {
  return (
    <Animated.View entering={FadeInDown.delay(150).duration(400)} className="mb-7 items-center">
      <Text className="text-[28px] font-bold text-white mb-2">Xác minh email</Text>
      <Text className="text-[15px] text-fb-muted leading-6 text-center">
        Nhập mã 6 số đã được gửi đến <Text className="font-semibold text-white">{maskedEmail}</Text>
      </Text>
    </Animated.View>
  );
};
