/**
 * Trust Metrics Card Component
 * Hero profile card theo thiết kế Figma
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Star, User } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface TrustMetricsCardProps {
  userName: string;
  memberId: string;
  memberSince: string;
  userAvatar?: string;
  rating: number;
  transactions: number;
  isVerified?: boolean;
}

export const TrustMetricsCard: React.FC<TrustMetricsCardProps> = ({
  userName,
  memberId,
  memberSince,
  userAvatar,
  rating,
  transactions,
  isVerified = false,
}) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

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
          {[0, 1, 2, 3, 4].map(index => (
            <Star
              key={index}
              size={17}
              color={index < filledStars ? FIND_BACK.info : FIND_BACK.labelText}
              fill={index < filledStars ? FIND_BACK.info : 'transparent'}
            />
          ))}
          <Text className="ml-2 text-sm font-semibold text-fb-content">
            {rating.toFixed(1)} · {transactions} giao dịch
          </Text>
        </View>

        <View className="mt-3 flex-row items-center rounded-full border border-fb-secondary/20 bg-fb-secondary/10 px-4 py-2">
          <View className="mr-2 h-2 w-2 rounded-full bg-fb-secondary" />
          <Text className="text-xs font-bold uppercase tracking-[0.5px] text-fb-secondary">
            Người dùng tin cậy
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};
