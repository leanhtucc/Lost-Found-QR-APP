import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { FIND_BACK } from '@/constants/theme';
import {
  HomeLostFeedCard,
  HomeLostFeedPin,
  MapDiscoveryCard,
  MapDiscoveryPin,
} from '@/types/radar';

import { calculateViewportQuery, isSignificantViewportChange, Region } from '@/utils/geoViewport';
import { RadarItemPreviewCard } from './RadarItemPreviewCard';

export type MapSectionPin = MapDiscoveryPin | HomeLostFeedPin;
export type MapSectionCard = MapDiscoveryCard | HomeLostFeedCard;

export interface MapSectionProps {
  pins: MapSectionPin[];
  cards: MapSectionCard[];
  onUserLocationChange: (coords: { latitude: number; longitude: number }) => void;
  onSelectItem?: (itemId: string) => void;
  onLocationPermissionChange?: (status: 'granted' | 'denied' | 'disabled') => void;
  onViewportChange?: (query: { lat: number; lng: number; radius: number }) => void;
  testID?: string;
}

const FALLBACK_REGION: Region = {
  latitude: 21.027763,
  longitude: 105.83416,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const getPinKey = (pin: MapSectionPin): string =>
  'discoveryKey' in pin && pin.discoveryKey ? pin.discoveryKey : (pin as HomeLostFeedPin).itemId;

const getCardKey = (card: MapSectionCard): string =>
  'discoveryKey' in card && card.discoveryKey
    ? card.discoveryKey
    : (card as HomeLostFeedCard).itemId;

const isPinFound = (pin: MapSectionPin): boolean => {
  if ('source' in pin && pin.source === 'FOUND_REPORT') return true;
  const key = getPinKey(pin);
  return (
    key.startsWith('FOUND_REPORT:') ||
    key.startsWith('found:') ||
    ('itemId' in pin && (pin as any).itemId?.startsWith('found:'))
  );
};

export interface MapSectionHandle {
  animateToLocation: (
    coords: {
      latitude: number;
      longitude: number;
      latitudeDelta?: number;
      longitudeDelta?: number;
    },
    durationMs?: number
  ) => void;
  getMapRef: () => MapView | null;
}

export const MapSection = React.forwardRef<MapSectionHandle, MapSectionProps>(
  (
    {
      pins,
      cards,
      onUserLocationChange,
      onSelectItem,
      onLocationPermissionChange,
      onViewportChange,
      testID = 'home-map-section',
    },
    ref
  ) => {
    const mapRef = useRef<MapView>(null);

    React.useImperativeHandle(
      ref,
      () => ({
        animateToLocation: (coords, durationMs = 400) => {
          mapRef.current?.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: coords.latitudeDelta ?? 0.015,
              longitudeDelta: coords.longitudeDelta ?? 0.015,
            },
            durationMs
          );
        },
        getMapRef: () => mapRef.current,
      }),
      []
    );
    const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
    const hasFocusedMarkersRef = useRef(false);
    const hasFocusedUserRef = useRef(false);
    const lastQueryRegionRef = useRef<Region | null>(null);
    const onLocationPermissionChangeRef = useRef(onLocationPermissionChange);

    useEffect(() => {
      onLocationPermissionChangeRef.current = onLocationPermissionChange;
    }, [onLocationPermissionChange]);

    const [isMapReady, setIsMapReady] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
      accuracy: number;
    } | null>(null);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
    const [isViewportCapped, setIsViewportCapped] = useState(false);

    // Deduplicate pins by canonical key to prevent duplicate markers
    const uniquePins = useMemo(() => {
      const seen = new Set<string>();
      const list: MapSectionPin[] = [];
      for (const pin of pins) {
        const key = getPinKey(pin);
        if (!key || seen.has(key)) continue;
        if (!isFiniteNumber(pin.lat) || !isFiniteNumber(pin.lng)) continue;
        seen.add(key);
        list.push(pin);
      }
      return list;
    }, [pins]);

    // Index cards by canonical key for O(1) joined access (never index-based)
    const cardsByKey = useMemo(() => {
      const map = new Map<string, MapSectionCard>();
      for (const card of cards) {
        const key = getCardKey(card);
        map.set(key, card);
        if ('rawId' in card && card.rawId) {
          map.set(card.rawId, card);
        }
        if ('itemId' in card && (card as any).itemId) {
          map.set((card as any).itemId, card);
        }
      }
      return map;
    }, [cards]);

    // Clean deselect if the selected item is no longer in the latest viewport response
    useEffect(() => {
      if (selectedMarkerId && !cardsByKey.has(selectedMarkerId)) {
        setSelectedMarkerId(null);
      }
    }, [cardsByKey, selectedMarkerId]);

    const selectedCard = useMemo(
      () => (selectedMarkerId ? (cardsByKey.get(selectedMarkerId) ?? null) : null),
      [cardsByKey, selectedMarkerId]
    );

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

    // Location permission and GPS tracking
    useEffect(() => {
      let isMounted = true;

      const watchLocation = async () => {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted' || !isMounted) {
          setHasLocationPermission(false);
          onLocationPermissionChangeRef.current?.('denied');
          console.warn('[GoogleMap] Foreground location permission was not granted');
          return;
        }
        setHasLocationPermission(true);

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          onLocationPermissionChangeRef.current?.('disabled');
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            mayShowUserSettingsDialog: true,
          }).catch(() => null);
          if (initialLocation && isMounted) updateUserLocation(initialLocation.coords);

          try {
            await Location.enableNetworkProviderAsync();
            onLocationPermissionChangeRef.current?.('granted');
          } catch {
            console.warn('[GoogleMap] Location services are disabled or unavailable');
          }
        } else {
          onLocationPermissionChangeRef.current?.('granted');
        }

        try {
          const cachedLocation = await Location.getLastKnownPositionAsync({
            maxAge: 10 * 60 * 1000,
            requiredAccuracy: 2000,
          });
          if (cachedLocation && isMounted) updateUserLocation(cachedLocation.coords);
        } catch (error) {
          console.warn('[GoogleMap] Failed to retrieve cached location:', error);
        }

        try {
          const liveLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true,
          });
          if (liveLocation && isMounted) updateUserLocation(liveLocation.coords);
        } catch (error) {
          console.warn('[GoogleMap] Failed to retrieve live location:', error);
        }

        try {
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 10,
              timeInterval: 5000,
            },
            position => {
              if (isMounted) updateUserLocation(position.coords);
            }
          );
        } catch (error) {
          console.warn('[GoogleMap] Failed to subscribe to position updates:', error);
        }
      };

      void watchLocation();

      return () => {
        isMounted = false;
        locationSubscriptionRef.current?.remove();
        locationSubscriptionRef.current = null;
      };
    }, [updateUserLocation]);

    // Initial map focus on pins if GPS is not yet available
    useEffect(() => {
      if (!isMapReady || userLocation || pins.length === 0 || hasFocusedMarkersRef.current) {
        return;
      }

      const validCoordinates = pins
        .filter(pin => isFiniteNumber(pin.lat) && isFiniteNumber(pin.lng))
        .map(pin => ({ latitude: pin.lat, longitude: pin.lng }));

      if (validCoordinates.length === 0) return;

      mapRef.current?.fitToCoordinates(validCoordinates, {
        edgePadding: { top: 110, right: 24, bottom: 280, left: 24 },
        animated: true,
      });
      hasFocusedMarkersRef.current = true;
    }, [isMapReady, pins, userLocation]);

    // Initial map focus on user location + pins
    useEffect(() => {
      if (!isMapReady || !userLocation || hasFocusedUserRef.current) return;

      const validPinCoordinates = pins
        .filter(pin => isFiniteNumber(pin.lat) && isFiniteNumber(pin.lng))
        .map(pin => ({ latitude: pin.lat, longitude: pin.lng }));

      const visibleCoordinates = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        ...validPinCoordinates,
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
    }, [isMapReady, pins, userLocation]);

    // Viewport change handler with threshold checks
    const handleRegionChangeComplete = useCallback(
      (region: Region) => {
        if (!isMapReady) return;

        const isSignificant = isSignificantViewportChange(lastQueryRegionRef.current, region);
        if (!isSignificant) return;

        lastQueryRegionRef.current = region;
        const query = calculateViewportQuery(region);
        setIsViewportCapped(query.isCapped);

        onViewportChange?.({
          lat: query.lat,
          lng: query.lng,
          radius: query.radius,
        });
      },
      [isMapReady, onViewportChange]
    );

    return (
      <View testID={testID} className="h-full w-full">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          initialRegion={FALLBACK_REGION}
          customMapStyle={DARK_GOOGLE_MAP_STYLE}
          mapType="standard"
          toolbarEnabled={false}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
          loadingEnabled
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={() => setSelectedMarkerId(null)}
          style={StyleSheet.absoluteFillObject}
          testID="home-radar-map"
        >
          {userLocation && (
            <Circle
              center={userLocation}
              radius={Math.max(userLocation.accuracy, 5)}
              strokeColor="rgba(66, 133, 244, 0.45)"
              fillColor="rgba(66, 133, 244, 0.12)"
            />
          )}

          {uniquePins.map(pin => {
            if (!isFiniteNumber(pin.lat) || !isFiniteNumber(pin.lng)) return null;

            const pinKey = getPinKey(pin);
            const isFound = isPinFound(pin);
            const pinColor = isFound ? '#10b981' : pin.isOwn ? '#6366f1' : '#f97316';

            return (
              <Marker
                key={pinKey}
                testID={`radar-marker-${pinKey}`}
                coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                pinColor={pinColor}
                onPress={e => {
                  e.stopPropagation();
                  setSelectedMarkerId(pinKey);
                }}
              />
            );
          })}
        </MapView>

        {/* 10 km Capped Viewport Non-blocking Indicator */}
        {isViewportCapped && (
          <View style={styles.cappedPill} pointerEvents="none" testID="radar-capped-indicator">
            <Text style={styles.cappedPillText}>
              Phạm vi quét tối đa 10 km • Phóng to để xem chi tiết hơn
            </Text>
          </View>
        )}

        {/* Floating Radar Item Preview Card */}
        {selectedCard && (
          <RadarItemPreviewCard
            card={selectedCard}
            onClose={() => setSelectedMarkerId(null)}
            onPressDetail={itemId => onSelectItem?.(itemId)}
            style={styles.floatingPreviewCard}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cappedPill: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(19, 19, 25, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 25,
  },
  cappedPillText: {
    fontSize: 11,
    color: FIND_BACK.mutedText,
    fontWeight: '500',
  },
  floatingPreviewCard: {
    position: 'absolute',
    top: 116,
    left: 16,
    right: 16,
    zIndex: 30,
  },
});

export default MapSection;
