/**
 * Item Detail Screen
 * Màn hình chi tiết món đồ với QR code và quản lý trạng thái
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Item } from '@/types/item';
import { itemsApi, ItemsApiError } from '@/services/items';
import { ItemDetailHeader, ItemInfoCard, QRCodeCard, LostModeCard } from './components';
import { FIND_BACK } from '@constants/theme';

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

    if (item.status !== 'SAFE' && item.status !== 'LOST') {
      Alert.alert('Không thể đổi trạng thái', `Trạng thái ${item.status} do hệ thống quản lý.`);
      return;
    }

    try {
      const newStatus: 'SAFE' | 'LOST' = item.status === 'LOST' ? 'SAFE' : 'LOST';
      const updatedItem = await itemsApi.updateStatus(item.id, {
        status: newStatus,
        lostMessage: newStatus === 'LOST' ? item.lostMessage : undefined,
      });

      // Update local state
      setItem(updatedItem);
    } catch (error) {
      console.error('Error toggling lost status:', error);
      if (
        error instanceof ItemsApiError &&
        (error.status === 409 || error.code === 'ITEM_NOT_ELIGIBLE')
      ) {
        await loadItem();
        Alert.alert(
          'Vật dụng không còn đủ điều kiện',
          'Vật dụng đã thay đổi trạng thái hoặc đang có Guardian report mở.'
        );
        return;
      }

      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdateMessage = async (message: string) => {
    if (!item) return;

    if (item.status !== 'LOST') {
      Alert.alert('Không thể cập nhật', 'Chỉ vật dụng đang LOST mới có thể cập nhật lời nhắn.');
      return;
    }

    try {
      const updatedItem = await itemsApi.updateStatus(item.id, {
        status: 'LOST',
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
      <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
        <ItemDetailHeader itemId={itemId} onDelete={handleDelete} />
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={FIND_BACK.primary} />
          <Text className="mt-4 text-sm text-fb-muted">Đang tải thông tin món đồ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
      <ItemDetailHeader itemId={itemId} onDelete={handleDelete} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
