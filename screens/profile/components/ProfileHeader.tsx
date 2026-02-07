/**
 * Profile Header Component
 * Header với gradient background và profile card
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User } from 'lucide-react-native';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  onBack: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userEmail,
  userAvatar,
  onBack,
}) => {
  return (
    <LinearGradient
      colors={['#3b82f6', '#2563eb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="pb-6"
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

      {/* Profile Card */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mx-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6"
      >
        <View className="flex-row items-center gap-4">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center overflow-hidden">
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <User size={40} color="#ffffff" />
            )}
          </View>

          {/* User Info */}
          <View className="flex-1">
            <Text className="text-xl font-bold text-white" numberOfLines={1}>
              {userName}
            </Text>
            <Text className="text-white/80 text-sm mt-1" numberOfLines={1}>
              {userEmail}
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="px-3 py-1 rounded-full bg-white/20">
                <Text className="text-xs font-semibold text-white">Sinh viên PTIT</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};
