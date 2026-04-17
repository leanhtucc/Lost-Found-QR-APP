import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Lock, ShieldCheck, Wallet } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { RewardOption } from '../types';

interface RewardStepProps {
  rewards: RewardOption[];
  selectedRewardId: string;
  onSelectReward: (rewardId: string) => void;
}

const formatCurrency = (value: number): string => {
  return `${value.toLocaleString('vi-VN')}đ`;
};

export const RewardStep: React.FC<RewardStepProps> = ({
  rewards,
  selectedRewardId,
  onSelectReward,
}) => {
  return (
    <View>
      <Text
        style={{
          color: REPORT_COLORS.textPrimary,
          fontSize: 42,
          fontWeight: '800',
          textAlign: 'center',
        }}
      >
        Treo thưởng bao nhiêu?
      </Text>
      <Text
        style={{
          color: REPORT_COLORS.textSecondary,
          fontSize: 18,
          marginTop: 10,
          textAlign: 'center',
        }}
      >
        Một phần thưởng xứng đáng giúp tăng khả năng tìm thấy món đồ nhanh hơn.
      </Text>

      <View
        style={{
          marginTop: 24,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: 12,
        }}
      >
        {rewards.map(option => {
          const selected = option.id === selectedRewardId;

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.88}
              onPress={() => onSelectReward(option.id)}
              style={{
                width: '48%',
                borderRadius: 14,
                paddingVertical: 16,
                paddingHorizontal: 14,
                backgroundColor: selected ? REPORT_COLORS.accentSoft : 'transparent',
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? REPORT_COLORS.accent : 'rgba(255,255,255,0.06)',
              }}
            >
              <Text
                style={{
                  color: selected ? REPORT_COLORS.accent : REPORT_COLORS.textMuted,
                  fontSize: 12,
                  letterSpacing: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                {option.label}
              </Text>
              <Text
                style={{
                  color: selected ? REPORT_COLORS.accent : REPORT_COLORS.textPrimary,
                  fontSize: 34,
                  fontWeight: '700',
                  marginTop: 4,
                }}
              >
                {formatCurrency(option.amount)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        style={{
          marginTop: 10,
          borderRadius: 14,
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(36,36,54,0.45)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Wallet size={18} color={REPORT_COLORS.textSecondary} />
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 18, fontWeight: '500' }}>
            Tùy chỉnh số tiền
          </Text>
        </View>
        <ChevronRight size={18} color={REPORT_COLORS.textSecondary} />
      </TouchableOpacity>

      <View
        style={{
          marginTop: 16,
          borderRadius: REPORT_LAYOUT.cardRadius,
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: 'rgba(36,36,54,0.45)',
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              backgroundColor: REPORT_COLORS.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={20} color={REPORT_COLORS.accent} />
          </View>
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 23, fontWeight: '700' }}>
            Bảo mật & Cam kết
          </Text>
        </View>

        <View style={{ marginTop: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Lock size={15} color={REPORT_COLORS.accent} style={{ marginTop: 2 }} />
            <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, flex: 1 }}>
              Tiền sẽ được khóa an toàn bởi hệ thống Guardian.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Lock size={15} color={REPORT_COLORS.accent} style={{ marginTop: 2 }} />
            <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, flex: 1 }}>
              Hoàn trả 100% nếu không tìm thấy sau 30 ngày.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Lock size={15} color={REPORT_COLORS.accent} style={{ marginTop: 2 }} />
            <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, flex: 1 }}>
              Xác minh danh tính người nhận thưởng tự động.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
