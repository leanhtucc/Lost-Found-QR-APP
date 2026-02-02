/**
 * ScannerButton Component
 * Nút scan QR code để tìm chủ sở hữu
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ScanLine } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ScannerButtonProps {
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ScannerButton: React.FC<ScannerButtonProps> = ({ onPress }) => {
  return (
    <AnimatedTouchable
      entering={FadeInUp.duration(400).delay(200).springify()}
      onPress={onPress}
      activeOpacity={0.8}
      className="w-full mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-center"
    >
      <ScanLine size={24} color="#3b82f6" />
      <Text className="font-semibold text-gray-900 ml-3">Quét mã QR để tìm chủ sở hữu</Text>
    </AnimatedTouchable>
  );
};

export default ScannerButton;
