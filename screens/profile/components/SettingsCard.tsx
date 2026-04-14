/**
 * Settings Card Component
 * Section Thông báo + Ứng dụng theo Figma
 */

import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import {
  Bell,
  ChevronRight,
  FileText,
  Globe,
  Info,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  borderTop?: boolean;
  onPress?: () => void;
  rightContent?: React.ReactNode;
}

interface SettingsCardProps {
  pushNotifications: boolean;
  emailNotifications: boolean;
  onPushNotificationsChange: (value: boolean) => void;
  onEmailNotificationsChange: (value: boolean) => void;
  onNotificationRadiusPress: () => void;
  onLanguagePress: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
  languageLabel?: string;
  notificationRadiusLabel?: string;
  versionLabel?: string;
}

function SettingsRow({
  icon: Icon,
  label,
  borderTop = false,
  onPress,
  rightContent,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
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

export const SettingsCard: React.FC<SettingsCardProps> = ({
  pushNotifications,
  emailNotifications,
  onPushNotificationsChange,
  onEmailNotificationsChange,
  onNotificationRadiusPress,
  onLanguagePress,
  onTermsPress,
  onPrivacyPress,
  languageLabel = 'Tiếng Việt',
  notificationRadiusLabel = '3km',
  versionLabel = '1.0.0',
}) => {
  return (
    <View className="mt-8 gap-8">
      <View className="gap-3">
        <View className="px-2">
          <Text className="text-[13px] font-bold uppercase tracking-[1.3px] text-fb-muted">
            Thông báo
          </Text>
        </View>

        <View className="overflow-hidden rounded-3xl bg-fb-surface">
          <SettingsRow
            icon={Bell}
            label="Thông báo đẩy"
            onPress={() => onPushNotificationsChange(!pushNotifications)}
            rightContent={
              <Switch
                value={pushNotifications}
                onValueChange={onPushNotificationsChange}
                trackColor={{ false: FIND_BACK.surfaceElevated, true: FIND_BACK.primaryDark }}
                thumbColor={FIND_BACK.bodyText}
              />
            }
          />

          <SettingsRow
            icon={Mail}
            label="Email thông báo"
            borderTop
            onPress={() => onEmailNotificationsChange(!emailNotifications)}
            rightContent={
              <Switch
                value={emailNotifications}
                onValueChange={onEmailNotificationsChange}
                trackColor={{ false: FIND_BACK.surfaceElevated, true: FIND_BACK.primaryDark }}
                thumbColor={FIND_BACK.bodyText}
              />
            }
          />

          <SettingsRow
            icon={MapPin}
            label="Bán kính thông báo"
            borderTop
            onPress={onNotificationRadiusPress}
            rightContent={
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-fb-info">{notificationRadiusLabel}</Text>
                <ChevronRight size={16} color={FIND_BACK.mutedText} />
              </View>
            }
          />
        </View>
      </View>

      <View className="gap-3">
        <View className="px-2">
          <Text className="text-[13px] font-bold uppercase tracking-[1.3px] text-fb-muted">
            Ứng dụng
          </Text>
        </View>

        <View className="overflow-hidden rounded-3xl bg-fb-surface">
          <SettingsRow
            icon={Globe}
            label="Ngôn ngữ"
            onPress={onLanguagePress}
            rightContent={<Text className="text-sm text-fb-muted">{languageLabel}</Text>}
          />

          <SettingsRow
            icon={FileText}
            label="Điều khoản dịch vụ"
            borderTop
            onPress={onTermsPress}
            rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
          />

          <SettingsRow
            icon={Shield}
            label="Chính sách bảo mật"
            borderTop
            onPress={onPrivacyPress}
            rightContent={<ChevronRight size={16} color={FIND_BACK.mutedText} />}
          />

          <SettingsRow
            icon={Info}
            label="Phiên bản"
            borderTop
            rightContent={<Text className="text-sm text-fb-muted">{versionLabel}</Text>}
          />
        </View>
      </View>
    </View>
  );
};
