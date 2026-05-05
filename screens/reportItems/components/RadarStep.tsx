import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Clock3, LocateFixed, Radar, RefreshCcw } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { RadarSimulationState } from '../types';

interface RadarStepProps {
  simulation: RadarSimulationState;
  isLoading: boolean;
  onRetry: () => void;
}

const RadarInfoCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        backgroundColor: REPORT_COLORS.surfaceSoft,
        padding: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text
          style={{
            color: REPORT_COLORS.textMuted,
            fontSize: 11,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{ color: REPORT_COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 4 }}
      >
        {value}
      </Text>
    </View>
  );
};

export const RadarStep: React.FC<RadarStepProps> = ({ simulation, isLoading, onRetry }) => {
  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 42, fontWeight: '800' }}>
        Radar đang hoạt động
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, marginTop: 8 }}>
        Số người dùng đang hoạt động gần khu vực của bạn trong bán kính đã chọn.
      </Text>

      <View
        style={{
          marginTop: 24,
          borderRadius: REPORT_LAYOUT.cardRadius,
          backgroundColor: 'rgba(36,36,54,0.75)',
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          padding: 18,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: REPORT_COLORS.accentSoft,
            marginBottom: 14,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={REPORT_COLORS.accent} />
          ) : (
            <Radar size={34} color={REPORT_COLORS.accent} />
          )}
        </View>

        <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 30, fontWeight: '800' }}>
          {simulation.activeUsersCount.toLocaleString('vi-VN')} người đang hoạt động gần đây
        </Text>

        <Text
          style={{
            color: REPORT_COLORS.textSecondary,
            fontSize: 16,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 23,
          }}
        >
          Họ sẽ nhận cảnh báo khi bạn kích hoạt Guardian và ở trong bán kính tìm kiếm.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <RadarInfoCard
            title="Phạm vi"
            value={`${simulation.recommendedRadius.toLocaleString('vi-VN')}m`}
            icon={<LocateFixed size={16} color={REPORT_COLORS.accent} />}
          />
          <RadarInfoCard
            title="Thời gian"
            value={`${simulation.estimatedDurationHours} giờ`}
            icon={<Clock3 size={16} color={REPORT_COLORS.accent} />}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        onPress={onRetry}
        disabled={isLoading}
        style={{
          marginTop: 16,
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: 'rgba(36,36,54,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: isLoading ? 0.75 : 1,
        }}
      >
        <RefreshCcw size={16} color={REPORT_COLORS.textPrimary} />
        <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 17, fontWeight: '600' }}>
          {isLoading ? 'Đang cập nhật...' : 'Mô phỏng lại'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
