import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@navigation/index';
import BottomSheet from '@gorhom/bottom-sheet';
import { DashboardData } from '@/types/item';
import { itemsApi } from '@/services/items';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Header, MapSection, BottomSheetContent } from './components';
import { FIND_BACK } from '@constants/theme';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%', '85%'], []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
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
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSelectItem = useCallback(
    (itemId: string) => {
      navigation.navigate('ItemDetails', { itemId });
    },
    [navigation]
  );

  const handleOpenScanner = useCallback(() => {
    navigation.navigate('Scan' as any);
  }, [navigation]);

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleOpenNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  if (loading && !dashboardData) {
    return (
      <View style={styles.container}>
        <View className="flex-1 items-center justify-center bg-gray-900">
          <ActivityIndicator size="large" color={FIND_BACK.primary} />
          <Text className="mt-4 text-gray-400">Đang tải bản đồ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapSection dashboardData={dashboardData} />

      {/* Header Overlay */}
      <View className="absolute top-12 left-0 right-0 z-10 pointer-events-box-none px-4">
        <Header
          userName={user?.displayName || 'User'}
          studentId={user?.uid || ''}
          userAvatar={user?.photoURL}
          notificationCount={0}
          onNotificationPress={handleOpenNotifications}
          onProfilePress={handleOpenProfile}
        />
      </View>

      {/* Bottom Sheet Overlay */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        handleIndicatorStyle={{ backgroundColor: FIND_BACK.surfaceElevated, width: 40, height: 4 }}
      >
        <BottomSheetContent
          items={dashboardData?.items || []}
          onSelectItem={handleSelectItem}
          onScanPress={handleOpenScanner}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
});

export default HomeScreen;
