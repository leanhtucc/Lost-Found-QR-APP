import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Item } from '@/types/item';
import { categoryOptions } from '../constants/categories';
import { MY_ITEMS_COLORS, MY_ITEMS_RADIUS } from '../constants/ui';

interface CategoryFilterProps {
  selectedCategory: Item['category'] | 'all';
  onCategoryChange: (category: Item['category'] | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.row}>
        {categoryOptions.map(({ value, label, icon: Icon }) =>
          selectedCategory === value ? (
            <TouchableOpacity
              key={value}
              activeOpacity={0.9}
              onPress={() => onCategoryChange(value)}
              style={styles.pillButtonTouch}
            >
              <Icon size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.activeLabel}>{label}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={value}
              activeOpacity={0.86}
              onPress={() => onCategoryChange(value)}
              style={styles.inactivePill}
            >
              <Icon size={16} color={MY_ITEMS_COLORS.textSecondary} strokeWidth={2.2} />
              <Text style={styles.inactiveLabel}>{label}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pillButtonTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: MY_ITEMS_RADIUS.chip,
    backgroundColor: MY_ITEMS_COLORS.primaryStart,
  },
  activePill: {
    borderRadius: MY_ITEMS_RADIUS.chip,
  },
  inactivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: MY_ITEMS_RADIUS.chip,
    backgroundColor: MY_ITEMS_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(142, 108, 255, 0.26)',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: MY_ITEMS_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
