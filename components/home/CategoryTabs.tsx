// components/home/CategoryTabs.tsx
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export type TabOption = 'lost' | 'found';

interface CategoryTabsProps {
  activeTab: TabOption;
  onChange: (tab: TabOption) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onChange }) => {
  return (
    <View className="flex-row bg-[#1A1A1C] rounded-full p-1 mb-5 h-12">
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-full ${activeTab === 'lost' ? 'bg-[#6C63FF]' : ''}`}
        onPress={() => onChange('lost')}
      >
        <Text className={`font-semibold ${activeTab === 'lost' ? 'text-white' : 'text-gray-400'}`}>
          Mất gần đây
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-full ${activeTab === 'found' ? 'bg-[#2A2A2D]' : ''}`}
        onPress={() => onChange('found')}
      >
        <Text className={`font-semibold ${activeTab === 'found' ? 'text-white' : 'text-gray-400'}`}>
          Nhặt được
        </Text>
      </TouchableOpacity>
    </View>
  );
};
