/**
 * Item Info Card Component
 * Card hiển thị thông tin cơ bản của item dành cho chủ sở hữu
 */

import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin, ShieldCheck } from 'lucide-react-native';
import { Item } from '@/types/item';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';
import { FIND_BACK } from '@constants/theme';

interface ItemInfoCardProps {
  item: Item;
}

export const ItemInfoCard: React.FC<ItemInfoCardProps> = ({ item }) => {
  const CategoryIcon = getCategoryIcon(item.category);
  const [imageFailed, setImageFailed] = useState(false);

  const statusVisual = (() => {
    switch (item.status) {
      case 'LOST':
        return {
          backgroundColor: 'rgba(215, 51, 87, 0.14)',
          color: FIND_BACK.danger,
          label: 'Đang mất',
        };
      case 'PENDING_PAYMENT':
        return {
          backgroundColor: 'rgba(244, 132, 95, 0.14)',
          color: FIND_BACK.tertiary,
          label: 'Chờ thanh toán',
        };
      case 'FOUND':
        return {
          backgroundColor: 'rgba(173, 163, 255, 0.14)',
          color: FIND_BACK.info,
          label: 'Đã tìm thấy',
        };
      case 'RESOLVED':
        return {
          backgroundColor: 'rgba(124, 106, 246, 0.14)',
          color: FIND_BACK.primaryLight,
          label: 'Đã hoàn trả',
        };
      case 'SAFE':
      default:
        return {
          backgroundColor: 'rgba(46, 204, 139, 0.14)',
          color: FIND_BACK.secondary,
          label: 'An toàn',
        };
    }
  })();

  const hasCaptureLocation =
    Boolean(item.captureAddress) ||
    (item.captureLatitude !== null && item.captureLatitude !== undefined);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="mb-4 overflow-hidden rounded-3xl border border-fb-border-subtle bg-fb-surface p-5"
    >
      {/* Ảnh lớn của món đồ nếu có */}
      {item.imagePublicUrl && !imageFailed ? (
        <View className="mb-4 h-48 w-full overflow-hidden rounded-2xl bg-black/40">
          <Image
            source={{ uri: item.imagePublicUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        </View>
      ) : null}

      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-fb-primary/15">
          <CategoryIcon size={30} color={FIND_BACK.primaryLight} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="mb-1 text-xl font-bold text-fb-content">{item.name}</Text>
          <Text className="text-sm text-fb-muted">{getCategoryLabel(item.category)}</Text>
        </View>

        {/* Status Badge */}
        <View
          className="rounded-full px-3 py-2"
          style={{ backgroundColor: statusVisual.backgroundColor }}
        >
          <Text className="text-xs font-bold" style={{ color: statusVisual.color }}>
            {statusVisual.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {item.description ? (
        <View className="mt-4 border-t border-fb-border-subtle pt-4">
          <Text className="text-sm leading-6 text-fb-muted">{item.description}</Text>
        </View>
      ) : null}

      {/* Vị trí đăng ký bảo vệ (Chỉ chủ sở hữu) */}
      {hasCaptureLocation ? (
        <View className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <View className="flex-row items-center justify-between pb-2">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={16} color={FIND_BACK.secondary} />
              <Text className="text-xs font-bold text-emerald-400">Vị trí đăng ký bảo vệ</Text>
            </View>
            <View className="rounded-md bg-emerald-500/10 px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-emerald-400">Chỉ bạn thấy</Text>
            </View>
          </View>

          {item.captureAddress ? (
            <View className="flex-row items-start gap-2 pt-1">
              <MapPin size={14} color="#94a3b8" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs font-medium text-fb-content">
                {item.captureAddress}
              </Text>
            </View>
          ) : null}

          {item.captureLatitude !== null && item.captureLatitude !== undefined ? (
            <Text className="pt-1 text-[11px] text-fb-muted">
              Tọa độ: {item.captureLatitude.toFixed(5)}, {item.captureLongitude?.toFixed(5)}
              {item.captureAccuracyMeters !== null && item.captureAccuracyMeters !== undefined
                ? ` (±${Math.round(item.captureAccuracyMeters)}m)`
                : ''}
            </Text>
          ) : null}

          {item.capturedAt ? (
            <Text className="pt-0.5 text-[11px] text-fb-muted">
              Thời điểm ghi nhận:{' '}
              {new Date(item.capturedAt).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};
