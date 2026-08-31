import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import { useAuthContext } from '@/contexts/AuthContext';
import { authApi } from '@/services/auth';
import type { ProfilePreferences } from '@/services/auth/types';
import type { RootStackParamList } from '@/navigation';
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

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthContext();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) setUser(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [setUser]);

  const loadData = useCallback(
    async (isRef = false) => {
      if (!isRef) setLoading(true);
      await loadProfile();
      setLoading(false);
      if (isRef) setRefreshing(false);
    },
    [loadProfile]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };

  const memberSinceText = useMemo(() => formatMemberSince(user?.createdAt), [user?.createdAt]);
  const shortMemberId = useMemo(() => getShortMemberId(user?.memberId, user?.uid), [user]);

  const updatePreference = async <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K]
  ) => {
    if (!user?.preferences) return;
    const previous = user.preferences;
    setUser({ ...user, preferences: { ...previous, [key]: value } });
    const response = await authApi.updatePreferences({ [key]: value });
    if (!response.success || !response.data) {
      setUser({ ...user, preferences: previous });
      Alert.alert('Không thể cập nhật', response.message || 'Vui lòng thử lại.');
      return;
    }
    setUser({ ...user, preferences: response.data });
  };

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
          onMenuPress={() => navigation.navigate('MyItems')}
          onSettingsPress={() => navigation.navigate('NotificationSettings')}
        />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 }}
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
                userAvatar={user.photoURL ?? undefined}
                trustScore={user.trust?.score ?? 0}
                trustLevel={user.trust?.level ?? 'BRONZE'}
                completedReturns={user.trust?.completedReturns ?? 0}
                isVerified={Boolean(user.trust?.isVerified)}
              />
              <StatsCard
                protectedItems={user.stats?.protectedItems ?? 0}
                safeItems={user.stats?.safeItems ?? 0}
                lostItems={user.stats?.lostItems ?? 0}
              />
              <UserInfoCard
                onPersonalInfoPress={() => navigation.navigate('EditProfile')}
                onMyItemsPress={() => navigation.navigate('MyItems')}
                onNotificationsPress={() => navigation.navigate('Notifications')}
                onChangePasswordPress={
                  user.authProvider === 'password'
                    ? () => navigation.navigate('ChangePassword')
                    : undefined
                }
                onDeleteAccountPress={() => navigation.navigate('DeleteAccount')}
              />
              <SettingsCard
                pushNotifications={user.preferences?.pushEnabled ?? true}
                emailNotifications={user.preferences?.emailEnabled ?? false}
                proximityNotifications={user.preferences?.proximityEnabled ?? true}
                onPushNotificationsChange={value => void updatePreference('pushEnabled', value)}
                onEmailNotificationsChange={value => void updatePreference('emailEnabled', value)}
                onProximityNotificationsChange={value =>
                  void updatePreference('proximityEnabled', value)
                }
                onNotificationRadiusPress={() => navigation.navigate('NotificationSettings')}
                onLanguagePress={() => navigation.navigate('NotificationSettings')}
                onTermsPress={() =>
                  Alert.alert('Điều khoản dịch vụ', 'Nội dung đang được cập nhật.')
                }
                onPrivacyPress={() =>
                  Alert.alert('Chính sách bảo mật', 'Nội dung đang được cập nhật.')
                }
                languageLabel={user.preferences?.language === 'en' ? 'English' : 'Tiếng Việt'}
                notificationRadiusLabel={`${(user.preferences?.notificationRadiusMeters ?? 3000) / 1000}km`}
                versionLabel={Constants.expoConfig?.version || '1.0.0'}
              />
              <LogoutButton onPress={handleLogoutPress} />
              <View className="pb-2 pt-6">
                <Text className="text-center text-xs text-fb-label">
                  FindBack v{Constants.expoConfig?.version || '1.0.0'}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
