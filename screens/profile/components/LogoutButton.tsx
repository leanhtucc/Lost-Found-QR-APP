/**
 * Logout Button Component
 * Button đăng xuất với confirmation
 */

import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LogOut } from 'lucide-react-native';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handlePress = () => {
    Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(400)} className="mx-4">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center justify-center gap-3"
      >
        <LogOut size={20} color="#ef4444" />
        <Text className="font-bold text-red-500">Đăng xuất</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
