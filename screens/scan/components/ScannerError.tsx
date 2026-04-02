/**
 * Scanner Error Component
 * Hiển thị các trạng thái lỗi và permission denied
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react-native';
import { Linking } from 'react-native';

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
      className="absolute inset-0 bg-gray-900 items-center justify-center px-6"
    >
      {/* Error Icon */}
      <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-6">
        <AlertCircle size={48} color="#ef4444" />
      </View>

      {/* Error Message */}
      <Text className="text-white text-xl font-bold text-center mb-3">
        {isPermissionError ? 'Cần quyền truy cập camera' : 'Đã có lỗi xảy ra'}
      </Text>

      <Text className="text-white/70 text-base text-center mb-8 leading-6 px-4">{error}</Text>

      {/* Action Buttons */}
      <View className="gap-3 w-full">
        {isPermissionError ? (
          <TouchableOpacity
            onPress={handleOpenSettings}
            activeOpacity={0.8}
            className="bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <Settings size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">Mở Cài đặt</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            className="bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <RefreshCw size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Additional Info */}
      {isPermissionError && (
        <Text className="text-white/50 text-sm text-center mt-6 px-8 leading-5">
          Ứng dụng cần quyền camera để quét mã QR. Vui lòng cấp quyền trong cài đặt thiết bị.
        </Text>
      )}
    </Animated.View>
  );
};
