/**
 * useLiveTracking Hook
 * Quản lý GPS realtime, tính khoảng cách, ETA và phát trực tiếp tọa độ lên Return Socket
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { useReturnStore } from '@/services/returns/store';
import { LiveLocation } from '@/types/return-flow';
import { emitReturnLocation } from '@/services/returns/socket';
import { returnApi } from '@/services/returns/api';

// Haversine formula to calculate distance between two coordinates in meters
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export const formatDistance = (meters: number | null): string => {
  if (meters === null || isNaN(meters)) return '--';
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatEta = (meters: number | null): string => {
  if (meters === null || isNaN(meters)) return '--';
  // Assume avg urban speed: ~20 km/h (approx 5.5 m/s) or walking 5 km/h for < 500m
  const speedMetersPerSec = meters < 500 ? 1.4 : 5.5;
  const seconds = Math.ceil(meters / speedMetersPerSec);
  const minutes = Math.ceil(seconds / 60);

  if (minutes < 1) return 'Dưới 1 phút';
  if (minutes < 60) return `Khoảng ${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}p`;
};

interface UseLiveTrackingProps {
  enabled?: boolean;
  sessionId?: string;
  meetupLatitude?: number;
  meetupLongitude?: number;
}

export const useLiveTracking = ({
  enabled = true,
  sessionId,
  meetupLatitude,
  meetupLongitude,
}: UseLiveTrackingProps) => {
  const myLocation = useReturnStore(state => state.myLocation);
  const partnerLocation = useReturnStore(state => state.partnerLocation);
  const isPartnerLocationStale = useReturnStore(state => state.isPartnerLocationStale);
  const gpsState = useReturnStore(state => state.gpsState);
  const connectionState = useReturnStore(state => state.connectionState);

  const setMyLocation = useReturnStore(state => state.setMyLocation);
  const setGpsState = useReturnStore(state => state.setGpsState);
  const setPartnerLocationStale = useReturnStore(state => state.setPartnerLocationStale);

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Stale check interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (partnerLocation) {
        const diffSeconds = (Date.now() - new Date(partnerLocation.capturedAt).getTime()) / 1000;
        setPartnerLocationStale(diffSeconds > 60);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [partnerLocation, setPartnerLocationStale]);

  // Request permission and start location watch
  const startTracking = useCallback(async () => {
    try {
      setGpsState('acquiring');
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setGpsState('permission_denied');
        return;
      }

      // Initial position
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const initialLive: LiveLocation = {
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
        accuracy: initial.coords.accuracy,
        heading: initial.coords.heading,
        speed: initial.coords.speed,
        capturedAt: new Date().toISOString(),
      };
      setMyLocation(initialLive);
      setGpsState('ready');

      // Phát tọa độ ban đầu lên Socket
      if (sessionId) {
        emitReturnLocation(sessionId, initialLive);
      }

      // Watch updates
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        newLocation => {
          const liveLoc: LiveLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            capturedAt: new Date().toISOString(),
          };

          // 1. Cập nhật Zustand local
          setMyLocation(liveLoc);
          setGpsState(
            newLocation.coords.accuracy && newLocation.coords.accuracy > 50 ? 'weak' : 'ready'
          );

          // 2. Phát lên Backend Socket phòng return:${sessionId}
          if (sessionId) {
            emitReturnLocation(sessionId, liveLoc);
          }
        }
      );
    } catch (err) {
      console.warn('[useLiveTracking] Location watch error:', err);
      setGpsState('weak');
    }
  }, [sessionId, setGpsState, setMyLocation]);

  const stopTracking = useCallback(() => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    setGpsState('idle');
    if (sessionId) {
      void returnApi.stopTracking(sessionId);
    }
  }, [sessionId, setGpsState]);

  useEffect(() => {
    if (enabled) {
      void startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  // Distance calculations
  const distanceToMeetup = useMemo(() => {
    if (!myLocation || meetupLatitude === undefined || meetupLongitude === undefined) {
      return null;
    }
    return calculateDistanceMeters(
      myLocation.latitude,
      myLocation.longitude,
      meetupLatitude,
      meetupLongitude
    );
  }, [myLocation, meetupLatitude, meetupLongitude]);

  const distanceBetweenUsers = useMemo(() => {
    if (!myLocation || !partnerLocation) {
      return null;
    }
    return calculateDistanceMeters(
      myLocation.latitude,
      myLocation.longitude,
      partnerLocation.latitude,
      partnerLocation.longitude
    );
  }, [myLocation, partnerLocation]);

  const isNearMeetup = useMemo(() => {
    return distanceToMeetup !== null && distanceToMeetup <= 100; // within 100 meters
  }, [distanceToMeetup]);

  const etaToMeetup = useMemo(() => {
    return formatEta(distanceToMeetup);
  }, [distanceToMeetup]);

  return {
    myLocation,
    partnerLocation,
    isPartnerLocationStale,
    gpsState,
    connectionState,
    distanceToMeetup,
    distanceBetweenUsers,
    isNearMeetup,
    etaToMeetup,
    startTracking,
    stopTracking,
  };
};
