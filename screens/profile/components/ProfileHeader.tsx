/**
 * Profile Header Component
 * Top app bar theo Figma
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface ProfileHeaderProps {
  onMenuPress: () => void;
  onSettingsPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onMenuPress, onSettingsPress }) => {
  return (
    <View className="h-14 flex-row items-center justify-between border-b border-fb-border-subtle bg-fb-neutral px-5">
      <TouchableOpacity
        activeOpacity={0.75}
        className="h-9 w-9 items-center justify-center rounded-full bg-fb-surface"
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Mở danh sách đồ dùng"
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
        className="h-9 w-9 items-center justify-center rounded-full bg-fb-surface"
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Cài đặt thông báo"
      >
        <Settings size={18} color={FIND_BACK.mutedText} />
      </TouchableOpacity>
    </View>
  );
};
