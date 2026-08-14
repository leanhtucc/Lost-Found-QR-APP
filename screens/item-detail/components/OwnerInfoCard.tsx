/**
 * Owner Info Card Component
 * Hiển thị thông tin chủ sở hữu với trust metrics (cho Finder Flow)
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Star, Award, Package, User as UserIcon, BadgeCheck } from 'lucide-react-native';
import type { User } from '@/services/auth/types';
import { getUserLevel, getLevelInfo } from '@/services/auth/types';
import { COLORS, FIND_BACK } from '@constants/theme';

interface OwnerInfoCardProps {
  owner?: User;
  ownerInfo?: {
    memberId: string;
    display_name: string;
    avatar?: string;
    trust_score?: number;
    is_verified?: boolean;
    total_returned?: number;
  };
}

export const OwnerInfoCard: React.FC<OwnerInfoCardProps> = ({ owner, ownerInfo }) => {
  // Support both full owner object and ownerInfo from scan response
  const displayName = owner?.displayName || ownerInfo?.display_name || 'Unknown';
  const avatar = owner?.photoURL || ownerInfo?.avatar;
  const trustScore = owner?.trustScore ?? ownerInfo?.trust_score ?? 0;
  const isVerified = owner?.isVerified ?? ownerInfo?.is_verified ?? false;
  const totalReturned = owner?.totalReturned ?? ownerInfo?.total_returned ?? 0;

  const userLevel = getUserLevel(trustScore);
  const levelInfo = getLevelInfo(userLevel);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-5">
      <View className="rounded-3xl border border-fb-border-subtle bg-fb-surface p-6">
        {/* Title */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-fb-primary/15">
            <UserIcon size={18} color={FIND_BACK.primaryLight} />
          </View>
          <Text className="text-lg font-bold text-fb-content">Chủ sở hữu</Text>
        </View>

        {/* Owner Profile */}
        <View className="flex-row items-center gap-4 mb-5">
          {/* Avatar */}
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-fb-primary/30 bg-fb-surface-elevated">
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <UserIcon size={32} color={FIND_BACK.mutedText} />
            )}
          </View>

          {/* Name & Verified Badge */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-bold text-fb-content" numberOfLines={1}>
                {displayName}
              </Text>
              {isVerified && <BadgeCheck size={20} color={FIND_BACK.info} fill={FIND_BACK.info} />}
            </View>
            <View className="flex-row items-center gap-2">
              <Award size={14} color={FIND_BACK.primary} />
              <Text className="text-sm font-semibold text-fb-primary-light">
                Thành viên {levelInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Metrics */}
        <View className="flex-row gap-3 rounded-2xl bg-fb-surface-elevated p-4">
          {/* Trust Score */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1 mb-1">
              <Star size={16} color={COLORS.trustGold} fill={COLORS.trustGold} />
              <Text className="text-xs font-medium text-fb-muted">Uy tín</Text>
            </View>
            <Text className="text-xl font-bold text-fb-content">{trustScore}</Text>
          </View>

          <View className="w-px bg-fb-border-glass" />

          {/* Total Returned */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1 mb-1">
              <Package size={16} color={FIND_BACK.secondary} />
              <Text className="text-xs font-medium text-fb-muted">Đã trả</Text>
            </View>
            <Text className="text-xl font-bold text-fb-content">{totalReturned}</Text>
          </View>
        </View>

        {/* Trust Level Indicator */}
        <View className="mt-4 rounded-xl border border-fb-primary/20 bg-fb-primary/10 p-3">
          <Text className="text-center text-xs text-fb-muted">
            Người dùng này có độ uy tín{' '}
            <Text className="font-bold">
              {trustScore >= 80 ? 'rất cao' : trustScore >= 60 ? 'cao' : 'trung bình'}
            </Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
