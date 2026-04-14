/**
 * User Info Card Component
 * Section Tài khoản theo Figma
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Lock, Shield, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface UserInfoCardProps {
  isVerified: boolean;
  onPersonalInfoPress: () => void;
  onChangePasswordPress: () => void;
  onKycPress: () => void;
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
      className={`flex-row items-center justify-between px-4 py-4 ${borderTop ? 'border-t border-fb-border-subtle' : ''}`}
    >
      <View className="flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-fb-surface-elevated">
          <Icon size={18} color={FIND_BACK.mutedText} />
        </View>
        <Text className="text-base font-medium text-fb-content">{label}</Text>
      </View>
      {rightContent}
    </TouchableOpacity>
  );
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  isVerified,
  onPersonalInfoPress,
  onChangePasswordPress,
  onKycPress,
}) => {
  return (
    <View className="mt-8 gap-3">
      <View className="px-2">
        <Text className="text-[13px] font-bold uppercase tracking-[1.3px] text-fb-muted">
          Tài khoản
        </Text>
      </View>

      <View className="overflow-hidden rounded-3xl bg-fb-surface">
        <AccountRow
          icon={User}
          label="Thông tin cá nhân"
          onPress={onPersonalInfoPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
        />

        <AccountRow
          icon={Lock}
          label="Đổi mật khẩu"
          borderTop
          onPress={onChangePasswordPress}
          rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
        />

        <AccountRow
          icon={Shield}
          label="Xác minh danh tính KYC"
          borderTop
          onPress={onKycPress}
          rightContent={
            <View className="flex-row items-center gap-2">
              <View
                className={`rounded-full border px-2 py-1 ${
                  isVerified
                    ? 'border-fb-secondary/20 bg-fb-secondary/10'
                    : 'border-fb-danger/20 bg-fb-danger/10'
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${isVerified ? 'text-fb-secondary' : 'text-fb-danger'}`}
                >
                  {isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </Text>
              </View>
              <ChevronRight size={16} color={FIND_BACK.mutedText} />
            </View>
          }
        />
      </View>
    </View>
  );
};
