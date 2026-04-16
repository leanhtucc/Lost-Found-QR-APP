import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { DashboardData, Item } from '@/types/item';
import { RadarLostItem } from '@/types/radar';
import { itemsApi } from '@/services/items';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Header, MapSection } from './components';
import { BottomSheetContent } from './components/BottomSheetContent';
import { useLiveRadar } from './hooks/useLiveRadar';
import { FIND_BACK } from '@constants/theme';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [myLostItems, setMyLostItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['34%', '58%', '86%'], []);
  const reportFabBottom = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[Home] Dashboard items:', dashboardData?.items?.length ?? 0);
  }, [dashboardData]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[Home] My lost items (/api/items?status=lost):', myLostItems.length);
  }, [myLostItems.length]);

  const handleRadarError = useCallback(
    (message: string) => {
      showToast({
        title: 'Live Radar',
        message,
        type: 'warning',
      });
    },
    [showToast]
  );

  const handleNewRadarItem = useCallback(
    (item: RadarLostItem) => {
      showToast({
        title: 'Live Radar',
        message: `Có đồ mới gần bạn: ${item.name}`,
        type: 'info',
      });
    },
    [showToast]
  );

  const {
    radarItems,
    isRadarLoading,
    isRealtimeConnected,
    lastUpdatedAt,
    handleUserLocationChange,
    syncOnTabFocus,
  } = useLiveRadar({
    nearbyRadiusMeters: 5000,
    subscribeRadiusMeters: 3000,
    heartbeatIntervalMs: 30000,
    minSyncRefreshAgeMs: 20000,
    onError: handleRadarError,
    onNewLostItem: handleNewRadarItem,
  });

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[Home] Radar items:', radarItems.length, {
      isRadarLoading,
      isRealtimeConnected,
      lastUpdatedAt,
    });
  }, [isRadarLoading, isRealtimeConnected, lastUpdatedAt, radarItems.length]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getDashboardData();
      setDashboardData(data);

      try {
        const myLostResponse = await itemsApi.getMyLostItems({ limit: 50 });
        setMyLostItems(myLostResponse.items);
      } catch (myLostError) {
        const fallbackLostItems = data.items.filter(item => item.status === 'lost');
        setMyLostItems(fallbackLostItems);

        console.warn(
          '[Home] Failed GET /api/items?status=lost, fallback to dashboard lost filter:',
          myLostError
        );
      }
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

  useFocusEffect(
    useCallback(() => {
      void syncOnTabFocus();
    }, [syncOnTabFocus])
  );

  const handleSelectItem = useCallback(
    (itemId: string) => {
      navigation.navigate('ItemDetails', { itemId });
    },
    [navigation]
  );

  const handleOpenScanner = useCallback(() => {
    navigation.navigate('Scan' as any);
  }, [navigation]);

  const handleReportLost = useCallback(() => {
    navigation.navigate('MyItems');
  }, [navigation]);

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleOpenNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleBottomSheetChange = useCallback((index: number) => {
    if (!__DEV__) {
      return;
    }

    console.log('[Home] BottomSheet index changed:', index);
  }, []);

  if (loading && !dashboardData) {
    return (
      <View style={styles.container}>
        <View className="flex-1 items-center justify-center bg-fb-canvas">
          <ActivityIndicator size="large" color={FIND_BACK.primary} />
          <Text className="mt-4 text-gray-400">Đang tải bản đồ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapSection
        radarItems={radarItems}
        isRadarLoading={isRadarLoading}
        isRealtimeConnected={isRealtimeConnected}
        lastUpdatedAt={lastUpdatedAt}
        onUserLocationChange={handleUserLocationChange}
      />

      <LinearGradient
        colors={['rgba(10,10,15,0.88)', 'rgba(10,10,15,0.4)', 'rgba(10,10,15,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        className="pointer-events-box-none absolute left-0 right-0 top-0 z-10"
      >
        <Header
          userName={user?.displayName || 'User'}
          studentId={user?.uid || ''}
          userAvatar={user?.photoURL}
          notificationCount={0}
          onNotificationPress={handleOpenNotifications}
          onProfilePress={handleOpenProfile}
        />
      </LinearGradient>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        enableOverDrag
        animateOnMount
        onChange={handleBottomSheetChange}
        failOffsetX={[-21, 20]}
        activeOffsetY={[-8, 8]}
        style={[styles.bottomSheetShadow, styles.bottomSheetLayer]}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetBody}>
          <BottomSheetContent
            items={dashboardData?.items || []}
            nearbyLostItems={radarItems}
            myLostItems={myLostItems}
            onSelectItem={handleSelectItem}
            onScanPress={handleOpenScanner}
            onReportLostPress={handleReportLost}
          />
        </BottomSheetView>
      </BottomSheet>

      <View pointerEvents="box-none" style={[styles.reportFabWrap, { bottom: reportFabBottom }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReportLost}
          className="h-16 w-16 items-center justify-center rounded-2xl bg-[#c7bfff] shadow-[0_12px_36px_rgba(96,83,210,0.45)]"
        >
          <Plus size={28} color="#25008c" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
  bottomSheetShadow: {
    shadowColor: '#06060b',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: -12 },
    shadowRadius: 20,
    elevation: 18,
  },
  bottomSheetLayer: {
    zIndex: 20,
  },
  bottomSheetBackground: {
    backgroundColor: '#131318',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomSheetBody: {
    flex: 1,
  },
  bottomSheetIndicator: {
    backgroundColor: '#5f5a70',
    width: 48,
    height: 5,
  },
  reportFabWrap: {
    position: 'absolute',
    right: 24,
    zIndex: 35,
  },
});

export default HomeScreen;
