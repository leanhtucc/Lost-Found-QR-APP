import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Item } from '@/types/item';
import { FIND_BACK } from '@constants/theme';
import { categoryOptions } from '../constants/categories';

interface CategoryFilterProps {
  selectedCategory: Item['category'] | 'all';
  onCategoryChange: (category: Item['category'] | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
      <View className="flex-row gap-2">
        {categoryOptions.map(({ value, label, icon: Icon }) => (
          <TouchableOpacity
            key={value}
            onPress={() => onCategoryChange(value)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full ${
              selectedCategory === value ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          >
            <Icon
              size={16}
              color={selectedCategory === value ? FIND_BACK.bodyText : FIND_BACK.labelText}
            />
            <Text
              className={`text-sm font-medium ${
                selectedCategory === value ? 'text-white' : 'text-gray-600'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
