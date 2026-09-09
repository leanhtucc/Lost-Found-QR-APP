import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '@/contexts/ItemsContext';
import { Item } from '@/types/item';
import { useItemsFilter, StatusFilterType } from './hooks/useItemsFilter';
import { MyItemsHeader } from './components/MyItemsHeader';
import { SummaryCards } from './components/SummaryCards';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { ItemsList } from './components/ItemsList';
import { AddItemModal, AddItemSubmitData } from './components/AddItemModal';
import { uploadApi } from '@/services/upload';
import { MY_ITEMS_COLORS } from './constants/ui';

type RootStackParamList = {
  ItemDetails: { itemId: string };
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const MyItemsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { items, loadItems, addItem } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Item['category'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const { filteredItems, lostCount, safeCount } = useItemsFilter({
    items,
    searchQuery,
    categoryFilter,
    statusFilter,
  });

  useEffect(() => {
    // Only load all items once when screen mounts (or relies on ItemsContext)
    void loadItems('all', true, { enableRetry: true });
  }, [loadItems]);

  const handleSelectItem = (itemId: string) => {
    navigation.navigate('ItemDetails', { itemId });
  };

  const handleAddItem = () => {
    setIsAddModalVisible(true);
  };

  const handleCreateProtectedItem = async (data: AddItemSubmitData) => {
    let uploadedFilename: string | undefined = data.uploadedFilename;
    let publicUrl = data.imagePublicUrl;

    // Bước 1: Nếu chưa có URL ảnh từ bước phân tích AI, thực hiện upload
    if (!publicUrl) {
      const uploadRes = await uploadApi.uploadImage(data.imageUri);
      if (!uploadRes.success || !uploadRes.data?.url) {
        throw new Error(
          uploadRes.message || 'Không thể upload ảnh lên hệ thống. Vui lòng thử lại.'
        );
      }
      publicUrl = uploadRes.data.url;
      uploadedFilename = uploadRes.data.filename;
    }

    // Bước 2: Tạo món đồ với URL ảnh và vị trí GPS
    try {
      await addItem({
        name: data.name,
        category: data.category,
        description: data.description,
        imagePublicUrl: publicUrl,
        address: data.captureLocation.address,
        latitude: data.captureLocation.latitude,
        longitude: data.captureLocation.longitude,
        captureLocation: data.captureLocation,
        lastSeenLocation: data.captureLocation.address,
      });

      Alert.alert(
        'Bảo vệ món đồ thành công',
        `"${data.name}" đã được đưa vào hệ thống bảo vệ an toàn (SAFE) với ảnh và vị trí xác thực.`
      );
    } catch (err: any) {
      // Bước 3: Nếu tạo item thất bại, dọn dẹp file ảnh rác
      if (uploadedFilename) {
        try {
          await uploadApi.deleteImage(uploadedFilename);
        } catch {
          // Cleanup log
        }
      }
      throw err;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(108, 76, 241, 0.34)', 'rgba(108, 76, 241, 0.12)', 'rgba(14, 14, 19, 0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.heroGlow}
      />

      <MyItemsHeader totalItems={items.length} onAddClick={handleAddItem} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

      <AddItemModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleCreateProtectedItem}
      />
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
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: MY_ITEMS_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
});

export default MyItemsScreen;
