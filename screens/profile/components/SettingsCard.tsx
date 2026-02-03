/**
 * Settings Card Component
 * Card cài đặt với các menu items
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, Moon, Shield, HelpCircle, ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  description: string;
  action: 'toggle' | 'navigate';
  defaultValue?: boolean;
}

interface SettingsCardProps {
  onNavigate?: (screen: string) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ onNavigate }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: Bell,
      label: 'Thông báo',
      description: 'Nhận thông báo khi có người quét QR',
      action: 'toggle',
      defaultValue: notificationsEnabled,
    },
    {
      icon: Moon,
      label: 'Chế độ tối',
      description: 'Giao diện tối cho mắt',
      action: 'toggle',
      defaultValue: darkModeEnabled,
    },
    {
      icon: Shield,
      label: 'Bảo mật',
      description: 'Đổi mật khẩu, xác thực 2 lớp',
      action: 'navigate',
    },
    {
      icon: HelpCircle,
      label: 'Trợ giúp & Hỗ trợ',
      description: 'FAQ, liên hệ hỗ trợ',
      action: 'navigate',
    },
  ];

  const handleToggle = (index: number, value: boolean) => {
    if (index === 0) {
      setNotificationsEnabled(value);
    } else if (index === 1) {
      setDarkModeEnabled(value);
    }
  };

  const handleNavigate = (label: string) => {
    onNavigate?.(label);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(300)}
      className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <Text className="text-base font-bold text-gray-900 p-5 pb-3">Cài đặt</Text>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => item.action === 'navigate' && handleNavigate(item.label)}
          disabled={item.action === 'toggle'}
          activeOpacity={0.7}
          className={`flex-row items-center gap-4 p-5 ${
            index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          {/* Icon */}
          <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
            <item.icon size={20} color="#6b7280" />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">{item.label}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{item.description}</Text>
          </View>

          {/* Action */}
          {item.action === 'toggle' ? (
            <Switch
              value={item.defaultValue}
              onValueChange={value => handleToggle(index, value)}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          ) : (
            <ChevronRight size={20} color="#9ca3af" />
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};
