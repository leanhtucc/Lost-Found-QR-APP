import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { Item } from '@/types/item';
import { useItemsFilter, StatusFilterType } from './hooks/useItemsFilter';
import { MyItemsHeader } from './components/MyItemsHeader';
import { SummaryCards } from './components/SummaryCards';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { ItemsList } from './components/ItemsList';
import {
  MY_ITEMS_COLORS,
  MY_ITEMS_PRIMARY_GRADIENT,
  MY_ITEMS_RADIUS,
  MY_ITEMS_SHADOW,
} from './constants/ui';

type RootStackParamList = {
  ItemDetails: { itemId: string };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const MyItemsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { items, summary, loadItems } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Item['category'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const reportFabBottom = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

  const { filteredItems } = useItemsFilter({
    items,
    searchQuery,
    categoryFilter,
  });

  useEffect(() => {
    const apiStatus = statusFilter === 'safe' ? 'SAFE' : statusFilter === 'lost' ? 'LOST' : 'all';
    void loadItems(apiStatus, true, { enableRetry: true });
  }, [statusFilter, loadItems]);

  const handleSelectItem = (itemId: string) => {
    navigation.navigate('ItemDetails', { itemId });
  };

  const handleAddItem = () => {
    // TODO: Navigate to add item screen or open modal
    console.log('Add item');
  };

  const handleReportLost = () => {
    navigation.navigate('ReportItems');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['rgba(108, 76, 241, 0.34)', 'rgba(108, 76, 241, 0.12)', 'rgba(14, 14, 19, 0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.heroGlow}
      />

      <MyItemsHeader totalItems={summary?.totalItems || 0} onAddClick={handleAddItem} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SummaryCards
          totalItems={summary?.totalItems || 0}
          safeCount={summary?.safeItems || 0}
          lostCount={summary?.lostItems || 0}
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

      <View pointerEvents="box-none" style={[styles.reportFabWrap, { bottom: reportFabBottom }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleReportLost}
          style={styles.reportFabTouch}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleReportLost}
            className="h-16 w-16 items-center justify-center rounded-2xl bg-[#c7bfff] shadow-[0_12px_36px_rgba(96,83,210,0.45)]"
          >
            <Plus size={28} color="#25008c" strokeWidth={2.4} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MY_ITEMS_COLORS.background,
  },
  heroGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 180,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: MY_ITEMS_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 132,
  },
  reportFabWrap: {
    position: 'absolute',
    right: 24,
    zIndex: 12,
  },
  reportFabTouch: {
    borderRadius: MY_ITEMS_RADIUS.card,
  },
  reportFab: {
    width: 64,
    height: 64,
    borderRadius: MY_ITEMS_RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...MY_ITEMS_SHADOW.elevated,
  },
});

export default MyItemsScreen;
