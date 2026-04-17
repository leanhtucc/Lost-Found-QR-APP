import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi } from '@/services/auth';
import { itemsApi } from '@/services/items';
import type { Item } from '@/types/item';
import { FIND_BACK } from '@constants/theme';
import {
  LogoutButton,
  ProfileHeader,
  SettingsCard,
  StatsCard,
  TrustMetricsCard,
  UserInfoCard,
} from './components';

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return 'Thành viên từ Tháng 10, 2023';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Thành viên từ Tháng 10, 2023';
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `Thành viên từ Tháng ${month}, ${year}`;
}

function getShortMemberId(memberId?: string, uid?: string) {
  const source = memberId || uid || 'A3F2';
  const normalized = source
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase();
  return `#${normalized || 'A3F2'}`;
}

function mapTrustToRating(trustScore = 0) {
  const safeScore = Math.max(0, Math.min(trustScore, 100));
  return Number((3.8 + (safeScore / 100) * 1.2).toFixed(1));
}

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthContext();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) setUser(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [setUser]);

  const loadItems = useCallback(async (isRef = false) => {
    try {
      if (!isRef) setLoading(true);
      const data = await itemsApi.getItems();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách vật phẩm');
    } finally {
      if (!isRef) setLoading(false);
      if (isRef) setRefreshing(false);
    }
  }, []);

  const loadData = useCallback(
    async (isRef = false) => {
      await Promise.all([loadProfile(), loadItems(isRef)]);
    },
    [loadProfile, loadItems]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
  };

  const stats = useMemo(
    () => ({
      totalItems: items.length,
      safeItems: items.filter(i => i.status === 'SAFE').length,
      lostItems: items.filter(i => i.status === 'LOST' || i.status === 'PENDING_PAYMENT').length,
    }),
    [items]
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };

  const handleNavigate = (screen: string) => {
    Alert.alert('Thông báo', `Tính năng ${screen} đang được phát triển`);
  };

  const memberSinceText = useMemo(() => formatMemberSince(user?.createdAt), [user?.createdAt]);
  const shortMemberId = useMemo(() => getShortMemberId(user?.memberId, user?.uid), [user]);
  const ratingValue = useMemo(() => mapTrustToRating(user?.trustScore), [user?.trustScore]);
  const transactions = useMemo(
    () => Math.max(user?.totalReturned || 0, stats.safeItems),
    [stats.safeItems, user?.totalReturned]
  );

  const showKycVerified = Boolean(user?.isVerified);

  const handleLogoutPress = () => {
    Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-fb-neutral">
        <Text className="text-fb-muted">Vui lòng đăng nhập</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral" edges={['top']}>
      <View className="flex-1 bg-fb-neutral">
        <ProfileHeader
          onMenuPress={() => handleNavigate('Menu')}
          onSettingsPress={() => handleNavigate('Cài đặt')}
        />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 16, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[FIND_BACK.primary]}
              tintColor={FIND_BACK.primary}
            />
          }
        >
          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={FIND_BACK.primary} />
              <Text className="mt-4 text-fb-muted">Đang tải...</Text>
            </View>
          ) : (
            <>
              <TrustMetricsCard
                userName={user.displayName || 'Người dùng'}
                memberId={shortMemberId}
                memberSince={memberSinceText}
                userAvatar={user.photoURL}
                rating={ratingValue}
                transactions={transactions}
                isVerified={Boolean(user.isVerified)}
              />
              <StatsCard
                totalItems={stats.totalItems}
                foundItems={stats.safeItems}
                returnedItems={user.totalReturned || 0}
              />
              <UserInfoCard
                isVerified={showKycVerified}
                onPersonalInfoPress={() => handleNavigate('Thông tin cá nhân')}
                onChangePasswordPress={() => handleNavigate('Đổi mật khẩu')}
                onKycPress={() => handleNavigate('KYC')}
              />
              <SettingsCard
                pushNotifications={pushNotificationsEnabled}
                emailNotifications={emailNotificationsEnabled}
                onPushNotificationsChange={setPushNotificationsEnabled}
                onEmailNotificationsChange={setEmailNotificationsEnabled}
                onNotificationRadiusPress={() => handleNavigate('Bán kính thông báo')}
                onLanguagePress={() => handleNavigate('Ngôn ngữ')}
                onTermsPress={() => handleNavigate('Điều khoản dịch vụ')}
                onPrivacyPress={() => handleNavigate('Chính sách bảo mật')}
              />
              <LogoutButton onPress={handleLogoutPress} />
              <View className="pb-2 pt-6">
                <Text className="text-center text-xs text-fb-label">FindBack v1.0.0</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
