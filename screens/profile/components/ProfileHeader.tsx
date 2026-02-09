/**
 * Profile Header Component
 * Modern cover image style header với verified badge
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, BadgeCheck } from 'lucide-react-native';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  isVerified?: boolean;
  onBack: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userEmail,
  userAvatar,
  isVerified = false,
  onBack,
}) => {
  return (
    <View className="relative">
      {/* Cover Image Background */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-48"
      >
        {/* Header Bar */}
        <View className="px-4 pt-3 pb-4">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
            >
              <ArrowLeft size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">Tài khoản</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Card with Avatar */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mx-4 -mt-20 bg-white rounded-3xl p-6 shadow-lg"
      >
        {/* Avatar */}
        <View className="items-center -mt-16 mb-4">
          <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-4 border-white shadow-md">
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <User size={48} color="#6b7280" />
            )}
          </View>
        </View>

        {/* User Info */}
        <View className="items-center">
          {/* Name with Verified Badge */}
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-gray-900" numberOfLines={1}>
              {userName}
            </Text>
            {isVerified && <BadgeCheck size={24} color="#3b82f6" fill="#3b82f6" />}
          </View>

          <Text className="text-gray-500 text-sm mt-2" numberOfLines={1}>
            {userEmail}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};
