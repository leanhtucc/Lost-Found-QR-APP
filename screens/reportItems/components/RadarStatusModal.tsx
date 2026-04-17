import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Clock3, LocateFixed, Radar, X } from 'lucide-react-native';
import { REPORT_COLORS } from '../constants/theme';

interface RadarStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

const RadarInfoCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => {
  return (
    <View
      style={{ flex: 1, borderRadius: 14, backgroundColor: REPORT_COLORS.surfaceSoft, padding: 12 }}
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
        style={{ color: REPORT_COLORS.textPrimary, fontSize: 22, fontWeight: '600', marginTop: 4 }}
      >
        {value}
      </Text>
    </View>
  );
};

export const RadarStatusModal: React.FC<RadarStatusModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.78)',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            borderRadius: 24,
            backgroundColor: REPORT_COLORS.background,
            borderWidth: 1,
            borderColor: REPORT_COLORS.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
            }}
          >
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <X size={18} color={REPORT_COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 19, fontWeight: '700' }}>
              Đang dò tìm
            </Text>
            <Text
              style={{
                color: REPORT_COLORS.accent,
                fontSize: 12,
                letterSpacing: 1,
                fontWeight: '700',
              }}
            >
              GUARDIAN
            </Text>
          </View>

          <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 }}>
            <View
              style={{
                marginTop: 12,
                width: 190,
                height: 190,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 190,
                  height: 190,
                  borderRadius: 95,
                  borderWidth: 1,
                  borderColor: 'rgba(167,139,250,0.18)',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 138,
                  height: 138,
                  borderRadius: 69,
                  borderWidth: 1,
                  borderColor: 'rgba(167,139,250,0.25)',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  borderWidth: 1,
                  borderColor: 'rgba(167,139,250,0.35)',
                }}
              />
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: REPORT_COLORS.accentStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Radar size={28} color={REPORT_COLORS.textPrimary} />
              </View>
              <View
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 34,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#c4b5fd',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 34,
                  left: 30,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#a78bfa',
                }}
              />
            </View>

            <Text
              style={{
                color: REPORT_COLORS.textPrimary,
                fontSize: 38,
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              Radar đang hoạt động
            </Text>
            <View
              style={{
                marginTop: 8,
                borderRadius: 999,
                backgroundColor: REPORT_COLORS.chipBg,
                borderWidth: 1,
                borderColor: REPORT_COLORS.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: REPORT_COLORS.accent, fontSize: 16, fontWeight: '700' }}>
                12 người đã được thông báo
              </Text>
            </View>
            <Text
              style={{
                color: REPORT_COLORS.textSecondary,
                fontSize: 17,
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 24,
              }}
            >
              Họ sẽ nhận thông báo nếu ở gần khu vực của bạn. Hãy giữ liên lạc để cập nhật thông tin
              mới nhất.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <RadarInfoCard
                title="Phạm vi"
                value="500m quanh bạn"
                icon={<LocateFixed size={16} color={REPORT_COLORS.accent} />}
              />
              <RadarInfoCard
                title="Thời gian"
                value="24 giờ tới"
                icon={<Clock3 size={16} color={REPORT_COLORS.accent} />}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.84}
              onPress={onClose}
              style={{
                marginTop: 18,
                width: '100%',
                height: 52,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 18, fontWeight: '600' }}>
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
