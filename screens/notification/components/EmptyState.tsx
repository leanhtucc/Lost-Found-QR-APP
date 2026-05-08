/**
 * EmptyState Component
 * Premium dark empty state with search icon and helpful tips
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Search, Shield, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';

const C = {
  bg: '#0B0B0C',
  surface: '#18181B',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F3FF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  purple: '#8B5CF6',
  green: '#22C55E',
  cyan: '#22D3EE',
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
          backgroundColor: 'rgba(139,92,246,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(139,92,246,0.3)',
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ color: C.purple, fontSize: 15, fontWeight: '700' }}>
          🔍 Báo mất vật phẩm
        </Text>
      </TouchableOpacity>

      {/* ── Tips ── */}
      <TipCard
        icon={<Shield size={20} color={C.green} />}
        iconBg="rgba(34,197,94,0.12)"
        title="Bảo mật tài khoản"
        subtitle="Kiểm tra trang thái bảo mật của bạn để nhận thông báo an toàn hơn."
      />
      <TipCard
        icon={<Sparkles size={20} color={C.cyan} />}
        iconBg="rgba(34,211,238,0.12)"
        title="Mẹo tìm kiếm"
        subtitle="Sử dụng bộ lọc thông minh để tìm thấy vật phẩm nhanh hơn 2 lần."
      />
    </Animated.View>
  );
};

// ─── TipCard ─────────────────────────────────────────────────────────────────

const TipCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
}> = ({ icon, iconBg, title, subtitle }) => (
  <View
    style={{
      flexDirection: 'row',
      gap: 14,
      backgroundColor: '#18181B',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      padding: 16,
      marginBottom: 12,
    }}
  >
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#F5F3FF', fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: '#A1A1AA', fontSize: 12, lineHeight: 17 }}>{subtitle}</Text>
    </View>
  </View>
);
