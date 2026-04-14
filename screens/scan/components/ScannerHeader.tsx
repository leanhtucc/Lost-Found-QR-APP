/**
 * Scanner Header Component
 * Header với nút đóng và tiêu đề
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FIND_BACK } from '@constants/theme';

interface ScannerHeaderProps {
  onClose: () => void;
}

export const ScannerHeader: React.FC<ScannerHeaderProps> = ({ onClose }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-12 pb-4"
    >
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.8}
        className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md items-center justify-center"
      >
        <X size={24} color={FIND_BACK.bodyText} />
      </TouchableOpacity>

      <Text className="text-lg font-bold text-white">Quét mã QR</Text>

      <View className="w-12" />
    </Animated.View>
  );
};
