import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { Item } from '@/types/item';
import { useItemsFilter, StatusFilterType } from './hooks/useItemsFilter';
import { MyItemsHeader } from './components/MyItemsHeader';
import { SummaryCards } from './components/SummaryCards';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { ItemsList } from './components/ItemsList';

type RootStackParamList = {
  ItemDetails: { itemId: string };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const MyItemsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { items } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Item['category'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  const { filteredItems, lostCount, safeCount } = useItemsFilter({
    items,
    searchQuery,
    categoryFilter,
    statusFilter,
  });

  const handleSelectItem = (itemId: string) => {
    navigation.navigate('ItemDetails', { itemId });
  };

  const handleAddItem = () => {
    // TODO: Navigate to add item screen or open modal
    console.log('Add item');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <MyItemsHeader totalItems={items.length} onAddClick={handleAddItem} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SummaryCards
          totalItems={items.length}
          safeCount={safeCount}
          lostCount={lostCount}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <CategoryFilter selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <ItemsList
          items={items}
          filteredItems={filteredItems}
          statusFilter={statusFilter}
          onSelectItem={handleSelectItem}
          onAddClick={handleAddItem}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyItemsScreen;
