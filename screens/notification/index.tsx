/**
 * Notifications Screen
 * Màn hình hiển thị danh sách thông báo với Stream Chat API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { Notification } from '@/types/notification';
import { getNotifications, markAllNotificationsAsRead } from '@/services/notifications';
import { FIND_BACK } from '@constants/theme';
import { NotificationHeader, NotificationCard, EmptyState, LoadingState } from './components';
import { getMockNotifications } from './utils';

type NotificationNavigationProp = StackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadTotal);
    } catch (error) {
      console.error('Error loading notifications:', error);

      // Kiểm tra nếu là lỗi authentication
      if (error instanceof Error && error.message.includes('login again')) {
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.', [
          {
            text: 'Đăng nhập',
            onPress: () => {
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]);
        return;
      }

      // Fallback to mock data if API fails
      console.log('Using mock data for demo');
      const mockData = getMockNotifications();
      setNotifications(mockData);
      setUnreadCount(mockData.filter(n => !n.isRead).length);
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Optimistic update - mark as read locally
    if (!notification.isRead) {
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // TODO: Navigate to item detail or open message
      // navigation.navigate('ItemDetail', { itemId: notification.item?.id });
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Call API
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Revert on error
      await loadNotifications();
    }
  }, [loadNotifications]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <NotificationHeader unreadCount={unreadCount} onMarkAllRead={handleMarkAllAsRead} />

      {isLoading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[FIND_BACK.primary]}
              tintColor={FIND_BACK.primary}
            />
          }
        >
          {notifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index}
              onPress={() => handleNotificationPress(notification)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
