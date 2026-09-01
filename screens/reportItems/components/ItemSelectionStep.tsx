import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Check, Plus, RotateCcw } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { ReportItemOption } from '../types';
import { SelectionSummaryResponse } from '@services/items';

const FALLBACK_ITEM_IMAGE =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=60';

interface ItemSelectionStepProps {
  items: ReportItemOption[];
  selectedItemId: string;
  onSelectItem: (itemId: string) => void;
  onAddNewItem?: () => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  isCreatingItem?: boolean;
  selectionSummary?: SelectionSummaryResponse | null;
  isFetchingSelectionSummary?: boolean;
}

export const ItemSelectionStep: React.FC<ItemSelectionStepProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onAddNewItem,
  isLoading = false,
  loadError,
  onRetry,
  isCreatingItem = false,
  selectionSummary,
  isFetchingSelectionSummary,
}) => {
  const selectedItem = items.find(item => item.id === selectedItemId) ?? items[0];

  const selectedColor = selectedItem?.details.color || 'Chưa cập nhật';
  const selectedStorage = selectedItem?.details.storage || 'Chưa cập nhật';
  const selectedSerial = selectedItem?.details.serial || 'Chưa cập nhật';

  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 32, fontWeight: '800' }}>
        Bạn mất vật gì?
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 16, marginTop: 8 }}>
        Kho của bạn có {items.length} vật dụng. Chọn món đồ bạn vừa làm mất để tiếp tục.
      </Text>

      {isLoading ? (
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 14, marginTop: 12 }}>
          Đang tải vật dụng của bạn...
        </Text>
      ) : null}

      {!isLoading && loadError ? (
        <View
          style={{
            marginTop: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(215, 51, 87, 0.35)',
            backgroundColor: 'rgba(215, 51, 87, 0.1)',
            padding: 14,
          }}
        >
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 14, lineHeight: 21 }}>
            Không thể tải đầy đủ kho đồ hoặc kiểm tra điều kiện báo mất. Vui lòng thử lại.
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}
          >
            <RotateCcw size={16} color={REPORT_COLORS.accent} />
            <Text style={{ color: REPORT_COLORS.accent, fontSize: 14, fontWeight: '700' }}>
              Thử tải lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isLoading && !loadError && items.length === 0 ? (
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 14, marginTop: 12 }}>
          Kho của bạn chưa có vật dụng nào.
        </Text>
      ) : null}

      {!isLoading && !loadError && items.length > 0 && !items.some(item => item.isEligible) ? (
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 14, marginTop: 12 }}>
          Hiện không có vật dụng SAFE nào đủ điều kiện báo mất. Các vật dụng khác vẫn được hiển thị
          để bạn kiểm tra trạng thái.
        </Text>
      ) : null}

      {isCreatingItem ? (
        <Text style={{ color: REPORT_COLORS.accent, fontSize: 14, marginTop: 8 }}>
          Đang phân tích ảnh và thêm vật phẩm mới bằng AI...
        </Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 24, flexGrow: 0, marginHorizontal: -REPORT_LAYOUT.horizontalPadding }}
        contentContainerStyle={{
          paddingHorizontal: REPORT_LAYOUT.horizontalPadding,
          paddingRight: REPORT_LAYOUT.horizontalPadding + 16,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            console.log('[ItemSelectionStep] Tapped Thêm mới');
            onAddNewItem?.();
          }}
          disabled={isCreatingItem}
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
            opacity: isCreatingItem ? 0.7 : 1,
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
              fontSize: 18,
              fontWeight: '600',
              marginTop: 16,
            }}
          >
            {isCreatingItem ? 'Đang tạo...' : 'Thêm mới'}
          </Text>
        </TouchableOpacity>

        {items.map(item => {
          const isSelected = item.id === selectedItemId;
          const isDisabled = !item.isEligible;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => {
                console.log(`[ItemSelectionStep] Tapped item: ${item.id} - ${item.name}`);
                onSelectItem(item.id);
              }}
              disabled={isDisabled}
              style={{
                width: 196,
                borderRadius: 20,
                backgroundColor: '#2a2a36',
                borderWidth: 2,
                borderColor: isSelected ? REPORT_COLORS.accent : 'transparent',
                padding: 12,
                marginRight: 16,
                opacity: isDisabled ? 0.52 : 1,
              }}
            >
              <Image
                source={{ uri: item.imageUrl || FALLBACK_ITEM_IMAGE }}
                style={{ width: '100%', height: 140, borderRadius: 12 }}
                resizeMode="cover"
              />
              <Text
                style={{
                  color: REPORT_COLORS.textPrimary,
                  fontSize: 24,
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

              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 8,
                  borderRadius: 999,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  backgroundColor: item.isEligible
                    ? 'rgba(46, 204, 139, 0.14)'
                    : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Text
                  style={{
                    color: item.isEligible ? '#2ECC8B' : REPORT_COLORS.textMuted,
                    fontSize: 10,
                    fontWeight: '800',
                    letterSpacing: 0.6,
                  }}
                >
                  {item.isEligible
                    ? 'CÓ THỂ BÁO MẤT'
                    : item.status === 'SAFE'
                      ? 'ĐANG CÓ GUARDIAN'
                      : item.status}
                </Text>
              </View>

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

      {isFetchingSelectionSummary ? (
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 14 }}>
            Đang tải dữ liệu AI...
          </Text>
        </View>
      ) : selectionSummary ? (
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
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 20, fontWeight: '700' }}>
            Chi tiết lựa chọn
          </Text>
          <Text style={{ color: '#2DD4BF', fontSize: 16, marginTop: 8, fontWeight: '700' }}>
            {selectionSummary.name}
          </Text>
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 14, marginTop: 4 }}>
            {selectionSummary.display_text.primary}
          </Text>
          {selectionSummary.display_text.secondary ? (
            <Text
              style={{
                color: REPORT_COLORS.textSecondary,
                fontSize: 14,
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {selectionSummary.display_text.secondary}
            </Text>
          ) : null}
          {selectionSummary.display_text.serial_number ? (
            <Text
              style={{
                color: REPORT_COLORS.textMuted,
                fontSize: 13,
                marginTop: 6,
                fontFamily: 'monospace',
              }}
            >
              S/N: {selectionSummary.display_text.serial_number}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <View
              style={{
                backgroundColor:
                  selectionSummary.status_badges.color_theme === 'SUCCESS'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(107, 114, 128, 0.1)',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor:
                  selectionSummary.status_badges.color_theme === 'SUCCESS' ? '#22C55E' : '#6B7280',
              }}
            >
              <Text
                style={{
                  color:
                    selectionSummary.status_badges.color_theme === 'SUCCESS'
                      ? '#22C55E'
                      : '#6B7280',
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {selectionSummary.status_badges.label}
              </Text>
            </View>

            {selectionSummary.ai_visual_tags?.map((tag, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: '#1a1a23',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 11 }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : selectedItem ? (
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
          <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 20, fontWeight: '700' }}>
            Chi tiết lựa chọn
          </Text>
          <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 16, marginTop: 8 }}>
            Đã chọn{' '}
            <Text style={{ color: REPORT_COLORS.accent, fontWeight: '700' }}>
              {selectedItem.name}
            </Text>
            , {selectedItem.subtitle}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <View
              style={{
                backgroundColor: '#1a1a23',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>
                MÀU: {selectedColor}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#1a1a23',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>
                DUNG LƯỢNG: {selectedStorage}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#1a1a23',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 11, fontWeight: '700' }}>
                S/N: {selectedSerial}
              </Text>
            </View>
            {selectedItem.hasInsurance ? (
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
