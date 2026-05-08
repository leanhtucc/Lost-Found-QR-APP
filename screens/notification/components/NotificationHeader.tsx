/**
 * NotificationHeader Component
 * Premium dark header with category tabs (synced with API categories)
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, CheckCheck } from 'lucide-react-native';
import { CATEGORY_TABS } from '../utils';

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0B0B0C',
  surface: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F3FF',
  textSecondary: '#A1A1AA',
  purple: '#8B5CF6',
};

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  onMarkAllRead,
  activeTab,
  onTabChange,
}) => {
  const navigation = useNavigation();

  return (
    <View style={{ backgroundColor: C.bg, paddingBottom: 8 }}>
      {/* ── Top bar ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Menu size={22} color={C.textPrimary} />
        </TouchableOpacity>

        <Text
          style={{
            color: C.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: 0.2,
          }}
        >
          Thông báo
        </Text>

        {/* Avatar */}
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{
              uri: 'https://ui-avatars.com/api/?name=U&background=8B5CF6&color=fff&size=68',
            }}
            style={{ width: 34, height: 34 }}
          />
        </View>
      </View>

      {/* ── Category tabs (driven by CATEGORY_TABS) ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 4 }}
      >
        {CATEGORY_TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => onTabChange(tab.id)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: isActive ? C.purple : C.surface,
                borderWidth: 1,
                borderColor: isActive ? C.purple : C.border,
                ...(isActive
                  ? {
                      shadowColor: C.purple,
                      shadowOpacity: 0.45,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 6,
                    }
                  : {}),
              }}
            >
              <Text
                style={{
                  color: isActive ? '#fff' : C.textSecondary,
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Mark all read pill */}
        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onMarkAllRead}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: 'rgba(139,92,246,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(139,92,246,0.25)',
            }}
          >
            <CheckCheck size={14} color={C.purple} />
            <Text style={{ color: C.purple, fontSize: 12, fontWeight: '600' }}>Đọc hết</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};
