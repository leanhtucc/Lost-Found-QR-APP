/**
 * Profile Screen
 * Màn hình profile with trust metrics và thông tin user chuyên nghiệp
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi } from '@/services/auth';
import { itemsApi } from '@/services/items';
import type { Item } from '@/types/item';
import {
  ProfileHeader,
  TrustMetricsCard,
  StatsCard,
  UserInfoCard,
  SettingsCard,
  LogoutButton,
} from './components';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, setUser } = useAuthContext();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user items
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadProfile(), loadItems()]);
  };

  const loadProfile = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadItems = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await itemsApi.getItems();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách vật phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const lostItems = items.filter(i => i.status === 'lost').length;
    const safeItems = items.filter(i => i.status === 'safe').length;

    return { totalItems, lostItems, safeItems };
  }, [items]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };

  const handleNavigate = (screen: string) => {
    Alert.alert('Thông báo', `Tính năng ${screen} đang được phát triển`);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Vui lòng đăng nhập</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header with Cover & Verified Badge */}
      <ProfileHeader
        userName={user?.displayName || 'User'}
        userEmail={user?.email || user?.memberId || user?.uid || ''}
        userAvatar={user?.photoURL}
        isVerified={user?.isVerified}
        onBack={handleBack}
      />

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 24, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
      >
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-gray-500 mt-4">Đang tải...</Text>
          </View>
        ) : (
          <>
            {/* Trust Metrics - NEW */}
            <TrustMetricsCard
              trustScore={user?.trustScore || 0}
              totalReturned={user?.totalReturned || 0}
            />

            {/* Stats */}
            <StatsCard
              totalItems={stats.totalItems}
              safeItems={stats.safeItems}
              lostItems={stats.lostItems}
            />

            {/* User Info */}
            <UserInfoCard
              fullName={user?.displayName || 'N/A'}
              memberId={user?.memberId || user?.uid || 'N/A'}
              email={user?.email || 'N/A'}
              phone={user?.phoneNumber || 'Chưa cập nhật'}
              address={user?.address}
              bio={user?.bio}
            />

            {/* Settings */}
            <SettingsCard onNavigate={handleNavigate} />

            {/* Logout */}
            <LogoutButton onLogout={handleLogout} />

            {/* Footer */}
            <View className="py-4">
              <Text className="text-center text-xs text-gray-400">Lost & Found v2.0.0</Text>
              <Text className="text-center text-xs text-gray-400 mt-1">
                Professional Lost & Found Platform
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
