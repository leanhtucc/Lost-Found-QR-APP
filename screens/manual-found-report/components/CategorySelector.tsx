import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tag } from 'lucide-react-native';
import { FIND_BACK } from '@constants/theme';
import { FONT_FAMILY } from '@constants/fonts';
import type { ItemCategory } from '@/types/item';
import { CATEGORY_OPTIONS } from '../constants/options';

interface CategorySelectorProps {
  category: ItemCategory;
  onSelectCategory: (cat: ItemCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  onSelectCategory,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabel}>
        <Tag size={15} color={FIND_BACK.primaryLight} />
        <Text style={styles.fieldLabelText}>Danh mục</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORY_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            onPress={() => onSelectCategory(opt.value)}
            style={[styles.categoryChip, category === opt.value && styles.categoryChipSelected]}
          >
            <Text
              style={[
                styles.categoryChipText,
                category === opt.value && styles.categoryChipTextSelected,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabelText: {
    color: FIND_BACK.bodyText,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  categoryList: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.surfaceMuted,
  },
  categoryChipSelected: {
    borderColor: FIND_BACK.secondary,
    backgroundColor: 'rgba(46, 204, 139, 0.15)',
  },
  categoryChipText: {
    color: FIND_BACK.mutedText,
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
  categoryChipTextSelected: {
    color: FIND_BACK.secondary,
  },
});
