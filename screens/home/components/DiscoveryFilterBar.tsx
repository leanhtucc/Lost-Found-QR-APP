import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FIND_BACK } from '@/constants/theme';
import { DiscoveryFilterType } from '@/types/radar';
import { ItemCategory } from '@/types/item';
import { CATEGORY_NAMES_VI, getCategoryIcon } from '@/constants/categories';

interface DiscoveryFilterBarProps {
  typeFilter: DiscoveryFilterType;
  categoryFilter: ItemCategory | 'all';
  onTypeFilterChange: (type: DiscoveryFilterType) => void;
  onCategoryFilterChange: (category: ItemCategory | 'all') => void;
  testID?: string;
}

const TYPE_FILTERS: { value: DiscoveryFilterType; label: string; activeColor: string }[] = [
  { value: 'ALL', label: 'Tất cả', activeColor: FIND_BACK.primaryLight },
  { value: 'LOST', label: 'Bị mất', activeColor: '#f97316' },
  { value: 'FOUND', label: 'Đã tìm thấy', activeColor: '#10b981' },
];

const CATEGORIES: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  ...Object.entries(CATEGORY_NAMES_VI).map(([key, label]) => ({
    value: key as ItemCategory,
    label,
  })),
];

export const DiscoveryFilterBar: React.FC<DiscoveryFilterBarProps> = ({
  typeFilter,
  categoryFilter,
  onTypeFilterChange,
  onCategoryFilterChange,
  testID = 'discovery-filter-bar',
}) => {
  return (
    <View testID={testID} style={styles.container}>
      {/* Row 1: Status Segmented Filter */}
      <View style={styles.typeSegmentRow}>
        {TYPE_FILTERS.map(item => {
          const isActive = typeFilter === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              testID={`filter-type-${item.value.toLowerCase()}`}
              activeOpacity={0.8}
              onPress={() => onTypeFilterChange(item.value)}
              style={[
                styles.typeSegmentButton,
                isActive && {
                  backgroundColor: `${item.activeColor}22`,
                  borderColor: item.activeColor,
                },
              ]}
            >
              {isActive && (
                <View style={[styles.typeActiveDot, { backgroundColor: item.activeColor }]} />
              )}
              <Text
                style={[
                  styles.typeSegmentText,
                  isActive && { color: item.activeColor, fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Row 2: Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContainer}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map(cat => {
          const isActive = categoryFilter === cat.value;
          const IconComponent = cat.value === 'all' ? null : getCategoryIcon(cat.value);

          return (
            <TouchableOpacity
              key={cat.value}
              testID={`filter-category-${cat.value}`}
              activeOpacity={0.8}
              onPress={() => onCategoryFilterChange(cat.value)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              {IconComponent && (
                <IconComponent
                  size={13}
                  color={isActive ? FIND_BACK.primaryLight : FIND_BACK.mutedText}
                  style={styles.categoryIcon}
                />
              )}
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 15,
  },
  typeSegmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeSegmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  typeSegmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: FIND_BACK.mutedText,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryScrollContainer: {
    paddingRight: 16,
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(19, 19, 25, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(124, 106, 246, 0.18)',
    borderColor: FIND_BACK.primaryLight,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: FIND_BACK.subtleText,
  },
  categoryChipTextActive: {
    color: FIND_BACK.primaryLight,
    fontWeight: '700',
  },
});

export default DiscoveryFilterBar;
