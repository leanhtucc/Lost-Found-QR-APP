/**
 * Scanner Instructions Component
 * Hiển thị hướng dẫn và trạng thái scan
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIND_BACK } from '@constants/theme';

interface ScannerInstructionsProps {
  isScanning: boolean;
  scannedData: string | null;
}

export const ScannerInstructions: React.FC<ScannerInstructionsProps> = ({
  isScanning,
  scannedData,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200)}
      className="absolute bottom-20 left-0 right-0 items-center px-6"
    >
      {scannedData ? (
        // Success State
        <View className="items-center rounded-2xl border border-fb-secondary/30 bg-fb-secondary/90 px-6 py-4">
          <Text className="mb-1 text-lg font-bold text-fb-neutral">Quét thành công</Text>
          <Text className="text-sm text-fb-neutral/80">Đang tải thông tin...</Text>
        </View>
      ) : (
        // Normal State
        <View className="items-center">
          {/* Main instruction text */}
          <Text className="text-white text-lg font-semibold text-center mb-2 tracking-wide">
            Đưa mã QR vào khung hình
          </Text>
          <Text className="text-white/60 text-sm font-medium text-center tracking-wide">
            {isScanning ? 'Đang quét...' : 'Đang chuẩn bị camera...'}
          </Text>

          {/* Camera Icon Indicator */}
          <Animated.View entering={FadeInUp.duration(500).delay(400)} className="mt-6">
            <LinearGradient
              colors={[FIND_BACK.primary, FIND_BACK.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="shadow-lg shadow-fb-primary/40"
            >
              <Camera size={32} color={FIND_BACK.bodyText} strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};
