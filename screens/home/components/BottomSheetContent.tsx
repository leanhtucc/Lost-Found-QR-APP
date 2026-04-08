import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Item } from '@/types/item';
import { HomeItemCard } from './HomeItemCard';
import { Plus } from 'lucide-react-native';

interface BottomSheetContentProps {
  items: Item[];
  onSelectItem: (itemId: string) => void;
  onScanPress?: () => void;
}

export const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
  items,
  onSelectItem,
  onScanPress,
}) => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');

  // Filter items based on active tab
  // Assuming 'lost' means item.status === 'lost' and 'found' implies item.status !== 'lost'
  // (In the current types, status can be 'safe' or 'lost')
  const filteredItems = items.filter(i =>
    activeTab === 'lost' ? i.status === 'lost' : i.status === 'safe'
  );

  return (
    <View className="flex-1 bg-[#121214] border-t border-[#2A2A2D] rounded-t-[32px]">
      <View className="px-5 pt-4 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-white font-bold text-xl">Mất gần đây</Text>
          <TouchableOpacity>
            <Text className="text-[#6C63FF] text-xs font-bold tracking-wider">XEM TẤT CẢ</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-[#1A1A1C] rounded-full p-1 mb-5 h-12">
          <TouchableOpacity
            className={`flex-1 items-center justify-center rounded-full ${activeTab === 'lost' ? 'bg-[#6C63FF]' : 'bg-transparent'}`}
            onPress={() => setActiveTab('lost')}
          >
            <Text
              className={`font-semibold ${activeTab === 'lost' ? 'text-white' : 'text-gray-400'}`}
            >
              Mất gần đây
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center rounded-full ${activeTab === 'found' ? 'bg-[#2A2A2D]' : 'bg-transparent'}`}
            onPress={() => setActiveTab('found')}
          >
            <Text
              className={`font-semibold ${activeTab === 'found' ? 'text-white' : 'text-gray-400'}`}
            >
              Nhặt được
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <HomeItemCard key={item.id} item={item} onPress={() => onSelectItem(item.id)} />
            ))
          ) : (
            <View className="py-8 items-center justify-center">
              <Text className="text-gray-500">Không có dữ liệu</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Floating Scan Button */}
      <View className="absolute bottom-6 right-6 pointer-events-box-none">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onScanPress}
          className="w-14 h-14 bg-[#6C63FF] rounded-full items-center justify-center shadow-[0_4px_16px_rgba(108,99,255,0.4)]"
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
