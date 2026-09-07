import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';
import { radarApi } from '@services/radar';
import { foundReportsApi } from '@/services/reports/found';

const DEFAULT_RADIUS_METERS = 5000;
const MIN_RADIUS_METERS = 1;
const MAX_RADIUS_METERS = 50000;
const SNAPSHOT_REFRESH_DISTANCE_METERS = 5000; // Chỉ load lại nếu di chuyển hơn 5km
const SNAPSHOT_REFRESH_INTERVAL_MS = 3600000; // 1 tiếng (không tự động load lại liên tục)
const ERROR_THROTTLE_MS = 6000;
const FOREGROUND_SYNC_THROTTLE_MS = 3600000; // 1 tiếng
const TAB_FOCUS_SYNC_THROTTLE_MS = 3600000; // 1 tiếng
const DEFAULT_MIN_SYNC_REFRESH_AGE_MS = 3600000; // 1 tiếng

interface RadarCoordinates {
  latitude: number;
  longitude: number;
}

interface LastSnapshotState {
  location: RadarCoordinates;
  timestamp: number;
}

interface PendingRefreshState {
  coords?: RadarCoordinates;
}

interface UseHomeLostFeedOptions {
  radiusMeters?: number;
  minSyncRefreshAgeMs?: number;
  onError?: (message: string) => void;
}

const toRadians = (value: number): number => (value * Math.PI) / 180;

const getDistanceMeters = (from: RadarCoordinates, to: RadarCoordinates): number => {
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const clampRadius = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_RADIUS_METERS;
  }

  return Math.min(MAX_RADIUS_METERS, Math.max(MIN_RADIUS_METERS, Math.floor(value)));
};

export const useHomeLostFeed = ({
  radiusMeters = DEFAULT_RADIUS_METERS,
  minSyncRefreshAgeMs = DEFAULT_MIN_SYNC_REFRESH_AGE_MS,
  onError,
}: UseHomeLostFeedOptions = {}) => {
  const normalizedRadius = clampRadius(radiusMeters);

  const [mapPins, setMapPins] = useState<HomeLostFeedPin[]>([]);
  const [lostFeedCards, setLostFeedCards] = useState<HomeLostFeedCard[]>([]);
  const [myLostCount, setMyLostCount] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RadarCoordinates | null>(null);

  const locationRef = useRef<RadarCoordinates | null>(null);
  const lastSnapshotRef = useRef<LastSnapshotState | null>(null);
  const snapshotInFlightRef = useRef(false);
  const pendingRefreshRef = useRef<PendingRefreshState | null>(null);
  const lastErrorAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastForegroundSyncAtRef = useRef(0);
  const lastTabFocusSyncAtRef = useRef(0);
  const foundFeedRevisionRef = useRef(foundReportsApi.getFeedRevision());
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const notifyError = useCallback(
    (fallbackMessage: string, error?: unknown) => {
      const now = Date.now();
      if (now - lastErrorAtRef.current < ERROR_THROTTLE_MS) {
        return;
      }

      lastErrorAtRef.current = now;
      const message = error instanceof Error ? error.message : fallbackMessage;

      // Gọi thông qua ref thay vì gọi trực tiếp biến onError
      if (onErrorRef.current) {
        onErrorRef.current(message);
      }
    },
    [] // <-- Dependency array rỗng, hàm này giờ đây bất biến!
  );

  const shouldRefreshSnapshot = useCallback((nextCoords: RadarCoordinates): boolean => {
    if (!lastSnapshotRef.current) {
      return true;
    }

    const movedDistance = getDistanceMeters(lastSnapshotRef.current.location, nextCoords);
    const staleSnapshot =
      Date.now() - lastSnapshotRef.current.timestamp >= SNAPSHOT_REFRESH_INTERVAL_MS;

    return movedDistance >= SNAPSHOT_REFRESH_DISTANCE_METERS || staleSnapshot;
  }, []);

  const refreshLostFeed = useCallback(
    async (coords?: RadarCoordinates) => {
      if (snapshotInFlightRef.current) {
        pendingRefreshRef.current = { coords };
        return;
      }

      snapshotInFlightRef.current = true;
      setIsRadarLoading(true);

      try {
        const data = await radarApi.getHomeLostFeed(
          coords
            ? {
                lat: coords.latitude,
                lng: coords.longitude,
                radius: normalizedRadius,
              }
            : undefined
        );

        const feedSource = coords ? 'location' : 'no-location';

        setMapPins(data.pins);
        setLostFeedCards(data.cards);
        setMyLostCount(data.myLostCount);
        setNearbyCount(data.nearbyCount);
        setLastUpdatedAt(new Date().toISOString());

        if (coords) {
          lastSnapshotRef.current = {
            location: coords,
            timestamp: Date.now(),
          };
        }

        if (__DEV__) {
          console.log('[HomeFeed] /api/home/lost-feed result:', {
            source: feedSource,
            hasLocation: Boolean(coords),
            radius: coords ? normalizedRadius : null,
            myLostCount: data.myLostCount,
            nearbyCount: data.nearbyCount,
            cardsCount: data.cards.length,
            pinsCount: data.pins.length,
            cardsPreview: data.cards.slice(0, 3).map(card => ({
              itemId: card.itemId,
              name: card.name,
              isOwn: card.isOwn,
              distanceLabel: card.distanceLabel,
            })),
            pinsPreview: data.pins.slice(0, 3),
          });
        }
      } catch (error) {
        notifyError('Không thể tải dữ liệu Home Lost Feed.', error);
      } finally {
        snapshotInFlightRef.current = false;
        setIsRadarLoading(false);

        const pendingRefresh = pendingRefreshRef.current;
        pendingRefreshRef.current = null;

        if (pendingRefresh) {
          void refreshLostFeed(pendingRefresh.coords);
        }
      }
    },
    [normalizedRadius, notifyError]
  );

  const handleUserLocationChange = useCallback(
    (coords: RadarCoordinates) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      locationRef.current = coords;
      setCurrentLocation(coords);

      if (shouldRefreshSnapshot(coords)) {
        void refreshLostFeed(coords);
      }
    },
    [refreshLostFeed, shouldRefreshSnapshot]
  );

  const syncLostFeedAtCurrentLocation = useCallback(async () => {
    const coords = locationRef.current;

    if (!coords) {
      await refreshLostFeed();
      return;
    }

    const snapshotAge = lastSnapshotRef.current
      ? Date.now() - lastSnapshotRef.current.timestamp
      : Number.POSITIVE_INFINITY;
    const snapshotIsOldEnough = snapshotAge >= minSyncRefreshAgeMs;

    if (snapshotIsOldEnough || shouldRefreshSnapshot(coords)) {
      await refreshLostFeed(coords);
    }
  }, [minSyncRefreshAgeMs, refreshLostFeed, shouldRefreshSnapshot]);

  const syncOnForeground = useCallback(async () => {
    await syncLostFeedAtCurrentLocation();
  }, [syncLostFeedAtCurrentLocation]);

  const syncOnTabFocus = useCallback(async () => {
    const revision = foundReportsApi.getFeedRevision();
    if (revision !== foundFeedRevisionRef.current) {
      foundFeedRevisionRef.current = revision;
      await refreshLostFeed(locationRef.current ?? undefined);
      return;
    }
    // Không load lại data khi vào lại trang nếu đã có dữ liệu
    if (lastSnapshotRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastTabFocusSyncAtRef.current < TAB_FOCUS_SYNC_THROTTLE_MS) {
      return;
    }

    lastTabFocusSyncAtRef.current = now;
    await syncLostFeedAtCurrentLocation();
  }, [refreshLostFeed, syncLostFeedAtCurrentLocation]);

  useEffect(() => {
    void refreshLostFeed();
  }, [refreshLostFeed]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      const becameActive =
        (previousAppState === 'inactive' || previousAppState === 'background') &&
        nextAppState === 'active';

      if (!becameActive) {
        return;
      }

      const now = Date.now();
      if (now - lastForegroundSyncAtRef.current < FOREGROUND_SYNC_THROTTLE_MS) {
        return;
      }

      lastForegroundSyncAtRef.current = now;
      void syncOnForeground();
    });

    return () => {
      subscription.remove();
    };
  }, [syncOnForeground]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[HomeFeed] Hook state:', {
      mapPins: mapPins.length,
      cards: lostFeedCards.length,
      myLostCount,
      nearbyCount,
      isRadarLoading,
      hasLocation: Boolean(currentLocation),
    });
  }, [
    currentLocation,
    isRadarLoading,
    lostFeedCards.length,
    mapPins.length,
    myLostCount,
    nearbyCount,
  ]);

  return {
    mapPins,
    lostFeedCards,
    myLostCount,
    nearbyCount,
    isRadarLoading,
    lastUpdatedAt,
    currentLocation,
    handleUserLocationChange,
    refreshLostFeed,
    syncOnTabFocus,
  };
};

export default useHomeLostFeed;
