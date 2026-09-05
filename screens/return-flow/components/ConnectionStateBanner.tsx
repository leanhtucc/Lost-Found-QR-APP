/**
 * ConnectionStateBanner Component
 * Hiển thị cảnh báo GPS yếu, mất kết nối socket, vị trí đối phương bị cũ (> 60s)
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, WifiOff, Clock, MapPinOff } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ConnectionStateBannerProps {
  gpsState: 'idle' | 'acquiring' | 'ready' | 'permission_denied' | 'weak';
  connectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  isPartnerLocationStale?: boolean;
  onRetryGps?: () => void;
}

export const ConnectionStateBanner: React.FC<ConnectionStateBannerProps> = ({
  gpsState,
  connectionState,
  isPartnerLocationStale,
  onRetryGps,
}) => {
  if (gpsState === 'permission_denied') {
    return (
      <View className="flex-row items-center justify-between bg-fb-error/15 border-b border-fb-error/30 px-4 py-2.5">
        <View className="flex-row items-center gap-2 flex-1">
          <MapPinOff size={16} color={FIND_BACK.danger} />
          <Text className="text-xs text-fb-error flex-1 font-medium">
            Chưa cấp quyền vị trí. Vui lòng bật GPS để chia sẻ lộ trình.
          </Text>
        </View>
        {onRetryGps && (
          <TouchableOpacity
            onPress={onRetryGps}
            className="rounded-lg bg-fb-error/20 px-2.5 py-1 border border-fb-error/40"
          >
            <Text className="text-xs font-semibold text-fb-error">Cấp quyền</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (connectionState === 'disconnected' || connectionState === 'reconnecting') {
    return (
      <View className="flex-row items-center gap-2 bg-fb-tertiary/15 border-b border-fb-tertiary/30 px-4 py-2">
        <WifiOff size={16} color={FIND_BACK.tertiary} />
        <Text className="text-xs text-fb-tertiary font-medium">
          {connectionState === 'reconnecting'
            ? 'Đang kết nối lại mạng...'
            : 'Mất kết nối thời gian thực.'}
        </Text>
      </View>
    );
  }

  if (gpsState === 'weak') {
    return (
      <View className="flex-row items-center gap-2 bg-fb-tertiary/15 border-b border-fb-tertiary/30 px-4 py-2">
        <AlertTriangle size={16} color={FIND_BACK.tertiary} />
        <Text className="text-xs text-fb-tertiary font-medium">
          Tín hiệu GPS yếu. Tọa độ hiển thị có thể chưa chính xác.
        </Text>
      </View>
    );
  }

  if (isPartnerLocationStale) {
    return (
      <View className="flex-row items-center gap-2 bg-fb-surface-elevated border-b border-fb-border-subtle px-4 py-1.5">
        <Clock size={14} color={FIND_BACK.mutedText} />
        <Text className="text-[11px] text-fb-muted">
          Vị trí đối phương cập nhật hơn 1 phút trước.
        </Text>
      </View>
    );
  }

  return null;
};
