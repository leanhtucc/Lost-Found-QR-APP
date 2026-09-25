import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChevronLeft, LocateFixed, MapPin, Navigation, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { FIND_BACK } from '@/constants/theme';
import { formatDistance, useLiveTracking } from '@/hooks/useLiveTracking';
import { useReturnSession } from '@/hooks/useReturnSession';
import { RootStackParamList } from '@/navigation';
import { useReturnStore } from '@/services/returns/store';

import { ConnectionStateBanner, ParticipantCard } from '../components';

type LiveTrackingNavProp = StackNavigationProp<RootStackParamList>;
type LiveTrackingRouteProp = RouteProp<RootStackParamList, 'LiveTracking'>;

export default function LiveTrackingScreen() {
  const navigation = useNavigation<LiveTrackingNavProp>();
  const route = useRoute<LiveTrackingRouteProp>();
  const mapRef = useRef<MapView>(null);

  const { session, currentRole, isLoading } = useReturnSession({
    sessionId: route.params.returnSessionId,
  });
  const isSubmitting = useReturnStore(state => state.isSubmitting);
  const notifyArrival = useReturnStore(state => state.notifyArrival);
  const refreshSession = useReturnStore(state => state.refreshSession);

  const meetup = session?.meetup;
  const partner = currentRole === 'OWNER' ? session?.finder : session?.owner;
  const isSelfArrived =
    currentRole === 'OWNER' ? !!session?.owner.isArrived : !!session?.finder.isArrived;
  const isPartnerArrived =
    currentRole === 'OWNER' ? !!session?.finder.isArrived : !!session?.owner.isArrived;

  const {
    myLocation,
    partnerLocation,
    isPartnerLocationStale,
    gpsState,
    connectionState,
    distanceToMeetup,
    distanceBetweenUsers,
    etaToMeetup,
    startTracking,
  } = useLiveTracking({
    enabled: Boolean(session?.capabilities.liveSharingAllowed),
    sessionId: session?.id,
    meetupLatitude: meetup?.latitude,
    meetupLongitude: meetup?.longitude,
  });

  const meetupCoords = useMemo(
    () =>
      meetup &&
      typeof meetup.latitude === 'number' &&
      typeof meetup.longitude === 'number' &&
      Number.isFinite(meetup.latitude) &&
      Number.isFinite(meetup.longitude)
        ? { latitude: meetup.latitude, longitude: meetup.longitude }
        : null,
    [meetup]
  );

  const partnerCoords = useMemo(
    () =>
      partnerLocation
        ? { latitude: partnerLocation.latitude, longitude: partnerLocation.longitude }
        : null,
    [partnerLocation]
  );

  const fitAllPoints = useCallback(() => {
    if (!meetupCoords) return;
    const coordinates = [meetupCoords];
    if (myLocation) {
      coordinates.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
    }
    if (partnerCoords) coordinates.push(partnerCoords);

    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(
        { ...meetupCoords, latitudeDelta: 0.012, longitudeDelta: 0.012 },
        350
      );
      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 150, right: 70, bottom: 330, left: 70 },
      animated: true,
    });
  }, [meetupCoords, myLocation, partnerCoords]);

  useEffect(() => {
    const timer = setTimeout(fitAllPoints, 500);
    return () => clearTimeout(timer);
  }, [fitAllPoints]);

  const handleNotifyArrival = async () => {
    if (await notifyArrival()) await refreshSession(route.params.returnSessionId);
  };

  const handleGoToHandover = () => {
    navigation.navigate('HandoverConfirm', { returnSessionId: route.params.returnSessionId });
  };

  const proximityText = partnerCoords
    ? distanceBetweenUsers !== null && distanceBetweenUsers <= 200
      ? `${partner?.displayName || 'Đối phương'} đã đến gần bạn (${formatDistance(distanceBetweenUsers)})`
      : `${partner?.displayName || 'Đối phương'} cách bạn ${formatDistance(distanceBetweenUsers)}`
    : `${partner?.displayName || 'Đối phương'} chưa chia sẻ vị trí`;

  if (isLoading && !session) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={FIND_BACK.primary} size="large" />
        <Text style={styles.loadingText}>Đang mở phiên hoàn trả...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: meetupCoords?.latitude ?? myLocation?.latitude ?? 0,
          longitude: meetupCoords?.longitude ?? myLocation?.longitude ?? 0,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        customMapStyle={DARK_GOOGLE_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
      >
        {myLocation && (
          <Marker
            coordinate={{ latitude: myLocation.latitude, longitude: myLocation.longitude }}
            title="Vị trí của bạn"
            anchor={{ x: 0.5, y: 0.55 }}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.markerHalo, styles.myMarkerHalo]}>
                <View style={[styles.markerCore, styles.myMarker]}>
                  <User size={14} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerLabelText}>Bạn</Text>
              </View>
            </View>
          </Marker>
        )}

        {partnerCoords && (
          <Marker
            coordinate={partnerCoords}
            title={partner?.displayName || 'Đối phương'}
            anchor={{ x: 0.5, y: 0.55 }}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.markerHalo, styles.partnerMarkerHalo]}>
                <View style={[styles.markerCore, styles.partnerMarker]}>
                  <User size={14} color="#07120E" />
                </View>
              </View>
              <View style={styles.markerLabel}>
                <Text style={[styles.markerLabelText, { color: FIND_BACK.secondary }]}>
                  {partner?.displayName || 'Đối phương'}
                </Text>
              </View>
            </View>
          </Marker>
        )}

        {meetupCoords && (
          <Marker coordinate={meetupCoords} title={meetup?.name || 'Điểm gặp'}>
            <View style={styles.meetupMarker}>
              <MapPin size={20} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </Marker>
        )}

        {myLocation && meetupCoords && (
          <Polyline
            coordinates={[
              { latitude: myLocation.latitude, longitude: myLocation.longitude },
              meetupCoords,
            ]}
            strokeColor={FIND_BACK.primary}
            strokeWidth={4}
          />
        )}
        {partnerCoords && meetupCoords && (
          <Polyline
            coordinates={[partnerCoords, meetupCoords]}
            strokeColor={FIND_BACK.secondary}
            strokeWidth={3}
            lineDashPattern={[7, 5]}
          />
        )}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.topArea} pointerEvents="box-none">
          <View style={styles.trackingBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backAction}
              accessibilityRole="button"
              accessibilityLabel="Quay lại chat"
            >
              <ChevronLeft size={17} color={FIND_BACK.primaryLight} />
              <Text style={styles.backText}>Quay lại chat</Text>
            </TouchableOpacity>

            <Text style={styles.trackingTitle} numberOfLines={1}>
              {isSelfArrived ? 'Bạn đã đến điểm hẹn' : 'Đang di chuyển đến...'}
            </Text>

            <View style={styles.etaPill}>
              <Navigation size={12} color={FIND_BACK.primaryLight} />
              <Text style={styles.etaText}>{etaToMeetup === '--' ? '-- phút' : etaToMeetup}</Text>
            </View>
          </View>

          <ConnectionStateBanner
            gpsState={gpsState}
            connectionState={connectionState}
            isPartnerLocationStale={isPartnerLocationStale}
            onRetryGps={startTracking}
          />
        </View>

        <View style={styles.proximityBubble} pointerEvents="none">
          <Text style={styles.proximityText} numberOfLines={2}>
            {proximityText}
          </Text>
        </View>

        <TouchableOpacity
          onPress={fitAllPoints}
          style={styles.recenterButton}
          accessibilityRole="button"
          accessibilityLabel="Căn giữa bản đồ"
        >
          <LocateFixed size={20} color={FIND_BACK.primaryLight} />
        </TouchableOpacity>

        {partner && session && (
          <View style={styles.bottomArea}>
            <ParticipantCard
              partner={partner}
              meetupAddress={meetup?.address || 'Điểm hẹn đã thống nhất'}
              meetupName={meetup?.name}
              meetupLatitude={meetupCoords?.latitude}
              meetupLongitude={meetupCoords?.longitude}
              directionsAllowed={Boolean(session.capabilities.directionsAllowed && meetupCoords)}
              distanceToMeetup={distanceToMeetup}
              etaToMeetup={etaToMeetup}
              isPartnerStale={isPartnerLocationStale}
              itemName={session.itemName}
              itemImageUrl={session.itemImageUrl}
              rewardAmount={session.rewardAmount}
              status={session.status}
              isSelfArrived={isSelfArrived}
              isPartnerArrived={isPartnerArrived}
              onBackToChat={() => navigation.goBack()}
              onNotifyArrival={handleNotifyArrival}
              onGoToHandover={handleGoToHandover}
              isLoading={isSubmitting}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: FIND_BACK.canvas },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: FIND_BACK.canvas,
  },
  loadingText: { color: FIND_BACK.mutedText, fontSize: 13 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topArea: { paddingHorizontal: 12, paddingTop: 8 },
  trackingBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.returnFlow.mapOverlay,
    paddingHorizontal: 12,
  },
  backAction: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  backText: { color: FIND_BACK.primaryLight, fontSize: 11, fontWeight: '700' },
  trackingTitle: {
    flex: 1,
    marginHorizontal: 8,
    color: FIND_BACK.bodyText,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 106, 246, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  etaText: { color: FIND_BACK.primaryLight, fontSize: 10, fontWeight: '700' },
  proximityBubble: {
    position: 'absolute',
    top: 124,
    right: 18,
    maxWidth: 190,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.28)',
    backgroundColor: FIND_BACK.returnFlow.mapOverlay,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  proximityText: { color: FIND_BACK.bodyText, fontSize: 11, fontWeight: '700' },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 320,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    backgroundColor: FIND_BACK.returnFlow.mapOverlay,
  },
  bottomArea: { paddingHorizontal: 12, paddingBottom: 8 },
  markerWrap: { alignItems: 'center' },
  markerHalo: { padding: 7, borderRadius: 999 },
  myMarkerHalo: { backgroundColor: 'rgba(124, 106, 246, 0.25)' },
  partnerMarkerHalo: { backgroundColor: 'rgba(46, 204, 139, 0.2)' },
  markerCore: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  myMarker: { backgroundColor: FIND_BACK.primary },
  partnerMarker: { backgroundColor: FIND_BACK.secondary, borderColor: '#07120E' },
  markerLabel: {
    marginTop: 2,
    maxWidth: 110,
    borderRadius: 6,
    backgroundColor: FIND_BACK.returnFlow.mapOverlay,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  markerLabelText: { color: FIND_BACK.bodyText, fontSize: 9, fontWeight: '700' },
  meetupMarker: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: FIND_BACK.tertiary,
  },
});
