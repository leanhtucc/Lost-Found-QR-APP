/**
 * User Info Card Component
 * Section Tài khoản theo Figma
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, ChevronRight, Lock, Package, Trash2, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface UserInfoCardProps {
  onPersonalInfoPress: () => void;
  onMyItemsPress: () => void;
  onNotificationsPress: () => void;
  onChangePasswordPress?: () => void;
  onDeleteAccountPress: () => void;
}

interface AccountRowProps {
  icon: LucideIcon;
  label: string;
  borderTop?: boolean;
  onPress: () => void;
  rightContent?: React.ReactNode;
}

function AccountRow({
  icon: Icon,
  label,
  borderTop = false,
  onPress,
  rightContent,
}: AccountRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={`min-h-[58px] flex-row items-center justify-between px-4 py-3.5 ${borderTop ? 'border-t border-fb-border-subtle' : ''}`}
    >
      <View className="flex-1 flex-row items-center gap-3.5 pr-2">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated">
          <Icon size={18} color={FIND_BACK.mutedText} />
        </View>
        <Text className="flex-1 text-[15px] font-medium text-fb-content" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View className="min-w-[50px] items-end justify-center">{rightContent}</View>
    </TouchableOpacity>
  );
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  onPersonalInfoPress,
  onMyItemsPress,
  onNotificationsPress,
  onChangePasswordPress,
  onDeleteAccountPress,
}) => {
  return (
    <View className="mt-6 gap-3">
      <View className="px-2">
        <Text className="text-[13px] font-bold uppercase tracking-[1.3px] text-fb-muted">
          Tài khoản
        </Text>
      </View>

      <View className="overflow-hidden rounded-3xl border border-fb-border-subtle bg-fb-surface">
        <AccountRow
          icon={User}
          label="Thông tin cá nhân"
          onPress={onPersonalInfoPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
        />

        <AccountRow
          icon={Package}
          label="Đồ dùng của tôi"
          borderTop
          onPress={onMyItemsPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
        />

        <AccountRow
          icon={Bell}
          label="Trung tâm thông báo"
          borderTop
          onPress={onNotificationsPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
        />

        {onChangePasswordPress ? (
          <AccountRow
            icon={Lock}
            label="Đổi mật khẩu"
            borderTop
            onPress={onChangePasswordPress}
            rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
          />
        ) : null}

        <AccountRow
          icon={Trash2}
          label="Xóa tài khoản"
          borderTop
          onPress={onDeleteAccountPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.danger} />}
        />
      </View>
    </View>
  );
};
