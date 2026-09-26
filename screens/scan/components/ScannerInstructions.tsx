/**
 * Scanner Instructions Component
 * Hiển thị hướng dẫn và trạng thái scan dựa trên ScannerStatus.
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import type { ScannerStatus } from '../hooks/useScanProcessor';

interface ScannerInstructionsProps {
  status: ScannerStatus;
  scannedData: string | null;
}

/** Map scanner status to instruction text */
const getInstructionText = (
  status: ScannerStatus,
  scannedData: string | null
): { title: string; subtitle: string } => {
  if (scannedData) {
    return {
      title: 'Quét thành công',
      subtitle: 'Đang tải thông tin...',
    };
  }

  switch (status) {
    case 'tracking':
    case 'locked':
      return {
        title: 'Đã phát hiện mã QR',
        subtitle: 'Đang xử lý...',
      };
    case 'processing':
      return {
        title: 'Đang kiểm tra mã...',
        subtitle: 'Vui lòng chờ',
      };
    case 'error':
      return {
        title: 'Có lỗi xảy ra',
        subtitle: 'Vui lòng thử lại',
      };
    case 'idle':
    default:
      return {
        title: 'Đưa mã QR vào khung hình',
        subtitle: 'Đang quét...',
      };
  }
};

export const ScannerInstructions: React.FC<ScannerInstructionsProps> = ({
  status,
  scannedData,
}) => {
  const { title, subtitle } = getInstructionText(status, scannedData);

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200)}
      className="absolute left-0 right-0 items-center px-6"
      style={{ bottom: 120 }}
    >
      {scannedData ? (
        // Success State
        <Animated.View
          entering={FadeIn.duration(300)}
          className="items-center rounded-2xl border border-fb-secondary/30 bg-fb-secondary/90 px-6 py-4"
        >
          <Text className="mb-1 text-lg font-bold text-fb-neutral">{title}</Text>
          <Text className="text-sm text-fb-neutral/80">{subtitle}</Text>
        </Animated.View>
      ) : (
        // Normal State
        <View className="items-center">
          <Text className="text-white text-lg font-semibold text-center mb-2 tracking-wide">
            {title}
          </Text>
          <Text className="text-white/60 text-sm font-medium text-center tracking-wide">
            {subtitle}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
