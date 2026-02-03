/**
 * User Info Card Component
 * Hiển thị thông tin cá nhân của user
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, GraduationCap, Mail, Phone } from 'lucide-react-native';

interface UserInfoCardProps {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
}

interface InfoRowProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <View className="flex-row items-center gap-4">
    <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
      <Icon size={20} color="#3b82f6" />
    </View>
    <View className="flex-1">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="font-semibold text-gray-900 mt-0.5">{value}</Text>
    </View>
  </View>
);

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  fullName,
  studentId,
  email,
  phone,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(200)}
      className="mx-4 bg-white rounded-2xl p-5 shadow-sm"
    >
      <Text className="text-base font-bold text-gray-900 mb-4">Thông tin cá nhân</Text>

      <View className="space-y-4">
        <InfoRow icon={User} label="Họ và tên" value={fullName} />

        <View className="h-px bg-gray-100 my-4" />

        <InfoRow icon={GraduationCap} label="Mã sinh viên" value={studentId} />

        <View className="h-px bg-gray-100 my-4" />

        <InfoRow icon={Mail} label="Email" value={email} />

        <View className="h-px bg-gray-100 my-4" />

        <InfoRow icon={Phone} label="Số điện thoại" value={phone} />
      </View>
    </Animated.View>
  );
};
