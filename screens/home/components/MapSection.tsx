import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';

interface MapSectionProps {
  pins: HomeLostFeedPin[];
  cards: HomeLostFeedCard[];
  onUserLocationChange: (coords: { latitude: number; longitude: number }) => void;
}

interface MapMarkerPayload {
  itemId: string;
  latitude: number;
  longitude: number;
  isOwn: boolean;
  name?: string;
  lostMessage?: string | null;
  address?: string | null;
}

const FALLBACK_REGION = {
  latitude: 21.027763,
  longitude: 105.83416,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isDaytimeNow = (): boolean => {
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 18;
};

const formatGeocodedAddress = (address: Location.LocationGeocodedAddress): string => {
  if (address.formattedAddress?.trim()) return address.formattedAddress.trim();

  const streetLine = [address.streetNumber, address.street].filter(Boolean).join(' ');
  const uniqueParts = [
    address.name,
    streetLine,
    address.district,
    address.subregion,
    address.city,
    address.region,
  ].filter((part, index, parts): part is string => {
    if (!part?.trim()) return false;
    return parts.findIndex(candidate => candidate?.trim() === part.trim()) === index;
  });

  return uniqueParts.join(', ');
};

export const MapSection: React.FC<MapSectionProps> = ({ pins, cards, onUserLocationChange }) => {
  const mapRef = useRef<MapView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const hasFocusedMarkersRef = useRef(false);
  const hasFocusedUserRef = useRef(false);
  const geocodedCoordinatesRef = useRef(new Map<string, string>());
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDaytime, setIsDaytime] = useState<boolean>(() => isDaytimeNow());
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [detailedAddresses, setDetailedAddresses] = useState<Record<string, string>>({});
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setIsDaytime(isDaytimeNow()), 60000);
    return () => clearInterval(timer);
  }, []);

  const cardByItemId = useMemo(() => {
    const map = new Map<string, HomeLostFeedCard>();
    for (const card of cards) map.set(card.itemId, card);
    return map;
  }, [cards]);

  const markers = useMemo<MapMarkerPayload[]>(() => {
    const markerMap = new Map<string, MapMarkerPayload>();

    for (const pin of pins) {
      if (!isFiniteNumber(pin.lat) || !isFiniteNumber(pin.lng)) continue;

      const card = cardByItemId.get(pin.itemId);
      markerMap.set(pin.itemId, {
        itemId: pin.itemId,
        latitude: pin.lat,
        longitude: pin.lng,
        isOwn: pin.isOwn,
        name: card?.name,
        lostMessage: card?.lostMessage,
        address: card?.address,
      });
    }

    return Array.from(markerMap.values());
  }, [cardByItemId, pins]);

  const nearbyMarkers = useMemo(() => markers.filter(marker => !marker.isOwn), [markers]);
  const selectedMarker = useMemo(
    () => nearbyMarkers.find(marker => marker.itemId === selectedMarkerId) ?? null,
    [nearbyMarkers, selectedMarkerId]
  );

  useEffect(() => {
    if (!hasLocationPermission || nearbyMarkers.length === 0) return;

    let isActive = true;

    const resolveDetailedAddresses = async () => {
      const updates: Record<string, string> = {};

      for (const marker of nearbyMarkers) {
        const coordinateKey = `${marker.latitude.toFixed(6)},${marker.longitude.toFixed(6)}`;
        if (geocodedCoordinatesRef.current.has(coordinateKey)) {
          const cachedAddress = geocodedCoordinatesRef.current.get(coordinateKey);
          if (cachedAddress) updates[marker.itemId] = cachedAddress;
          continue;
        }

        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude: marker.latitude,
            longitude: marker.longitude,
          });
          const detailedAddress = address ? formatGeocodedAddress(address) : '';
          geocodedCoordinatesRef.current.set(coordinateKey, detailedAddress);
          if (detailedAddress) updates[marker.itemId] = detailedAddress;
        } catch (error) {
          geocodedCoordinatesRef.current.set(coordinateKey, '');
          console.warn('[GoogleMap] Failed to resolve marker address:', error);
        }
      }

      if (isActive && Object.keys(updates).length > 0) {
        setDetailedAddresses(current => ({ ...current, ...updates }));
      }
    };

    void resolveDetailedAddresses();
    return () => {
      isActive = false;
    };
  }, [hasLocationPermission, nearbyMarkers]);

  const updateUserLocation = useCallback(
    (coords: Location.LocationObjectCoords) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) return;

      const normalized = {
        latitude: Number(coords.latitude.toFixed(6)),
        longitude: Number(coords.longitude.toFixed(6)),
        accuracy: Number((coords.accuracy || 0).toFixed(1)),
      };
      setUserLocation(normalized);
      onUserLocationChange({ latitude: normalized.latitude, longitude: normalized.longitude });
    },
    [onUserLocationChange]
  );

  useEffect(() => {
    let isMounted = true;

    const watchLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted' || !isMounted) {
        setHasLocationPermission(false);
        console.warn('[GoogleMap] Foreground location permission was not granted');
        return;
      }
      setHasLocationPermission(true);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          mayShowUserSettingsDialog: true,
        }).catch(() => null);
        if (initialLocation && isMounted) updateUserLocation(initialLocation.coords);

        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          console.warn('[GoogleMap] Location services are disabled or unavailable');
        }
      }

      try {
        const cachedLocation = await Location.getLastKnownPositionAsync({
          maxAge: 10 * 60 * 1000,
          requiredAccuracy: 2000,
        });
        if (cachedLocation && isMounted) updateUserLocation(cachedLocation.coords);
      } catch (error) {
        console.warn('[GoogleMap] Failed to read last known location:', error);
      }

      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });
        if (isMounted) updateUserLocation(initialLocation.coords);
      } catch (error) {
        // The watcher below must still start so the app can recover when GPS becomes available.
        console.warn('[GoogleMap] Current location is not available yet:', error);
      }

      try {
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 25,
          },
          location => updateUserLocation(location.coords)
        );
      } catch (error) {
        console.warn('[GoogleMap] Failed to start location watcher:', error);
      }
    };

    void watchLocation();
    return () => {
      isMounted = false;
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
    };
  }, [updateUserLocation]);

  useEffect(() => {
    if (!isMapReady || userLocation || nearbyMarkers.length === 0 || hasFocusedMarkersRef.current) {
      return;
    }

    mapRef.current?.fitToCoordinates(
      nearbyMarkers.map(marker => ({ latitude: marker.latitude, longitude: marker.longitude })),
      {
        edgePadding: { top: 110, right: 24, bottom: 280, left: 24 },
        animated: true,
      }
    );
    hasFocusedMarkersRef.current = true;
  }, [isMapReady, nearbyMarkers, userLocation]);

  useEffect(() => {
    if (!isMapReady || !userLocation || hasFocusedUserRef.current) return;

    const visibleCoordinates = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      ...nearbyMarkers.map(marker => ({ latitude: marker.latitude, longitude: marker.longitude })),
    ];

    if (visibleCoordinates.length === 1) {
      mapRef.current?.animateToRegion({
        ...visibleCoordinates[0],
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    } else {
      mapRef.current?.fitToCoordinates(visibleCoordinates, {
        edgePadding: { top: 110, right: 24, bottom: 280, left: 24 },
        animated: true,
      });
    }

    hasFocusedUserRef.current = true;
    hasFocusedMarkersRef.current = true;
  }, [isMapReady, nearbyMarkers, userLocation]);

  return (
    <View className="h-full w-full">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={FALLBACK_REGION}
        customMapStyle={isDaytime ? [] : DARK_GOOGLE_MAP_STYLE}
        mapType="standard"
        toolbarEnabled={false}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={hasLocationPermission}
        loadingEnabled
        onMapReady={() => setIsMapReady(true)}
        style={StyleSheet.absoluteFillObject}
      >
        {userLocation && (
          <Circle
            center={userLocation}
            radius={Math.max(userLocation.accuracy, 5)}
            strokeColor="rgba(66, 133, 244, 0.45)"
            fillColor="rgba(66, 133, 244, 0.12)"
          />
        )}

        {nearbyMarkers.map(marker => (
          <Marker
            key={marker.itemId}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            pinColor="#f97316"
            onPress={() => setSelectedMarkerId(marker.itemId)}
          />
        ))}
      </MapView>

      {selectedMarker && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text numberOfLines={2} style={styles.detailTitle}>
              {selectedMarker.name || 'Đồ thất lạc'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng chi tiết vị trí"
              hitSlop={10}
              onPress={() => setSelectedMarkerId(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.detailLabel}>VỊ TRÍ CHI TIẾT</Text>
          <Text style={styles.detailAddress}>
            {detailedAddresses[selectedMarker.itemId] ||
              selectedMarker.address ||
              'Chưa xác định địa chỉ'}
          </Text>
          <Text style={styles.detailCoordinates}>
            {selectedMarker.latitude.toFixed(6)}, {selectedMarker.longitude.toFixed(6)}
          </Text>
          {!!selectedMarker.lostMessage && (
            <Text numberOfLines={3} style={styles.detailMessage}>
              {selectedMarker.lostMessage}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailCard: {
    position: 'absolute',
    top: 118,
    left: 20,
    right: 20,
    zIndex: 30,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.28)',
    elevation: 8,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  detailTitle: { flex: 1, paddingRight: 12, color: '#17131f', fontSize: 17, fontWeight: '800' },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0ecff',
  },
  closeText: { marginTop: -2, color: '#5b21b6', fontSize: 24, lineHeight: 26 },
  detailLabel: {
    marginTop: 9,
    color: '#7c3aed',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  detailAddress: { marginTop: 3, color: '#332d3d', fontSize: 14, lineHeight: 20 },
  detailCoordinates: { marginTop: 5, color: '#756d80', fontSize: 11 },
  detailMessage: {
    marginTop: 9,
    paddingTop: 8,
    color: '#5e5668',
    fontSize: 12,
    lineHeight: 17,
    borderTopWidth: 1,
    borderTopColor: '#eeeaf4',
  },
});
