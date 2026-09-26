import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, ScanLine, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { cn } from '@/lib/cn';
import type { ScannerStatus } from '../hooks/useScanProcessor';

interface ScannerActionsProps {
  onGalleryPress: () => void;
  onManualPress: () => void;
  onScanPress?: () => void;
  status: ScannerStatus;
}

export const ScannerActions = ({
  onGalleryPress,
  onManualPress,
  onScanPress,
  status,
}: ScannerActionsProps) => {
  const isProcessing = status === 'processing';

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(90)}
      className="absolute bottom-8 left-0 right-0 items-center justify-center"
    >
      <View className="flex-row items-end justify-center gap-10 px-6">
        {/* Nút Thư viện */}
        <View className="items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onGalleryPress}
            disabled={isProcessing}
            className={cn(
              'w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/20',
              isProcessing && 'opacity-50'
            )}
          >
            <ImageIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white/60 text-xs font-medium">Thư viện</Text>
        </View>

        {/* Nút Scan trung tâm — recenter / khởi động lại chế độ quét */}
        <View className="items-center justify-center">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onScanPress}
            disabled={isProcessing || !onScanPress}
            accessibilityRole="button"
            accessibilityLabel="Quét mã QR bằng camera"
          >
            <LinearGradient
              colors={[FIND_BACK.primaryLight, FIND_BACK.primary, FIND_BACK.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={cn(
                'w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-black/50',
                isProcessing && 'opacity-50'
              )}
            >
              <ScanLine size={32} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Nút Nhập mã */}
        <View className="items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onManualPress}
            disabled={isProcessing}
            className={cn(
              'w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/20',
              isProcessing && 'opacity-50'
            )}
          >
            <KeyboardIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white/60 text-xs font-medium">Nhập mã</Text>
        </View>
      </View>
    </Animated.View>
  );
};
