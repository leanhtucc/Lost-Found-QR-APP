import React from 'react';
import { ImageBackground, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Crosshair, Edit3, MapPin, Minus, Plus } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { ReportLocation } from '../types';

interface LocationStepProps {
  mapImageUri: string;
  location: ReportLocation;
  manualAddress: string;
  onChangeManualAddress: (value: string) => void;
  useCurrentLocation: boolean;
  onToggleUseCurrentLocation: () => void;
  isResolvingCurrentLocation?: boolean;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  mapImageUri,
  location,
  manualAddress,
  onChangeManualAddress,
  useCurrentLocation,
  onToggleUseCurrentLocation,
  isResolvingCurrentLocation = false,
}) => {
  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 42, fontWeight: '800' }}>
        Bạn mất ở đâu?
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, marginTop: 8 }}>
        Kéo bản đồ để ghim vị trí chính xác vật dụng bị thất lạc.
      </Text>

      <View
        style={{
          marginTop: 24,
          borderRadius: REPORT_LAYOUT.cardRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: REPORT_COLORS.surface,
        }}
      >
        <ImageBackground
          source={{ uri: mapImageUri }}
          style={{ height: 360, justifyContent: 'center', alignItems: 'center' }}
        >
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: 'rgba(124,58,237,0.28)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: REPORT_COLORS.accentStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={24} color={REPORT_COLORS.textPrimary} />
            </View>
          </View>
          <View
            style={{
              marginTop: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(8,8,15,0.9)',
              borderWidth: 1,
              borderColor: REPORT_COLORS.border,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: REPORT_COLORS.accent,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 1,
              }}
            >
              GHIM VẬT DỤNG
            </Text>
          </View>

          <View style={{ position: 'absolute', right: 14, bottom: 14, gap: 8 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(36,36,54,0.92)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={18} color={REPORT_COLORS.textPrimary} />
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(36,36,54,0.92)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Minus size={18} color={REPORT_COLORS.textPrimary} />
            </View>
          </View>
        </ImageBackground>
      </View>

      <View
        style={{
          marginTop: 16,
          borderRadius: 20,
          backgroundColor: REPORT_COLORS.surfaceSoft,
          padding: 18,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: REPORT_COLORS.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MapPin size={18} color={REPORT_COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: REPORT_COLORS.textMuted,
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontWeight: '700',
            }}
          >
            {location.subtitle}
          </Text>
          <Text
            style={{
              color: REPORT_COLORS.textPrimary,
              fontSize: 25,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {location.title}
          </Text>
          <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 17, marginTop: 4 }}>
            {location.cityLine}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={{ paddingTop: 4 }}>
          <Edit3 size={20} color={REPORT_COLORS.accent} />
        </TouchableOpacity>
      </View>

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
          VỊ TRÍ ĐÁNH RƠI (FALLBACK)
        </Text>
        <TextInput
          value={manualAddress}
          onChangeText={onChangeManualAddress}
          placeholder="Nhập địa chỉ nếu không lấy được tự động"
          placeholderTextColor={REPORT_COLORS.textMuted}
          multiline
          style={{
            marginTop: 8,
            color: REPORT_COLORS.textPrimary,
            fontSize: 16,
            minHeight: 52,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleUseCurrentLocation}
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: useCurrentLocation ? REPORT_COLORS.accent : REPORT_COLORS.border,
          backgroundColor: useCurrentLocation ? REPORT_COLORS.accentSoft : 'rgba(36,36,54,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <Crosshair size={18} color={REPORT_COLORS.textPrimary} />
        <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 20, fontWeight: '600' }}>
          {isResolvingCurrentLocation ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
