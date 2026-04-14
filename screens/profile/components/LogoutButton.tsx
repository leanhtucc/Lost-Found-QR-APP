/**
 * Logout Button Component
 * Nút đăng xuất theo Figma
 */

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface LogoutButtonProps {
  onPress: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="mt-8 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-fb-danger py-4"
    >
      <LogOut size={18} color={FIND_BACK.danger} />
      <Text className="text-base font-bold text-fb-danger">Đăng xuất</Text>
    </TouchableOpacity>
  );
};
