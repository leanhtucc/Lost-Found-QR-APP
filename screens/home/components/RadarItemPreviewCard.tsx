import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MapPin, Package, X } from 'lucide-react-native';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { FIND_BACK } from '@/constants/theme';
import { HomeLostFeedCard, MapDiscoveryCard } from '@/types/radar';

export interface RadarItemPreviewCardProps {
  card: HomeLostFeedCard | MapDiscoveryCard;
  onPressDetail: (itemId: string) => void;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const FALLBACK_ADDRESS = 'Chưa xác định địa chỉ';

export const RadarItemPreviewCard: React.FC<RadarItemPreviewCardProps> = ({
  card,
  onPressDetail,
  onClose,
  style,
  testID = 'radar-item-preview-card',
}) => {
  const cardKey =
    'discoveryKey' in card && card.discoveryKey ? card.discoveryKey : (card as any).itemId || '';

  const isFound =
    card.reportType === 'FOUND' ||
    ('source' in card && card.source === 'FOUND_REPORT') ||
    (typeof cardKey === 'string' &&
      (cardKey.startsWith('found:') || cardKey.startsWith('FOUND_REPORT:')));

  const addressText = card.address?.trim() || FALLBACK_ADDRESS;
  const distanceText =
    card.distanceLabel?.trim() ||
    (typeof card.distanceMeters === 'number' ? `${Math.round(card.distanceMeters)}m` : null);

  return (
    <View testID={testID} style={[styles.cardContainer, style]}>
      {/* Header Row: Badges and Close Button */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <StatusBadge status={isFound ? 'FOUND' : 'LOST'} size="sm" />
          {card.isOwn && (
            <View style={styles.ownBadge}>
              <Text style={styles.ownBadgeText}>Đồ của bạn</Text>
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng thẻ xem trước"
          hitSlop={10}
          onPress={onClose}
          style={styles.closeButton}
          testID="radar-preview-close-btn"
        >
          <X size={16} color={FIND_BACK.mutedText} />
        </Pressable>
      </View>

      {/* Main Content: Thumbnail + Info */}
      <View style={styles.contentRow}>
        <View style={styles.imageWrapper}>
          {card.imagePublicUrl ? (
            <Image
              source={{ uri: card.imagePublicUrl }}
              style={styles.image}
              resizeMode="cover"
              testID="radar-preview-image"
            />
          ) : (
            <View style={styles.imageFallback} testID="radar-preview-image-fallback">
              <Package size={26} color={FIND_BACK.subtleText} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.infoWrapper}>
          <Text numberOfLines={1} style={styles.titleText}>
            {card.name || 'Vật phẩm thất lạc'}
          </Text>

          {!card.isOwn && !!card.ownerDisplayName && (
            <Text numberOfLines={1} style={styles.ownerText}>
              Đăng bởi {card.ownerDisplayName}
            </Text>
          )}

          <View style={styles.locationRow}>
            <MapPin size={12} color={FIND_BACK.primary} />
            <Text numberOfLines={1} style={styles.addressText}>
              {distanceText ? `${distanceText} • ${addressText}` : addressText}
            </Text>
          </View>
        </View>
      </View>

      {/* Optional Lost Message Excerpt */}
      {!!card.lostMessage && (
        <Text numberOfLines={2} style={styles.messageText}>
          {card.lostMessage}
        </Text>
      )}

      {/* Action CTA Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xem chi tiết bài đăng"
        onPress={() => onPressDetail(cardKey)}
        style={styles.actionButton}
        testID="radar-preview-detail-btn"
      >
        <Text style={styles.actionButtonText}>Xem chi tiết</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: FIND_BACK.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(124, 106, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(124, 106, 246, 0.3)',
  },
  ownBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: FIND_BACK.primary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIND_BACK.surfaceElevated,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: FIND_BACK.surfaceElevated,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: FIND_BACK.bodyText,
  },
  ownerText: {
    fontSize: 11,
    color: FIND_BACK.mutedText,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: FIND_BACK.mutedText,
  },
  messageText: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: FIND_BACK.borderGlass,
    fontSize: 12,
    lineHeight: 16,
    color: FIND_BACK.bodyMuted,
  },
  actionButton: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: FIND_BACK.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RadarItemPreviewCard;
