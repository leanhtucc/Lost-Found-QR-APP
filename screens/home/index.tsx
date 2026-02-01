/**
 * HomeScreen
 * Màn hình chính hiển thị danh sách tài sản của người dùng
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { Item, ItemCategory } from '@/types/item';
import {
  Header,
  HeroBanner,
  StatsCard,
  ScannerButton,
  SearchBar,
  ItemCard,
  EmptyState,
  AddItemModal,
  FloatingButton,
  FilterType,
} from './components';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

// Mock data - sẽ thay bằng API call sau
const MOCK_ITEMS: Item[] = [
  {
    id: 'QR001234',
    name: 'Laptop Dell Vostro 14',
    category: 'laptop',
    isLost: false,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'QR005678',
    name: 'Ví da màu nâu',
    category: 'wallet',
    isLost: true,
    createdAt: new Date('2025-01-20'),
  },
  {
    id: 'QR009012',
    name: 'Bộ chìa khóa nhà',
    category: 'keys',
    isLost: false,
    createdAt: new Date('2025-01-22'),
  },
  {
    id: 'QR003456',
    name: 'iPhone 15 Pro Max',
    category: 'phone',
    isLost: false,
    createdAt: new Date('2025-01-25'),
  },
];

// Mock user data
const MOCK_USER = {
  fullName: 'Nguyễn Văn A',
  studentId: 'SV001234',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();

  // State
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');

  // Computed values
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'safe' && !item.isLost) ||
        (statusFilter === 'lost' && item.isLost);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const safeCount = useMemo(() => items.filter(i => !i.isLost).length, [items]);
  const lostCount = useMemo(() => items.filter(i => i.isLost).length, [items]);

  // Handlers
  const handleSelectItem = useCallback((id: string) => {
    // TODO: Navigate to item detail screen
    console.log('Selected item:', id);
  }, []);

  const handleOpenScanner = useCallback(() => {
    // TODO: Navigate to scanner screen
    navigation.navigate('Scan' as any);
  }, [navigation]);

  const handleOpenProfile = useCallback(() => {
    // TODO: Navigate to profile screen
    console.log('Open profile');
  }, []);

  const handleOpenNotifications = useCallback(() => {
    // TODO: Navigate to notifications screen
    console.log('Open notifications');
  }, []);

  const handleAddItem = useCallback((name: string, category: ItemCategory) => {
    const newItem: Item = {
      id: `QR${Date.now().toString().slice(-6)}`,
      name,
      category,
      isLost: false,
      createdAt: new Date(),
    };
    setItems(prev => [newItem, ...prev]);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <Header
        userName={MOCK_USER.fullName}
        studentId={MOCK_USER.studentId}
        notificationCount={3}
        onNotificationPress={handleOpenNotifications}
        onProfilePress={handleOpenProfile}
      />

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <HeroBanner safeCount={safeCount} lostCount={lostCount} />

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <StatsCard count={safeCount} label="An toàn" type="safe" delay={100} />
          <StatsCard count={lostCount} label="Đang mất" type="lost" delay={150} />
        </View>

        {/* Scanner Button */}
        <ScannerButton onPress={handleOpenScanner} />

        {/* Search Bar */}
        <SearchBar
          onSearch={setSearchQuery}
          onFilterChange={setStatusFilter}
          placeholder="Tìm kiếm tài sản..."
        />

        {/* Items Section Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-bold text-lg text-gray-900">Tài sản của bạn</Text>
          <Text className="text-sm text-gray-500">
            {filteredItems.length} / {items.length} món
          </Text>
        </View>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <View>
            {filteredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => handleSelectItem(item.id)}
              />
            ))}
          </View>
        ) : items.length > 0 ? (
          <EmptyState type="no-results" />
        ) : (
          <EmptyState type="no-items" />
        )}

        {/* Bottom spacing for FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingButton onPress={() => setShowAddModal(true)} />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
