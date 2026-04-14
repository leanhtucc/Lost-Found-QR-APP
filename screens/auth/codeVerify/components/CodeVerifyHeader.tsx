import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FIND_BACK } from '@constants/theme';

interface CodeVerifyHeaderProps {
  onBack: () => void;
}

export const CodeVerifyHeader: React.FC<CodeVerifyHeaderProps> = ({ onBack }) => {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="flex-row items-center px-4 h-14 mt-2">
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 items-center justify-center"
        accessibilityLabel="Quay lại"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronLeft size={28} color={FIND_BACK.bodyText} />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-bold text-white mr-10 tracking-wider">
        FindBack
      </Text>
    </Animated.View>
  );
};
