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
        accessibilityRole="button"
        accessibilityLabel="Đóng trình quét"
        className="h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40"
      >
        <X size={24} color={FIND_BACK.bodyText} />
      </TouchableOpacity>

      <View className="items-center">
        <Text className="text-lg font-bold text-white">Quét mã QR</Text>
        <Text className="text-xs text-white/80">Đưa mã vào giữa khung</Text>
      </View>

      <View className="w-12" />
    </Animated.View>
  );
};
