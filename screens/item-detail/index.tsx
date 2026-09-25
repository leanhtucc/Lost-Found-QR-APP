/**
 * Item Detail Screen
 * Màn hình chi tiết món đồ với QR code và quản lý trạng thái
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Item } from '@/types/item';
import * as Location from 'expo-location';
import { itemsApi, ItemsApiError } from '@/services/items';
import { ItemDetailHeader, ItemInfoCard, QRCodeCard, LostModeCard } from './components';
import { LoadingState, ErrorState } from '@/components/atoms';

export default function ItemDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId } = route.params as { itemId: string };

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadItem = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await itemsApi.getItemById(itemId);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      setErrorMessage('Không thể tải thông tin món đồ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

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
      if (item.status === 'SAFE') {
        // SAFE -> LOST: Bắt buộc phải có latitude và longitude khi báo mất
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'Quyền vị trí bị từ chối',
            'Bắt buộc phải có tọa độ GPS để bật chế độ báo mất trên Radar.'
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let lostAddress: string | undefined;
        try {
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (geo) {
            lostAddress = [geo.name, geo.streetNumber, geo.street, geo.district, geo.city]
              .filter(Boolean)
              .join(', ');
          }
        } catch {
          // ignore geocode error
        }

        const updatedItem = await itemsApi.updateStatus(item.id, {
          status: 'LOST',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          lostMessage: item.lostMessage || undefined,
          lostAddress,
        });

        setItem(updatedItem);
        Alert.alert('Thành công', 'Đã chuyển trạng thái sang báo mất và phát tín hiệu Radar.');
      } else {
        // LOST -> SAFE: Chỉ cần gửi status SAFE (server tự động hủy escrow và gỡ marker radar)
        const updatedItem = await itemsApi.updateStatus(item.id, {
          status: 'SAFE',
        });

        setItem(updatedItem);
        Alert.alert('Thành công', 'Đã đánh dấu an toàn. Radar đã gỡ vật phẩm này.');
      }
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
      let lat: number | undefined;
      let lng: number | undefined;

      if (typeof item.lastSeenLocation === 'object' && item.lastSeenLocation?.lat) {
        lat = item.lastSeenLocation.lat;
        lng = item.lastSeenLocation.lng;
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        }).catch(() => null);
        if (loc) {
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        Alert.alert('Lỗi', 'Không thể xác định tọa độ hiện tại để cập nhật.');
        return;
      }

      const updatedItem = await itemsApi.updateStatus(item.id, {
        status: 'LOST',
        lostMessage: message,
        latitude: lat,
        longitude: lng,
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
        <LoadingState message="Đang tải thông tin món đồ..." />
      </SafeAreaView>
    );
  }

  if (errorMessage || !item) {
    return (
      <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
        <ItemDetailHeader itemId={itemId} onDelete={handleDelete} />
        <ErrorState
          message={errorMessage || 'Không tìm thấy thông tin món đồ này.'}
          onRetry={loadItem}
          secondaryActionTitle="Quay lại"
          onSecondaryAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
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

        {/* Lost Mode & Status Actions */}
        <LostModeCard
          item={item}
          onToggleLost={handleToggleLost}
          onUpdateMessage={handleUpdateMessage}
          onOpenChat={handleOpenChat}
        />

        {/* QR Code Identity */}
        <QRCodeCard itemId={item.qrCodeId || item.itemId || item.id} itemName={item.name} />
      </ScrollView>
    </SafeAreaView>
  );
}
