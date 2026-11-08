/**
 * EmptyState Component
 * Premium dark empty state with search icon and helpful tips
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Search, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';

const C = {
  bg: '#08111F',
  surface: '#0F1A2E',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F1F6FF',
  textSecondary: '#9AA9C2',
  textMuted: '#6A7A96',
  purple: '#2B7FE8',
};

type Nav = StackNavigationProp<RootStackParamList>;

export const EmptyState: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}
    >
      {/* ── Hero ── */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Search size={32} color={C.textMuted} />
        </View>
        <Text
          style={{
            color: C.textPrimary,
            fontSize: 20,
            fontWeight: '800',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Không có thông báo mới
        </Text>
        <Text
          style={{
            color: C.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          Chúng tôi sẽ báo cho bạn khi có cập nhật về vật phẩm hoặc giao dịch.
        </Text>
      </View>

      {/* ── CTA ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ReportItems')}
        style={{
          backgroundColor: 'rgba(43, 127, 232,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(43, 127, 232,0.3)',
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <PlusCircle size={18} color={C.purple} />
        <Text style={{ color: C.purple, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
          Báo mất vật phẩm
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
