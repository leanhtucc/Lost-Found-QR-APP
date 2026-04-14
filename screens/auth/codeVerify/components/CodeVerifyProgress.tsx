import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CodeVerifyProgressProps {
  progressBarStyle: object;
}

export const CodeVerifyProgress: React.FC<CodeVerifyProgressProps> = ({ progressBarStyle }) => {
  return (
    <Animated.View entering={FadeInDown.delay(50).duration(400)} className="mb-7 items-start">
      <View className="bg-fb-surface-muted rounded-full px-4 py-2 mb-3">
        <Text className="text-[10px] font-bold text-fb-info tracking-widest">BƯỚC 2/2</Text>
      </View>
      <View className="w-full h-1 bg-fb-surface-muted rounded-full overflow-hidden">
        <Animated.View className="h-full bg-fb-primary rounded-full" style={progressBarStyle} />
      </View>
    </Animated.View>
  );
};
