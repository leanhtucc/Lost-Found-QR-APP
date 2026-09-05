/**
 * ReturnProgressCard Component
 * Card tiến trình ghim cố định ngay trên ô nhập tin nhắn trong ChatDetailScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Navigation,
  Handshake,
  DollarSign,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { ReturnSession, ReturnUserRole } from '@/types/return-flow';

interface ReturnProgressCardProps {
  session: ReturnSession | null;
  currentRole: ReturnUserRole | null;
  currentUserId?: string | null;
  onOpenMeetupModal: () => void;
  onAcceptMeetup: () => void;
  onRejectMeetup: () => void;
  onOpenLiveMap: () => void;
  onOpenHandover: () => void;
  onOpenRewardStatus: () => void;
  onOpenRateFinder: () => void;
  isLoading?: boolean;
}

export const ReturnProgressCard: React.FC<ReturnProgressCardProps> = ({
  session,
  currentRole,
  currentUserId,
  onOpenMeetupModal,
  onAcceptMeetup,
  onRejectMeetup,
  onOpenLiveMap,
  onOpenHandover,
  onOpenRewardStatus,
  onOpenRateFinder,
  isLoading = false,
}) => {
  if (!session) return null;

  const { status, meetup } = session;
  const isProposer = meetup?.proposedBy === currentUserId;

  // Render content based on ReturnSession status
  const renderBody = () => {
    switch (status) {
      case 'CHAT_ACTIVE':
        return (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-xs font-bold text-fb-content">Thống nhất điểm gặp</Text>
              <Text className="text-[11px] text-fb-muted">
                Hẹn gặp tại nơi công cộng an toàn để trao nhận đồ
              </Text>
            </View>
            <TouchableOpacity
              onPress={onOpenMeetupModal}
              className="flex-row items-center gap-1.5 rounded-xl bg-fb-primary px-3 py-2"
            >
              <MapPin size={14} color="#fff" />
              <Text className="text-xs font-bold text-white">Chọn điểm hẹn</Text>
            </TouchableOpacity>
          </View>
        );

      case 'MEETUP_PROPOSED':
        return (
          <View>
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                <MapPin size={14} color={FIND_BACK.primaryLight} />
                <Text className="text-xs font-bold text-fb-content" numberOfLines={1}>
                  {meetup?.name || meetup?.address}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={12} color={FIND_BACK.mutedText} />
                <Text className="text-[10px] text-fb-muted">{meetup?.scheduledTime}</Text>
              </View>
            </View>

            {isProposer ? (
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-[11px] text-fb-muted">Đang chờ đối phương xác nhận...</Text>
                <TouchableOpacity
                  onPress={onRejectMeetup}
                  className="rounded-lg border border-fb-border-subtle bg-fb-surface-elevated px-2.5 py-1"
                >
                  <Text className="text-[11px] font-semibold text-fb-muted">Hủy đề xuất</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 pt-1">
                <TouchableOpacity
                  onPress={onRejectMeetup}
                  className="flex-1 items-center justify-center rounded-xl border border-fb-border-subtle bg-fb-surface-elevated py-2"
                >
                  <Text className="text-xs font-semibold text-fb-muted">Đổi điểm khác</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onAcceptMeetup}
                  className="flex-1 items-center justify-center rounded-xl bg-fb-secondary py-2"
                >
                  <Text className="text-xs font-bold text-black">Chấp nhận</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'MEETUP_ACCEPTED':
      case 'TRACKING_ACTIVE':
      case 'ARRIVAL_PENDING':
        return (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-fb-secondary animate-pulse" />
                <Text className="text-xs font-bold text-fb-content">
                  {status === 'MEETUP_ACCEPTED'
                    ? 'Điểm gặp đã được xác nhận'
                    : status === 'ARRIVAL_PENDING'
                      ? 'Đang chờ hai bên đến'
                      : 'Đang chia sẻ vị trí'}
                </Text>
              </View>
              <Text className="text-[11px] text-fb-muted" numberOfLines={1}>
                Điểm hẹn: {meetup?.name || meetup?.address}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onOpenLiveMap}
              className="flex-row items-center gap-1.5 rounded-xl bg-fb-primary px-3 py-2"
            >
              <Navigation size={14} color="#fff" />
              <Text className="text-xs font-bold text-white">
                {status === 'MEETUP_ACCEPTED' ? 'Bắt đầu di chuyển' : 'Mở Live Map'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'HANDOVER_PENDING':
        return (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-xs font-bold text-fb-secondary">Hai bên đã đến điểm hẹn!</Text>
              <Text className="text-[11px] text-fb-muted">
                Kiểm tra và xác nhận bàn giao đồ vật
              </Text>
            </View>
            <TouchableOpacity
              onPress={onOpenHandover}
              className="flex-row items-center gap-1.5 rounded-xl bg-fb-secondary px-3 py-2"
            >
              <Handshake size={14} color="#000" />
              <Text className="text-xs font-bold text-black">Xác nhận bàn giao</Text>
            </TouchableOpacity>
          </View>
        );

      case 'HANDOVER_CONFIRMED':
      case 'REWARD_RELEASING':
        return (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-xs font-bold text-fb-content">Bàn giao thành công!</Text>
              <Text className="text-[11px] text-fb-muted">
                Đang giải ngân tiền thưởng qua ngân hàng
              </Text>
            </View>
            <TouchableOpacity
              onPress={onOpenRewardStatus}
              className="flex-row items-center gap-1.5 rounded-xl bg-fb-primary px-3 py-2"
            >
              <DollarSign size={14} color="#fff" />
              <Text className="text-xs font-bold text-white">Tiền thưởng</Text>
            </TouchableOpacity>
          </View>
        );

      case 'REWARD_PAID':
      case 'RATING_PENDING':
        return (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-xs font-bold text-fb-secondary">
                {currentRole === 'OWNER' ? 'Đã nhận lại đồ thành công' : 'Đã nhận tiền thưởng!'}
              </Text>
              <Text className="text-[11px] text-fb-muted">
                {currentRole === 'OWNER'
                  ? 'Hãy dành chút thời gian đánh giá người nhặt'
                  : 'Giao dịch hoàn tất an toàn'}
              </Text>
            </View>
            {currentRole === 'OWNER' ? (
              <TouchableOpacity
                onPress={onOpenRateFinder}
                className="flex-row items-center gap-1.5 rounded-xl bg-fb-primary px-3 py-2"
              >
                <Star size={14} color="#fff" fill="#fff" />
                <Text className="text-xs font-bold text-white">Đánh giá</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onOpenRewardStatus}
                className="flex-row items-center gap-1.5 rounded-xl border border-fb-secondary/30 bg-fb-secondary/15 px-3 py-2"
              >
                <CheckCircle size={14} color={FIND_BACK.secondary} />
                <Text className="text-xs font-bold text-fb-secondary">Xem biên lai</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'COMPLETED':
        return (
          <View className="flex-row items-center gap-2">
            <CheckCircle size={18} color={FIND_BACK.secondary} />
            <Text className="text-xs font-semibold text-fb-secondary flex-1">
              Phiên hoàn trả đã hoàn tất thành công! Món đồ đã về với chủ nhân.
            </Text>
          </View>
        );

      case 'HANDOVER_DISPUTED':
        return (
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={18} color={FIND_BACK.danger} />
            <Text className="text-xs font-semibold text-fb-error flex-1">
              Đang có khiếu nại bàn giao. Hệ thống đã tạm ngưng lệnh giải ngân.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="border-t border-fb-border-subtle bg-fb-surface px-4 py-2.5">
      {renderBody()}
    </View>
  );
};
