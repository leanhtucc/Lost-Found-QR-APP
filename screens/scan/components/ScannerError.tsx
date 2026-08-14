/**
 * Scanner Error Component
 * Hiển thị các trạng thái lỗi và permission denied
 */

import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ScannerErrorProps {
  error: string;
  onRetry: () => void;
  isPermissionError?: boolean;
}

export const ScannerError: React.FC<ScannerErrorProps> = ({
  error,
  onRetry,
  isPermissionError = false,
}) => {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="absolute inset-0 items-center justify-center bg-fb-neutral px-6"
    >
      {/* Error Icon */}
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl border border-fb-danger/20 bg-fb-danger/10">
        <AlertCircle size={48} color={FIND_BACK.danger} />
      </View>

      {/* Error Message */}
      <Text className="mb-3 text-center text-xl font-bold text-fb-content">
        {isPermissionError ? 'Cần quyền truy cập camera' : 'Đã có lỗi xảy ra'}
      </Text>

      <Text className="mb-8 px-4 text-center text-base leading-6 text-fb-muted">{error}</Text>

      {/* Action Buttons */}
      <View className="gap-3 w-full">
        {isPermissionError ? (
          <TouchableOpacity
            onPress={handleOpenSettings}
            activeOpacity={0.8}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-primary py-4"
          >
            <Settings size={20} color={FIND_BACK.bodyText} />
            <Text className="text-base font-semibold text-fb-content">Mở Cài đặt</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-primary py-4"
          >
            <RefreshCw size={20} color={FIND_BACK.bodyText} />
            <Text className="text-base font-semibold text-fb-content">Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Additional Info */}
      {isPermissionError && (
        <Text className="mt-6 px-8 text-center text-sm leading-5 text-fb-label">
          Ứng dụng cần quyền camera để quét mã QR. Vui lòng cấp quyền trong cài đặt thiết bị.
        </Text>
      )}
    </Animated.View>
  );
};
