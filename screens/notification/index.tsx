/**
 * Notifications Screen
 * Premium dark notification center — connected to /v1/notifications API
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, RefreshControl, Alert, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import { Notification, NotificationCategory } from '@/types/notification';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationAsOpened,
  resolveStoredNotificationDestination,
} from '@/services/notifications';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NotificationHeader, NotificationCard, EmptyState, LoadingState } from './components';
import { getMockNotifications, tabToCategory } from './utils';

type NotificationNavigationProp = StackNavigationProp<RootStackParamList>;

const BG = '#0B0B0C';
const PURPLE = '#8B5CF6';

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationNavigationProp>();
  const { unreadCount, refreshUnreadCount, markOneRead, markAllRead } = useNotificationContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isMountedRef = useRef(true);

  // ── Load notifications from API ──
  const loadNotifications = useCallback(
    async (category?: NotificationCategory, pageNum = 1, append = false) => {
      try {
        const data = await getNotifications({ category, page: pageNum, limit: 20 });

        if (!isMountedRef.current) return;

        if (append) {
          setNotifications(prev => [...prev, ...data.data]);
        } else {
          setNotifications(data.data);
        }

        void refreshUnreadCount();
        setPage(data.pagination.page);
        setHasMore(data.pagination.hasNextPage);
      } catch (error) {
        console.error('[NotifScreen] Error loading notifications:', error);

        if (error instanceof Error && error.message.includes('login again')) {
          Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.', [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
            },
          ]);
          return;
        }

        // Fallback to mock data
        if (!append) {
          console.log('[NotifScreen] Using mock data for demo');
          const mockData = getMockNotifications();
          setNotifications(mockData);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [navigation, refreshUnreadCount]
  );

  // ── Initial load ──
  useEffect(() => {
    isMountedRef.current = true;
    loadNotifications();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadNotifications]);

  // ── Tab change → re-fetch with category filter ──
  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      setIsLoading(true);
      setNotifications([]);
      const category = tabToCategory(tabId);
      loadNotifications(category, 1, false);
    },
    [loadNotifications]
  );

  // ── Pull-to-refresh ──
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const category = tabToCategory(activeTab);
    await loadNotifications(category, 1, false);
    setIsRefreshing(false);
  }, [activeTab, loadNotifications]);

  // ── Press notification → mark read via API + deep link ──
  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Optimistic read
      if (!notification.is_read) {
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        markOneRead();

        // Call API
        try {
          await markNotificationAsRead(notification.id);
        } catch (error) {
          console.warn('[NotifScreen] Failed to mark read:', error);
        }
      }

      // Call opened API
      try {
        await markNotificationAsOpened(notification.id);
      } catch (error) {
        console.warn('[NotifScreen] Failed to mark opened:', error);
      }

      const destination = resolveStoredNotificationDestination(notification);
      switch (destination.screen) {
        case 'ItemDetails':
          navigation.navigate('ItemDetails', destination.params);
          break;
        case 'FoundReportDetails':
          navigation.navigate('FoundReportDetails', destination.params);
          break;
        case 'Chat':
          navigation.navigate('Chat', destination.params);
          break;
        case 'ChatList':
          navigation.navigate('ChatList');
          break;
        case 'LiveTracking':
          navigation.navigate('LiveTracking', destination.params);
          break;
        case 'HandoverConfirm':
          navigation.navigate('HandoverConfirm', destination.params);
          break;
        case 'RewardStatus':
          navigation.navigate('RewardStatus', destination.params);
          break;
        default:
          navigation.navigate('Notifications');
      }
    },
    [markOneRead, navigation]
  );

  // ── Mark all as read ──
  const handleMarkAllAsRead = useCallback(async () => {
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    markAllRead();

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('[NotifScreen] Error marking all as read:', error);
      // Revert
      const category = tabToCategory(activeTab);
      await loadNotifications(category, 1, false);
    }
  }, [activeTab, loadNotifications, markAllRead]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllAsRead}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {isLoading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: BG }}
          contentContainerStyle={{ padding: 16, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[PURPLE]}
              tintColor={PURPLE}
              progressBackgroundColor={BG}
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

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
