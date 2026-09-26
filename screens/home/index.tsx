import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Navigation as NavigationIcon } from 'lucide-react-native';
import * as Location from 'expo-location';
import { RootStackParamList } from '@navigation/index';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  Header,
  MapSection,
  MapSectionHandle,
  DiscoveryFilterBar,
  DiscoverySearchBar,
} from './components';
import { BottomSheetContent } from './components/BottomSheetContent';
import { useMapDiscovery } from './hooks/useMapDiscovery';
import { FIND_BACK } from '@constants/theme';
import { ReportChoiceModal } from '@/components/molecules';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const { unreadCount, refreshUnreadCount } = useNotificationContext();
  const [isReportChoiceVisible, setIsReportChoiceVisible] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    'checking' | 'granted' | 'denied' | 'disabled'
  >('checking');

  const mapSectionRef = useRef<MapSectionHandle>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['34%', '58%', '86%'], []);
  const reportFabBottom = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

  const handleFeedError = useCallback(
    (message: string) => {
      showToast({
        title: 'Khám phá',
        message,
        type: 'warning',
      });
    },
    [showToast]
  );

  const handlePartialError = useCallback(
    (message: string) => {
      showToast({
        title: 'Khám phá',
        message,
        type: 'info',
      });
    },
    [showToast]
  );

  const {
    typeFilter,
    categoryFilter,
    setTypeFilter,
    setCategoryFilter,
    mapPins,
    discoveryCards,
    myLostCount,
    nearbyCount,
    isRadarLoading,
    isRealtimeConnected,
    lastUpdatedAt,
    currentLocation,
    refreshFailed,
    handleUserLocationChange,
    refreshDiscovery,
    fetchViewportDiscovery,
    syncOnTabFocus,
  } = useMapDiscovery({
    radiusMeters: 10000,
    onError: handleFeedError,
    onPartialError: handlePartialError,
  });

  const handleSelectSearchedLocation = useCallback(
    (coords: { latitude: number; longitude: number; address: string }) => {
      mapSectionRef.current?.animateToLocation(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        400
      );
    },
    []
  );

  const handleRequestLocation = useCallback(async () => {
    try {
      if (locationPermissionStatus === 'disabled') {
        await Location.enableNetworkProviderAsync().catch(() => null);
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionStatus('granted');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        handleUserLocationChange(pos.coords);
      } else {
        setLocationPermissionStatus('denied');
        Linking.openSettings();
      }
    } catch {
      Linking.openSettings();
    }
  }, [handleUserLocationChange, locationPermissionStatus]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const cardsPreview = discoveryCards.slice(0, 5).map(card => ({
      discoveryKey: card.discoveryKey,
      rawId: card.rawId,
      source: card.source,
      name: card.name,
      isOwn: card.isOwn,
      distanceLabel: card.distanceLabel,
    }));

    const pinsPreview = mapPins.slice(0, 5).map(pin => ({
      discoveryKey: pin.discoveryKey,
      lat: pin.lat,
      lng: pin.lng,
      isOwn: pin.isOwn,
      source: pin.source,
    }));

    console.log('[Home] Discovery feed:', {
      cardsCount: discoveryCards.length,
      pinsCount: mapPins.length,
      typeFilter,
      categoryFilter,
      myLostCount,
      nearbyCount,
      isRadarLoading,
      lastUpdatedAt,
      cardsPreview,
      pinsPreview,
    });
  }, [
    isRadarLoading,
    lastUpdatedAt,
    discoveryCards,
    mapPins,
    myLostCount,
    nearbyCount,
    typeFilter,
    categoryFilter,
  ]);

  useFocusEffect(
    useCallback(() => {
      void syncOnTabFocus();
      void refreshUnreadCount();
    }, [refreshUnreadCount, syncOnTabFocus])
  );

  const handleSelectItem = useCallback(
    (itemKey: string) => {
      const matchedCard = discoveryCards.find(
        card =>
          card.discoveryKey === itemKey ||
          card.rawId === itemKey ||
          (card as any).itemId === itemKey
      );

      const isFound =
        matchedCard?.source === 'FOUND_REPORT' ||
        itemKey.startsWith('FOUND_REPORT:') ||
        itemKey.startsWith('found:') ||
        (matchedCard as any)?.itemId?.startsWith('found:');

      if (isFound) {
        const reportId = matchedCard?.rawId
          ? matchedCard.rawId
          : itemKey.replace(/^(FOUND_REPORT:|found:)/, '');
        navigation.navigate('FoundReportDetails', { reportId });
        return;
      }

      const itemId = matchedCard?.rawId ? matchedCard.rawId : itemKey.replace(/^LOST_ITEM:/, '');

      if (matchedCard?.isOwn === true) {
        navigation.navigate('ItemDetails', { itemId });
        return;
      }
      navigation.navigate('PublicItemDetails', { itemId });
    },
    [navigation, discoveryCards]
  );

  const handleOpenReportChoice = useCallback(() => {
    setIsReportChoiceVisible(true);
  }, []);

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

  const handleViewportChange = useCallback(
    (query: { lat: number; lng: number; radius: number }) => {
      fetchViewportDiscovery({ latitude: query.lat, longitude: query.lng }, query.radius);
    },
    [fetchViewportDiscovery]
  );

  return (
    <View style={styles.container}>
      <MapSection
        ref={mapSectionRef}
        pins={mapPins}
        cards={discoveryCards}
        onUserLocationChange={handleUserLocationChange}
        onSelectItem={handleSelectItem}
        onLocationPermissionChange={setLocationPermissionStatus}
        onViewportChange={handleViewportChange}
      />

      <LinearGradient
        colors={['rgba(10,10,15,0.96)', 'rgba(10,10,15,0.7)', 'rgba(10,10,15,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="box-none"
        className="pointer-events-box-none absolute left-0 right-0 top-0 z-10 pb-4"
      >
        <Header
          userName={user?.displayName || 'User'}
          studentId={user?.uid || ''}
          userAvatar={user?.photoURL ?? undefined}
          notificationCount={unreadCount}
          onNotificationPress={handleOpenNotifications}
          onProfilePress={handleOpenProfile}
        />
        <DiscoverySearchBar
          onSelectLocation={handleSelectSearchedLocation}
          locationBias={
            currentLocation
              ? {
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                  radius: 10000,
                }
              : undefined
          }
        />
        <DiscoveryFilterBar
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          onTypeFilterChange={setTypeFilter}
          onCategoryFilterChange={setCategoryFilter}
        />
      </LinearGradient>

      {(locationPermissionStatus === 'denied' || locationPermissionStatus === 'disabled') && (
        <View style={styles.permissionBanner}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
              <NavigationIcon size={20} color="#f43f5e" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">
                {locationPermissionStatus === 'disabled'
                  ? 'Dịch vụ vị trí (GPS) đang tắt'
                  : 'Cần quyền truy cập vị trí'}
              </Text>
              <Text className="mt-0.5 text-xs text-gray-300">
                Radar yêu cầu GPS để quét đồ thất lạc xung quanh bạn trong bán kính 10 km.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleRequestLocation}
            className="mt-3 items-center justify-center rounded-xl bg-fb-primary py-2"
          >
            <Text className="text-xs font-semibold text-white">
              {locationPermissionStatus === 'disabled' ? 'Bật dịch vụ GPS' : 'Cấp quyền vị trí'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
            cards={discoveryCards}
            typeFilter={typeFilter}
            myLostCount={myLostCount}
            nearbyCount={nearbyCount}
            isRealtimeConnected={isRealtimeConnected}
            isRadarLoading={isRadarLoading}
            hasError={refreshFailed}
            hasLocationPermission={locationPermissionStatus === 'granted'}
            onRequestLocation={handleRequestLocation}
            lastUpdatedAt={lastUpdatedAt}
            onRefresh={refreshDiscovery}
            onSelectItem={handleSelectItem}
          />
        </BottomSheetView>
      </BottomSheet>

      <View pointerEvents="box-none" style={[styles.reportFabWrap, { bottom: reportFabBottom }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenReportChoice}
          accessibilityRole="button"
          accessibilityLabel="Mở lựa chọn báo đồ"
          className="h-16 w-16 items-center justify-center rounded-2xl bg-fb-primary-light"
        >
          <Plus size={28} color={FIND_BACK.neutral} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ReportChoiceModal
        visible={isReportChoiceVisible}
        onClose={() => setIsReportChoiceVisible(false)}
        onFoundItem={() => {
          setIsReportChoiceVisible(false);
          navigation.navigate('FoundItemReport');
        }}
        onLostOwnItem={() => {
          setIsReportChoiceVisible(false);
          navigation.navigate('ReportItems');
        }}
      />
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
  permissionBanner: {
    position: 'absolute',
    top: 220,
    left: 16,
    right: 16,
    zIndex: 25,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#1c1b22',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 10,
  },
});

export default HomeScreen;
