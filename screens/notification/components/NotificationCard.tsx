/**
 * NotificationCard Component
 * Premium dark glassmorphism card — uses new API types
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  MapPin,
  MessageCircle,
  Shield,
  Star,
  Navigation,
  DollarSign,
  RotateCcw,
} from 'lucide-react-native';
import {
  Notification,
  NotificationType,
  NewChatMetadata,
  EscrowMetadata,
  MatchFoundMetadata,
} from '@/types/notification';
import { formatNotificationTime } from '../utils';

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  surface: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F3FF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#8B5CF6',
  green: '#22C55E',
  orange: '#F97316',
  cyan: '#22D3EE',
};

interface NotificationCardProps {
  notification: Notification;
  index: number;
  onPress: () => void;
}

// ─── Type → visual config ────────────────────────────────────────────────────

interface TypeVisual {
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  hasLeftBorder?: boolean;
}

const getTypeVisual = (type: NotificationType): TypeVisual => {
  switch (type) {
    case 'MATCH_FOUND':
      return {
        icon: <MapPin size={18} color={C.orange} />,
        iconBg: 'rgba(249,115,22,0.15)',
        accentColor: C.orange,
        hasLeftBorder: true,
      };
    case 'PROXIMITY':
      return {
        icon: <Navigation size={18} color={C.orange} />,
        iconBg: 'rgba(249,115,22,0.15)',
        accentColor: C.orange,
        hasLeftBorder: true,
      };
    case 'QR_SCANNED':
      return {
        icon: <Star size={18} color={C.cyan} />,
        iconBg: 'rgba(34,211,238,0.15)',
        accentColor: C.cyan,
      };
    case 'NEW_CHAT':
      return {
        icon: <MessageCircle size={18} color={C.purple} />,
        iconBg: 'rgba(139,92,246,0.15)',
        accentColor: C.purple,
      };
    case 'ESCROW_LOCKED':
      return {
        icon: <Shield size={18} color={C.green} />,
        iconBg: 'rgba(34,197,94,0.15)',
        accentColor: C.green,
      };
    case 'REFUNDED':
      return {
        icon: <RotateCcw size={18} color={C.cyan} />,
        iconBg: 'rgba(34,211,238,0.15)',
        accentColor: C.cyan,
      };
    case 'RELEASED':
      return {
        icon: <DollarSign size={18} color={C.green} />,
        iconBg: 'rgba(34,197,94,0.15)',
        accentColor: C.green,
      };
    default:
      return {
        icon: <MapPin size={18} color={C.textMuted} />,
        iconBg: 'rgba(113,113,122,0.15)',
        accentColor: C.textMuted,
      };
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  index,
  onPress,
}) => {
  const visual = getTypeVisual(notification.type);
  const isUnread = !notification.is_read;
  const timeText = formatNotificationTime(notification.created_at);
  const meta = notification.metadata ?? {};

  // For NEW_CHAT: show avatar from metadata
  const chatMeta = notification.type === 'NEW_CHAT' ? (meta as NewChatMetadata) : null;
  const avatarUri = chatMeta?.sender_avatar;

  // For ESCROW_*: show amount
  const escrowMeta =
    notification.type === 'ESCROW_LOCKED' ||
    notification.type === 'REFUNDED' ||
    notification.type === 'RELEASED'
      ? (meta as EscrowMetadata)
      : null;

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(index * 60)}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          backgroundColor: C.surface,
          borderRadius: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isUnread ? visual.accentColor + '30' : C.border,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        {/* Left accent border */}
        {visual.hasLeftBorder && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: visual.accentColor,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            }}
          />
        )}

        <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
          {/* Icon / Avatar */}
          {avatarUri ? (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: C.border,
              }}
            >
              <Image source={{ uri: avatarUri }} style={{ width: 44, height: 44 }} />
            </View>
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: visual.iconBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {visual.icon}
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text
                style={{
                  flex: 1,
                  color: C.textPrimary,
                  fontSize: 14,
                  fontWeight: isUnread ? '700' : '500',
                  lineHeight: 20,
                }}
                numberOfLines={2}
              >
                {notification.title}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '500' }}>
                {timeText}
              </Text>
            </View>

            {notification.content ? (
              <Text
                style={{ color: C.textSecondary, fontSize: 13, lineHeight: 18 }}
                numberOfLines={2}
              >
                {notification.content}
              </Text>
            ) : null}

            {/* Badges row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {isUnread && (
                <View
                  style={{
                    backgroundColor: 'rgba(139,92,246,0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(139,92,246,0.3)',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: C.purple,
                      fontSize: 10,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                    }}
                  >
                    UNREAD
                  </Text>
                </View>
              )}

              {/* Item name from metadata */}
              {(meta as MatchFoundMetadata).item_name && (
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{ color: C.textMuted, fontSize: 11, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {(meta as MatchFoundMetadata).item_name}
                  </Text>
                </View>
              )}

              {/* Escrow amount badge */}
              {escrowMeta?.amount != null && (
                <View
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>
                    {Number(escrowMeta.amount).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Progress bar for urgent types */}
        {(notification.type === 'MATCH_FOUND' || notification.type === 'PROXIMITY') && isUnread && (
          <View style={{ height: 3, backgroundColor: 'rgba(249,115,22,0.12)' }}>
            <View
              style={{
                height: 3,
                width: '65%',
                backgroundColor: C.orange,
                borderRadius: 2,
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
