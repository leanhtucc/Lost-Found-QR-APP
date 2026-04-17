import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { ReportItemOption } from '../types';

interface ItemSelectionStepProps {
  items: ReportItemOption[];
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
  isLoading?: boolean;
}

export const ItemSelectionStep: React.FC<ItemSelectionStepProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  isLoading = false,
}) => {
  const selectedItem = items.find(item => item.id === selectedItemId) ?? items[0];

  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 42, fontWeight: '800' }}>
        Bạn mất vật gì?
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 20, marginTop: 8 }}>
        Chọn vật phẩm từ kho của bạn hoặc thêm mới.
      </Text>

      {isLoading ? (
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 14, marginTop: 12 }}>
          Đang tải vật dụng của bạn...
        </Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 24 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            width: 176,
            height: 228,
            borderRadius: 20,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: 'rgba(196,181,253,0.4)',
            backgroundColor: '#1f1f2b',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#2f2f40',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={20} color={REPORT_COLORS.accent} />
          </View>
          <Text
            style={{
              color: REPORT_COLORS.textPrimary,
              fontSize: 22,
              fontWeight: '600',
              marginTop: 16,
            }}
          >
            Thêm mới
          </Text>
        </TouchableOpacity>

        {items.map(item => {
          const isSelected = item.id === selectedItemId;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => onSelectItem(item.id)}
              style={{
                width: 196,
                borderRadius: 20,
                backgroundColor: '#2a2a36',
                borderWidth: 2,
                borderColor: isSelected ? REPORT_COLORS.accent : 'transparent',
                padding: 12,
                marginRight: 16,
              }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 140, borderRadius: 12 }}
                resizeMode="cover"
              />
              <Text
                style={{
                  color: REPORT_COLORS.textPrimary,
                  fontSize: 32,
                  fontWeight: '700',
                  marginTop: 12,
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: REPORT_COLORS.textSecondary,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
                numberOfLines={1}
              >
                {item.category}
              </Text>

              {isSelected ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: REPORT_COLORS.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} color="#1b0f36" />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedItem ? (
        <View
          style={{
            marginTop: 26,
            borderRadius: REPORT_LAYOUT.cardRadius,
            backgroundColor: 'rgba(36,36,54,0.75)',
            borderWidth: 1,
            borderColor: REPORT_COLORS.border,
            padding: 18,
          }}
        >
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 26, fontWeight: '700' }}>
            Chi tiết lựa chọn
          </Text>
          <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 19, marginTop: 8 }}>
            Đã chọn{' '}
            <Text style={{ color: REPORT_COLORS.accent, fontWeight: '700' }}>
              {selectedItem.name}
            </Text>
            , {selectedItem.subtitle}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View
              style={{
                backgroundColor: '#1a1a23',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>
                S/N: {selectedItem.serialNumber}
              </Text>
            </View>
            {selectedItem.insured ? (
              <View
                style={{
                  backgroundColor: REPORT_COLORS.chipBg,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: REPORT_COLORS.accent, fontSize: 11, fontWeight: '700' }}>
                  CÓ BẢO HIỂM
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};
