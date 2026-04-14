/**
 * Profile Header Component
 * Top app bar theo Figma
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ProfileHeaderProps {
  onMenuPress: () => void;
  onSettingsPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onMenuPress, onSettingsPress }) => {
  return (
    <LinearGradient
      colors={[FIND_BACK.surface, 'rgba(19,19,25,0)']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      className="absolute left-0 right-0 top-0 z-20 h-16"
    >
      <View className="flex-1 flex-row items-center justify-between px-6">
        <TouchableOpacity
          activeOpacity={0.75}
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={onMenuPress}
        >
          <View className="gap-[3px]">
            <View className="h-[2px] w-[14px] rounded-full bg-fb-content" />
            <View className="h-[2px] w-[14px] rounded-full bg-fb-content" />
            <View className="h-[2px] w-[14px] rounded-full bg-fb-content" />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-extrabold tracking-[-1px]">
          <Text className="text-fb-content">Find</Text>
          <Text className="text-fb-primary">Back</Text>
        </Text>

        <TouchableOpacity
          activeOpacity={0.75}
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={onSettingsPress}
        >
          <Settings size={18} color={FIND_BACK.mutedText} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};
