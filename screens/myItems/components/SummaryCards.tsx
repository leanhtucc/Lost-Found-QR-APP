import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { StatusFilterType } from '../hooks/useItemsFilter';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS, MY_ITEMS_SHADOW } from '../constants/ui';

interface SummaryCardsProps {
  totalItems: number;
  safeCount: number;
  lostCount: number;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalItems,
  safeCount,
  lostCount,
  statusFilter,
  onStatusFilterChange,
}) => {
  const getCardVisual = (type: 'all' | 'safe' | 'lost') => {
    if (type === 'safe') {
      return {
        iconBackground: 'rgba(46, 204, 139, 0.2)',
        iconColor: '#72DFA3',
        activeBorder: '#35BA84',
      };
    }

    if (type === 'lost') {
      return {
        iconBackground: 'rgba(215, 51, 87, 0.2)',
        iconColor: '#FF8DA3',
        activeBorder: '#DF4F63',
      };
    }

    return {
      iconBackground: MY_ITEMS_COLORS.primarySoft,
      iconColor: MY_ITEMS_COLORS.primaryStart,
      activeBorder: MY_ITEMS_COLORS.primaryStart,
    };
  };

  const renderCard = (
    type: StatusFilterType,
    label: string,
    value: number,
    iconType: 'all' | 'safe' | 'lost'
  ) => {
    const isActive = statusFilter === type;
    const visual = getCardVisual(iconType);

    return (
      <TouchableOpacity
        key={type}
        activeOpacity={0.88}
        style={[
          styles.card,
          isActive
            ? {
                borderColor: visual.activeBorder,
                shadowColor: visual.activeBorder,
                shadowOpacity: 0.18,
                shadowRadius: 14,
                elevation: 6,
              }
            : styles.cardInactive,
        ]}
        onPress={() => onStatusFilterChange(type)}
      >
        <View style={[styles.iconWrap, { backgroundColor: visual.iconBackground }]}>
          <Package size={18} color={visual.iconColor} strokeWidth={2.5} />
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderCard('all', 'Tổng cộng', totalItems, 'all')}
      {renderCard('safe', 'An toàn', safeCount, 'safe')}
      {renderCard('lost', 'Đang mất', lostCount, 'lost')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: MY_ITEMS_RADIUS.card,
    backgroundColor: MY_ITEMS_COLORS.surface,
    borderWidth: 1.5,
    ...MY_ITEMS_SHADOW.card,
  },
  cardInactive: {
    borderColor: MY_ITEMS_COLORS.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: MY_ITEMS_COLORS.textPrimary,
    lineHeight: 24,
  },
  cardLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: MY_ITEMS_COLORS.textSecondary,
    textAlign: 'center',
  },
});
