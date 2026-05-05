import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Lock, ShieldCheck, Wallet } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { RewardOption } from '../types';

interface RewardStepProps {
  rewards: RewardOption[];
  selectedRewardId: string;
  onSelectReward: (rewardId: string) => void;
  customRewardAmount: number;
  onChangeCustomRewardAmount: (amount: number) => void;
}

const formatCurrency = (value: number): string => {
  return `${value.toLocaleString('vi-VN')}đ`;
};

export const RewardStep: React.FC<RewardStepProps> = ({
  rewards,
  selectedRewardId,
  onSelectReward,
  customRewardAmount,
  onChangeCustomRewardAmount,
}) => {
  const isCustomSelected = selectedRewardId === 'custom';

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
        onPress={() => onSelectReward('custom')}
        style={{
          marginTop: 10,
          borderRadius: 14,
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderWidth: isCustomSelected ? 2 : 1,
          borderColor: isCustomSelected ? REPORT_COLORS.accent : 'rgba(255,255,255,0.08)',
          backgroundColor: isCustomSelected ? REPORT_COLORS.accentSoft : 'rgba(36,36,54,0.45)',
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

      {isCustomSelected ? (
        <View
          style={{
            marginTop: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: REPORT_COLORS.border,
            backgroundColor: 'rgba(36,36,54,0.55)',
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 12, fontWeight: '700' }}>
            SỐ TIỀN THƯỞNG TÙY CHỈNH (TỐI THIỂU 10.000Đ)
          </Text>
          <TextInput
            keyboardType="number-pad"
            value={String(customRewardAmount)}
            onChangeText={value => {
              const normalized = value.replace(/\D/g, '');
              onChangeCustomRewardAmount(normalized ? Number(normalized) : 0);
            }}
            placeholder="Ví dụ: 150000"
            placeholderTextColor={REPORT_COLORS.textMuted}
            style={{
              marginTop: 8,
              color: REPORT_COLORS.textPrimary,
              fontSize: 22,
              fontWeight: '700',
            }}
          />
        </View>
      ) : null}

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
