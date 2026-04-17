/**
 * Item Detail Screen
 * Màn hình chi tiết món đồ với QR code và quản lý trạng thái
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Item, ItemStatus } from '@/types/item';
import { itemsApi } from '@/services/items';
import { ItemDetailHeader, ItemInfoCard, QRCodeCard, LostModeCard } from './components';

export default function ItemDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId } = route.params as { itemId: string };

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadItem = React.useCallback(async () => {
    try {
      const data = await itemsApi.getItemById(itemId);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin món đồ');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleToggleLost = async () => {
    if (!item) return;

    try {
      const isLostLike = item.status === 'LOST' || item.status === 'PENDING_PAYMENT';
      const newStatus: ItemStatus = isLostLike ? 'SAFE' : 'LOST';
      const updatedItem = await itemsApi.updateStatus(item.id, {
        status: newStatus,
        lostMessage: newStatus === 'LOST' ? item.lostMessage : undefined,
      });

      // Update local state
      setItem(updatedItem);
    } catch (error) {
      console.error('Error toggling lost status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdateMessage = async (message: string) => {
    if (!item) return;

    try {
      const nextStatus: ItemStatus = item.status === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' : 'LOST';
      const updatedItem = await itemsApi.updateStatus(item.id, {
        status: nextStatus,
        lostMessage: message,
      });

      // Update local state
      setItem(updatedItem);
    } catch (error) {
      console.error('Error updating message:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật tin nhắn');
    }
  };

  const handleDelete = async () => {
    try {
      await itemsApi.deleteItem(itemId);
      Alert.alert('Thành công', 'Đã xóa món đồ', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Lỗi', 'Không thể xóa món đồ');
    }
  };

  const handleOpenChat = () => {
    // TODO: Navigate to chat screen
    // navigation.navigate('ChatScreen', { itemId: item.id });
    Alert.alert('Thông báo', 'Tính năng chat đang được phát triển');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <ItemDetailHeader itemId={itemId} onDelete={handleDelete} />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          {/* Loading state could be added here */}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ItemDetailHeader itemId={itemId} onDelete={handleDelete} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Info */}
        <ItemInfoCard item={item} />

        {/* QR Code */}
        <QRCodeCard itemId={item.id} itemName={item.name} />

        {/* Lost Mode */}
        <LostModeCard
          item={item}
          onToggleLost={handleToggleLost}
          onUpdateMessage={handleUpdateMessage}
          onOpenChat={handleOpenChat}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
