import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { Item } from '@/types/item';
import { StatusFilterType } from '../hooks/useItemsFilter';
import { EmptyState } from './EmptyState';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_SHADOW } from '../constants/ui';
import { getCategoryLabel } from '@/constants/categories';
import { StatusBadge } from '@/components/atoms';

interface ItemsListProps {
  items: Item[];
  filteredItems: Item[];
  statusFilter: StatusFilterType;
  onSelectItem: (id: string) => void;
  onAddClick: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  filteredItems,
  statusFilter,
  onSelectItem,
  onAddClick,
}) => {
  const getStatusLabel = () => {
    switch (statusFilter) {
      case 'safe':
        return 'An toàn';
      case 'lost':
        return 'Đang mất';
      default:
        return 'Tất cả';
    }
  };

  return (
    <>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{getStatusLabel()}</Text>
        <Text style={styles.listSubtitle}>{filteredItems.length} kết quả</Text>
      </View>

      {filteredItems.length > 0 ? (
        <View style={styles.listWrap}>
          {filteredItems.map(item => {
            const isLost = item.status === 'LOST';
            const iconBackground = isLost ? MY_ITEMS_COLORS.lostSoft : MY_ITEMS_COLORS.safeSoft;
            const iconColor = isLost ? MY_ITEMS_COLORS.lostText : MY_ITEMS_COLORS.safeText;

            const shortAddress =
              item.captureAddress ||
              (typeof item.lastSeenLocation === 'string' ? item.lastSeenLocation : undefined);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => onSelectItem(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Xem chi tiết ${item.name}`}
              >
                <View style={styles.cardRow}>
                  {item.imagePublicUrl ? (
                    <View style={styles.thumbnailWrap}>
                      <Image
                        source={{ uri: item.imagePublicUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
                      <Package size={22} color={iconColor} strokeWidth={2.4} />
                    </View>
                  )}

                  <View style={styles.metaWrap}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemCategory}>{getCategoryLabel(item.category)}</Text>
                    {shortAddress ? (
                      <Text numberOfLines={1} style={styles.itemAddress}>
                        {shortAddress}
                      </Text>
                    ) : (
                      <Text style={styles.itemCode}>Chưa có vị trí đăng ký</Text>
                    )}
                  </View>

                  <StatusBadge status={item.status} size="sm" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : items.length === 0 ? (
        <EmptyState type="no-items" onAddClick={onAddClick} />
      ) : (
        <EmptyState type="no-results" />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MY_ITEMS_COLORS.textPrimary,
  },
  listSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MY_ITEMS_COLORS.textSecondary,
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderRadius: MY_ITEMS_RADIUS.card,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
    padding: 14,
    marginBottom: 12,
    ...MY_ITEMS_SHADOW.card,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: MY_ITEMS_COLORS.textPrimary,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: MY_ITEMS_COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  itemCode: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: MY_ITEMS_COLORS.textMuted,
  },
  thumbnailWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: MY_ITEMS_COLORS.border,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  itemAddress: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: MY_ITEMS_COLORS.textSecondary,
  },
});
