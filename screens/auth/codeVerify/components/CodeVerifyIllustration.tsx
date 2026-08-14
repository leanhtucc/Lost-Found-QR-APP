import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MailCheck } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

export const CodeVerifyIllustration: React.FC = () => {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="h-32 w-full rounded-2xl overflow-hidden mb-8 border border-white/5 bg-fb-surface-muted items-center justify-center"
    >
      <View className="w-20 h-20 rounded-full bg-fb-secondary/10 items-center justify-center border border-fb-secondary/20">
        <MailCheck width={42} height={42} color={FIND_BACK.secondary} strokeWidth={1.8} />
      </View>
    </Animated.View>
  );
};
