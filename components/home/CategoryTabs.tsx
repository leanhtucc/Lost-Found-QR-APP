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
    <View className="mb-5 h-12 flex-row rounded-full bg-fb-surface-muted p-1">
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-full ${activeTab === 'lost' ? 'bg-fb-primary' : ''}`}
        onPress={() => onChange('lost')}
      >
        <Text
          className={`font-semibold ${activeTab === 'lost' ? 'text-fb-content' : 'text-fb-muted'}`}
        >
          Mất gần đây
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-full ${activeTab === 'found' ? 'bg-fb-surface-elevated' : ''}`}
        onPress={() => onChange('found')}
      >
        <Text
          className={`font-semibold ${activeTab === 'found' ? 'text-fb-content' : 'text-fb-muted'}`}
        >
          Nhặt được
        </Text>
      </TouchableOpacity>
    </View>
  );
};
