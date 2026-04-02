/**
 * HomeScreen
 * Màn hình chính hiển thị danh sách tài sản của người dùng
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView, Text, StatusBar, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { Item, ItemCategory, DashboardData } from '@/types/item';
import { itemsApi } from '@/services/items';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Header,
  StatisticsCard,
  ScannerButton,
  SearchBar,
  ItemCard,
  EmptyState,
  AddItemModal,
  FloatingButton,
  FilterType,
} from './components';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  // State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');

  // Load dashboard data
  const loadDashboardData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);

        const data = await itemsApi.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast({
          title: 'Lỗi',
          message: error instanceof Error ? error.message : 'Không thể tải dữ liệu',
          type: 'error',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(false);
  }, [loadDashboardData]);

  // Computed values
  const filteredItems = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.items.filter(item => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'safe' && item.status === 'safe') ||
        (statusFilter === 'lost' && item.status === 'lost');

      return matchesSearch && matchesStatus;
    });
  }, [dashboardData, searchQuery, statusFilter]);

  // Get last added date
  const lastAddedDate = useMemo(() => {
    if (!dashboardData || dashboardData.items.length === 0) return undefined;

    const sortedItems = [...dashboardData.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedItems[0].createdAt;
  }, [dashboardData]);

  // Handlers
  const handleSelectItem = useCallback(
    (itemId: string) => {
      navigation.navigate('ItemDetails', { itemId });
    },
    [navigation]
  );

  const handleItemMenu = useCallback((itemId: string) => {
    // TODO: Show item action menu (Edit, Delete, Report Lost, etc.)
    console.log('Show menu for item:', itemId);
  }, []);

  const handleOpenScanner = useCallback(() => {
    navigation.navigate('Scan' as any);
  }, [navigation]);

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleOpenNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleAddItem = useCallback(
    async (name: string, category: ItemCategory) => {
      try {
        setLoading(true);

        await itemsApi.createItem({
          name,
          category,
        });

        showToast({
          title: 'Thành công',
          message: 'Thêm vật phẩm thành công!',
          type: 'success',
        });

        // Reload dashboard data
        await loadDashboardData(false);
      } catch (error) {
        console.error('Failed to add item:', error);
        showToast({
          title: 'Lỗi',
          message: error instanceof Error ? error.message : 'Không thể thêm vật phẩm',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [showToast, loadDashboardData]
  );

  // Loading state
  if (loading && !dashboardData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Header
          userName={user?.displayName || 'User'}
          studentId={user?.uid || ''}
          userAvatar={user?.photoURL}
          notificationCount={0}
          onNotificationPress={handleOpenNotifications}
          onProfilePress={handleOpenProfile}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-500">Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <Header
        userName={user?.displayName || 'User'}
        studentId={user?.uid || ''}
        userAvatar={user?.photoURL}
        notificationCount={0}
        onNotificationPress={handleOpenNotifications}
        onProfilePress={handleOpenProfile}
      />

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Statistics Card */}
        {dashboardData && (
          <StatisticsCard
            safeCount={dashboardData.safeCount}
            lostCount={dashboardData.lostCount}
            totalCount={dashboardData.total}
            lastAdded={lastAddedDate}
          />
        )}

        {/* Scanner Button */}
        <View className="px-4 mt-2">
          <ScannerButton onPress={handleOpenScanner} />
        </View>

        {/* Search Bar */}
        <View className="px-4 mt-4">
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setStatusFilter}
            placeholder="Tìm kiếm tài sản..."
          />
        </View>

        {/* Items Section Header */}
        <View className="flex-row items-center justify-between px-4 mt-6 mb-3">
          <Text className="font-bold text-lg text-gray-900">Tài sản của bạn</Text>
          <Text className="text-sm text-gray-500">
            {filteredItems.length} / {dashboardData?.total || 0} món
          </Text>
        </View>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <View className="pb-6">
            {filteredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => handleSelectItem(item.id)}
                onMenuPress={() => handleItemMenu(item.id)}
              />
            ))}
          </View>
        ) : dashboardData && dashboardData.total > 0 ? (
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
