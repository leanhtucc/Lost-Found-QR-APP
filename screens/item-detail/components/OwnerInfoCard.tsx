/**
 * Owner Info Card Component
 * Hiển thị thông tin chủ sở hữu với trust metrics (cho Finder Flow)
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Star, Award, Package, User as UserIcon, BadgeCheck } from 'lucide-react-native';
import type { User } from '@/services/auth/types';
import { getUserLevel, getLevelInfo } from '@/services/auth/types';

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
      <View className="bg-white rounded-3xl p-6 shadow-md border border-indigo-100">
        {/* Title */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
            <UserIcon size={18} color="#4f46e5" />
          </View>
          <Text className="text-lg font-bold text-gray-900">Chủ sở hữu</Text>
        </View>

        {/* Owner Profile */}
        <View className="flex-row items-center gap-4 mb-5">
          {/* Avatar */}
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-indigo-200">
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <UserIcon size={32} color="#6b7280" />
            )}
          </View>

          {/* Name & Verified Badge */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                {displayName}
              </Text>
              {isVerified && <BadgeCheck size={20} color="#3b82f6" fill="#3b82f6" />}
            </View>
            <View className="flex-row items-center gap-2">
              <Award size={14} color="#4f46e5" />
              <Text className="text-sm text-indigo-600 font-semibold">
                Thành viên {levelInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust Metrics */}
        <View className="flex-row gap-3 bg-gray-50 rounded-2xl p-4">
          {/* Trust Score */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1 mb-1">
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-xs font-medium text-amber-700">Uy tín</Text>
            </View>
            <Text className="text-xl font-bold text-amber-900">{trustScore}</Text>
          </View>

          <View className="w-px bg-gray-200" />

          {/* Total Returned */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1 mb-1">
              <Package size={16} color="#10b981" />
              <Text className="text-xs font-medium text-emerald-700">Đã trả</Text>
            </View>
            <Text className="text-xl font-bold text-emerald-900">{totalReturned}</Text>
          </View>
        </View>

        {/* Trust Level Indicator */}
        <View className="mt-4 p-3 bg-indigo-50 rounded-xl">
          <Text className="text-xs text-indigo-700 text-center">
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
