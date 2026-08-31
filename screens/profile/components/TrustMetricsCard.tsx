/**
 * Trust Metrics Card Component
 * Hero profile card theo thiết kế Figma
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ShieldCheck, User } from 'lucide-react-native';
import type { TrustLevel } from '@/services/auth/types';
import { FIND_BACK } from '@constants/theme';

interface TrustMetricsCardProps {
  userName: string;
  memberId: string;
  memberSince: string;
  userAvatar?: string;
  trustScore: number;
  trustLevel: TrustLevel;
  completedReturns: number;
  isVerified?: boolean;
}

export const TrustMetricsCard: React.FC<TrustMetricsCardProps> = ({
  userName,
  memberId,
  memberSince,
  userAvatar,
  trustScore,
  trustLevel,
  completedReturns,
  isVerified = false,
}) => {
  const safeScore = Math.max(0, Math.min(100, trustScore));
  const levelLabels: Record<TrustLevel, string> = {
    BRONZE: 'Hạng Đồng',
    SILVER: 'Hạng Bạc',
    GOLD: 'Hạng Vàng',
    PLATINUM: 'Hạng Bạch kim',
  };

  return (
    <LinearGradient
      colors={[FIND_BACK.surfaceMuted, FIND_BACK.canvas]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-3xl border border-fb-border-subtle px-6 pb-6 pt-4"
    >
      <View className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-fb-info/10" />

      <View className="items-center border-b border-fb-border-subtle pb-4">
        <View className="relative mb-3">
          <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-fb-primary p-1.5">
            <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-fb-surface-elevated">
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <User size={40} color={FIND_BACK.mutedText} />
              )}
            </View>
          </View>

          <View
            className={`absolute bottom-1 right-1 h-5 w-5 items-center justify-center rounded-full border-2 border-fb-neutral ${
              isVerified ? 'bg-fb-secondary' : 'bg-fb-surface-muted'
            }`}
          >
            {isVerified ? (
              <Check size={11} color={FIND_BACK.neutral} strokeWidth={3} />
            ) : (
              <View className="h-2 w-2 rounded-full bg-fb-muted" />
            )}
          </View>
        </View>

        <Text className="text-center text-[28px] font-bold text-fb-content" numberOfLines={1}>
          {userName}
        </Text>
        <Text className="mt-1 text-center text-xs font-medium text-fb-muted">{memberId}</Text>
        <Text className="mt-2 text-center text-xs text-fb-muted">{memberSince}</Text>
      </View>

      <View className="items-center pt-4">
        <View className="flex-row items-center">
          <ShieldCheck size={18} color={FIND_BACK.info} />
          <Text className="ml-2 text-sm font-semibold text-fb-content">
            {safeScore}/100 điểm uy tín · {completedReturns} lần trả đồ
          </Text>
        </View>

        <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-fb-surface-elevated">
          <View className="h-full rounded-full bg-fb-info" style={{ width: `${safeScore}%` }} />
        </View>

        <View className="mt-3 flex-row items-center rounded-full border border-fb-secondary/20 bg-fb-secondary/10 px-4 py-2">
          <View className="mr-2 h-2 w-2 rounded-full bg-fb-secondary" />
          <Text className="text-xs font-bold uppercase tracking-[0.5px] text-fb-secondary">
            {levelLabels[trustLevel]}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};
