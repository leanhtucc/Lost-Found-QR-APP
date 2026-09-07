import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { RootStackParamList } from '@navigation/index';
import { HomeLostFeedCard } from '@/types/radar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Header, MapSection } from './components';
import { BottomSheetContent } from './components/BottomSheetContent';
import { useHomeLostFeed } from './hooks/useHomeLostFeed';
import { FIND_BACK } from '@constants/theme';
import { ReportChoiceModal } from '@/components/molecules';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [isReportChoiceVisible, setIsReportChoiceVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['34%', '58%', '86%'], []);
  const reportFabBottom = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

  const handleFeedError = useCallback(
    (message: string) => {
      showToast({
        title: 'Lost Feed',
        message,
        type: 'warning',
      });
    },
    [showToast]
  );

  const {
    mapPins,
    lostFeedCards,
    myLostCount,
    nearbyCount,
    isRadarLoading,
    lastUpdatedAt,
    handleUserLocationChange,
    syncOnTabFocus,
  } = useHomeLostFeed({
    radiusMeters: 550000,
    minSyncRefreshAgeMs: 20000,
    onError: handleFeedError,
  });

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const cardsPreview = lostFeedCards.slice(0, 5).map(card => ({
      itemId: card.itemId,
      name: card.name,
      isOwn: card.isOwn,
      distanceLabel: card.distanceLabel,
    }));

    const pinsPreview = mapPins.slice(0, 5).map(pin => ({
      itemId: pin.itemId,
      lat: pin.lat,
      lng: pin.lng,
      isOwn: pin.isOwn,
    }));

    console.log('[Home] Lost feed (/api/home/lost-feed):', {
      cardsCount: lostFeedCards.length,
      pinsCount: mapPins.length,
      myLostCount,
      nearbyCount,
      isRadarLoading,
      lastUpdatedAt,
      cardsPreview,
      pinsPreview,
    });
  }, [isRadarLoading, lastUpdatedAt, lostFeedCards, mapPins, myLostCount, nearbyCount]);

  useFocusEffect(
    useCallback(() => {
      void syncOnTabFocus();
    }, [syncOnTabFocus])
  );

  const handleSelectItem = useCallback(
    (itemId: HomeLostFeedCard['itemId']) => {
      if (itemId.startsWith('found:')) {
        navigation.navigate('FoundReportDetails', { reportId: itemId.slice(6) });
        return;
      }
      navigation.navigate('ItemDetails', { itemId });
    },
    [navigation]
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

  if (isRadarLoading && lostFeedCards.length === 0) {
    return (
      <View style={styles.container}>
        <View className="flex-1 items-center justify-center bg-fb-canvas">
          <ActivityIndicator size="large" color={FIND_BACK.primary} />
          <Text className="mt-4 text-gray-400">Đang tải lost feed...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapSection
        pins={mapPins}
        cards={lostFeedCards}
        onUserLocationChange={handleUserLocationChange}
        onSelectItem={handleSelectItem}
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
          userAvatar={user?.photoURL ?? undefined}
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
            cards={lostFeedCards}
            myLostCount={myLostCount}
            nearbyCount={nearbyCount}
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
});

export default HomeScreen;
