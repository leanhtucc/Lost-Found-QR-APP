/**
 * Item Info Card Component
 * Card hiển thị thông tin cơ bản của item dành cho chủ sở hữu
 */

import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin, Package, ShieldCheck } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { Item } from '@/types/item';
import { isValidCoordinate } from '@/types/location';
import { getCategoryIcon, getCategoryLabel } from '@/constants/categories';
import { FIND_BACK } from '@constants/theme';
import { StatusBadge } from '@/components/atoms/StatusBadge';

interface ItemInfoCardProps {
  item: Item;
}

export const ItemInfoCard: React.FC<ItemInfoCardProps> = ({ item }) => {
  const CategoryIcon = getCategoryIcon(item.category);
  const [imageFailed, setImageFailed] = useState(false);

  const hasCaptureLocation =
    Boolean(item.captureAddress) ||
    (item.captureLatitude !== null && item.captureLatitude !== undefined);

  const hasValidCoordinates =
    item.captureLatitude !== null &&
    item.captureLatitude !== undefined &&
    item.captureLongitude !== null &&
    item.captureLongitude !== undefined &&
    isValidCoordinate({
      latitude: item.captureLatitude,
      longitude: item.captureLongitude,
    });

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="mb-4 overflow-hidden rounded-3xl border border-fb-border-subtle bg-fb-surface p-5"
    >
      {/* Ảnh lớn của món đồ nếu có */}
      <View className="mb-4 h-40 w-full overflow-hidden rounded-2xl bg-fb-surface-elevated">
        {item.imagePublicUrl && !imageFailed ? (
          <Image
            source={{ uri: item.imagePublicUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Package size={36} color={FIND_BACK.labelText} strokeWidth={1.6} />
            <Text className="mt-2 text-sm text-fb-muted">Chưa có hình ảnh</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-4">
        {/* Icon */}
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-fb-primary/15">
          <CategoryIcon size={30} color={FIND_BACK.primaryLight} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="mb-1 text-xl font-bold text-fb-content" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-sm text-fb-muted">{getCategoryLabel(item.category)}</Text>
        </View>

        {/* Status Badge */}
        <StatusBadge status={item.status} size="md" />
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

          {hasValidCoordinates ? (
            <View className="mt-3 h-36 w-full overflow-hidden rounded-xl border border-fb-border-subtle bg-black/40">
              <MapView
                provider={PROVIDER_GOOGLE}
                customMapStyle={DARK_GOOGLE_MAP_STYLE}
                initialRegion={{
                  latitude: item.captureLatitude!,
                  longitude: item.captureLongitude!,
                  latitudeDelta: 0.006,
                  longitudeDelta: 0.006,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                toolbarEnabled={false}
                style={{ width: '100%', height: '100%' }}
              >
                <Marker
                  coordinate={{
                    latitude: item.captureLatitude!,
                    longitude: item.captureLongitude!,
                  }}
                  tracksViewChanges={false}
                />
              </MapView>
            </View>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};
