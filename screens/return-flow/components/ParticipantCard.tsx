/**
 * ParticipantCard Component
 * Card đáy màn hình Live Map hiển thị thông tin đối phương, khoảng cách, ETA và CTA hành động
 */

import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import {
  Phone,
  MessageSquare,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  Handshake,
  Package,
  Award,
} from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { ReturnParticipant, ReturnSessionStatus } from '@/types/return-flow';
import { openExternalDirections } from '@/services/maps/directions';

interface ParticipantCardProps {
  partner: ReturnParticipant;
  meetupAddress: string;
  meetupName?: string;
  meetupLatitude?: number;
  meetupLongitude?: number;
  directionsAllowed: boolean;
  distanceToMeetup: number | null;
  etaToMeetup: string;
  isPartnerStale: boolean;
  itemName: string;
  itemImageUrl?: string | null;
  rewardAmount?: number;
  status: ReturnSessionStatus;
  isSelfArrived: boolean;
  isPartnerArrived: boolean;
  onBackToChat: () => void;
  onNotifyArrival: () => void;
  onGoToHandover: () => void;
  isLoading?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  partner,
  meetupAddress,
  meetupName,
  meetupLatitude,
  meetupLongitude,
  directionsAllowed,
  distanceToMeetup,
  etaToMeetup,
  isPartnerStale,
  itemName,
  itemImageUrl,
  rewardAmount,
  status,
  isSelfArrived,
  isPartnerArrived,
  onBackToChat,
  onNotifyArrival,
  onGoToHandover,
  isLoading = false,
}) => {
  const isNear = distanceToMeetup !== null && distanceToMeetup <= 100;
  const bothArrived = isSelfArrived && isPartnerArrived;

  const handleCall = () => {
    if (partner.phoneNumber) {
      Linking.openURL(`tel:${partner.phoneNumber}`);
    }
  };

  const handleOpenExternalMap = async () => {
    if (!directionsAllowed || meetupLatitude == null || meetupLongitude == null) return;
    await openExternalDirections(meetupLatitude, meetupLongitude).catch(err =>
      console.warn('Could not open map:', err)
    );
  };

  return (
    <View className="rounded-3xl border border-fb-border-glass bg-fb-surface p-4 shadow-2xl">
      {/* Partner Info & Actions Bar */}
      <View className="flex-row items-center justify-between border-b border-fb-border-subtle pb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="relative">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-fb-primary/40 bg-fb-primary/10">
              {partner.photoURL ? (
                <Image
                  source={{ uri: partner.photoURL }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-base font-bold text-fb-primary-light">
                  {partner.displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-fb-surface bg-fb-secondary" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-bold text-fb-content" numberOfLines={1}>
                {partner.displayName}
              </Text>
              <View className="rounded bg-fb-surface-elevated px-1.5 py-0.5">
                <Text className="text-[10px] font-semibold text-fb-muted">
                  {partner.role === 'FINDER' ? 'Người nhặt' : 'Chủ đồ'}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-fb-muted">
              {isPartnerStale
                ? 'Vị trí chưa được cập nhật'
                : partner.sharingLocation
                  ? 'Đang di chuyển'
                  : 'Đang chờ chia sẻ vị trí'}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Phone & Chat */}
        <View className="flex-row items-center gap-2">
          {partner.phoneNumber && (
            <TouchableOpacity
              onPress={handleCall}
              accessibilityLabel="Gọi điện"
              className="h-10 w-10 items-center justify-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated"
            >
              <Phone size={18} color={FIND_BACK.bodyText} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onBackToChat}
            accessibilityLabel="Nhắn tin"
            className="h-10 w-10 items-center justify-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated"
          >
            <MessageSquare size={18} color={FIND_BACK.bodyText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Item context — keeps the map tied to the exact return session. */}
      <View className="mb-3 flex-row items-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated p-2.5">
        <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-fb-surface">
          {itemImageUrl ? (
            <Image source={{ uri: itemImageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Package size={20} color={FIND_BACK.primaryLight} />
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs font-bold text-fb-content" numberOfLines={1}>
            {itemName}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Award size={12} color={FIND_BACK.secondary} />
            <Text className="text-[11px] font-semibold text-fb-secondary">
              {(rewardAmount || 0).toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>
      </View>

      {/* Destination & Metrics */}
      <View className="py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={15} color={FIND_BACK.primaryLight} />
              <Text className="text-xs font-bold text-fb-content" numberOfLines={1}>
                {meetupName || 'Điểm hẹn'}
              </Text>
            </View>
            <Text className="text-xs text-fb-muted pl-5" numberOfLines={1}>
              {meetupAddress}
            </Text>
          </View>

          {directionsAllowed && (
            <TouchableOpacity
              onPress={() => void handleOpenExternalMap()}
              className="flex-row items-center gap-1 rounded-lg border border-fb-border-subtle bg-fb-surface-elevated px-2.5 py-1.5"
            >
              <Navigation size={13} color={FIND_BACK.primaryLight} />
              <Text className="text-xs font-semibold text-fb-primary-light">Chỉ đường</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Distance & ETA Row */}
        <View className="mt-2.5 flex-row items-center justify-between rounded-xl bg-fb-surface-elevated p-2.5">
          <View className="flex-row items-center gap-2">
            <Navigation size={14} color={FIND_BACK.secondary} />
            <Text className="text-xs font-medium text-fb-muted">
              Khoảng cách:{' '}
              <Text className="font-bold text-fb-content">
                {distanceToMeetup !== null
                  ? distanceToMeetup < 1000
                    ? `${distanceToMeetup}m`
                    : `${(distanceToMeetup / 1000).toFixed(1)}km`
                  : '--'}
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color={FIND_BACK.info} />
            <Text className="text-xs font-medium text-fb-muted">
              ETA: <Text className="font-bold text-fb-info">{etaToMeetup}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Primary CTA */}
      {bothArrived || status === 'HANDOVER_PENDING' ? (
        <TouchableOpacity
          onPress={onGoToHandover}
          accessibilityRole="button"
          accessibilityLabel="Mở xác nhận bàn giao"
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-fb-secondary py-3.5"
        >
          <Handshake size={20} color="#000" />
          <Text className="text-base font-bold text-black">Bàn giao & Xác nhận</Text>
        </TouchableOpacity>
      ) : isSelfArrived ? (
        <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-fb-secondary/30 bg-fb-secondary/15 py-3.5">
          <CheckCircle2 size={18} color={FIND_BACK.secondary} />
          <Text className="text-sm font-bold text-fb-secondary">
            Bạn đã đến! Đang chờ {partner.displayName}...
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onNotifyArrival}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Xác nhận bạn đã đến điểm hẹn"
          className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${
            isNear ? 'bg-fb-primary' : 'bg-fb-primary/80'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MapPin size={18} color="#fff" />
              <Text className="text-base font-bold text-white">
                {isNear ? 'Tôi đã đến điểm hẹn' : 'Báo đã đến điểm hẹn'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
