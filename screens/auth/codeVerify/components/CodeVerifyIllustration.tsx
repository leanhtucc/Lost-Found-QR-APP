import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ImageOtpPhoneNumber } from '@components/icons';

export const CodeVerifyIllustration: React.FC = () => {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="h-32 w-full rounded-2xl overflow-hidden mb-8 border border-white/5"
    >
      <ImageOtpPhoneNumber width="100%" height="100%" />
    </Animated.View>
  );
};
