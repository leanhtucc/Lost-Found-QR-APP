import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  DiscoveryFilterType,
  HomeLostFeedCard,
  HomeLostFeedPin,
  MapDiscoveryCard,
  MapDiscoveryPin,
  RadarRealtimeLostItemPayload,
  RadarRealtimeRemovedPayload,
} from '@/types/radar';
import { ItemCategory } from '@/types/item';
import {
  createRadarSocket,
  radarApi,
  RadarSocket,
  sendRadarHeartbeat,
  subscribeRadar,
} from '@services/radar';
import { foundReportsApi } from '@services/reports/found';
import { authStorage } from '@storage/auth';

const DEFAULT_RADIUS_METERS = 10000;
const MIN_RADIUS_METERS = 1;
const MAX_RADIUS_METERS = 10000;
const HEARTBEAT_INTERVAL_MS = 30000;
const SNAPSHOT_REFRESH_DISTANCE_METERS = 500;
const SNAPSHOT_REFRESH_INTERVAL_MS = 300000;
const ERROR_THROTTLE_MS = 6000;
const TAB_FOCUS_SYNC_THROTTLE_MS = 10000;
const DEBOUNCE_VIEWPORT_MS = 450;

interface RadarCoordinates {
  latitude: number;
  longitude: number;
}

interface LastSnapshotState {
  location: RadarCoordinates;
  timestamp: number;
}

export interface UseMapDiscoveryOptions {
  radiusMeters?: number;
  initialTypeFilter?: DiscoveryFilterType;
  initialCategoryFilter?: ItemCategory | 'all';
  onError?: (message: string) => void;
  onPartialError?: (message: string) => void;
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

export const normalizeLostToDiscovery = (
  pins: HomeLostFeedPin[],
  cards: HomeLostFeedCard[]
): { pins: MapDiscoveryPin[]; cards: MapDiscoveryCard[] } => {
  const mappedCards: MapDiscoveryCard[] = cards.map(card => {
    const rawId = card.itemId;
    return {
      ...card,
      discoveryKey: `LOST_ITEM:${rawId}`,
      rawId,
      source: 'LOST_ITEM',
      reportType: 'LOST',
    };
  });

  const mappedPins: MapDiscoveryPin[] = pins.map(pin => {
    const rawId = pin.itemId;
    return {
      discoveryKey: `LOST_ITEM:${rawId}`,
      rawId,
      source: 'LOST_ITEM',
      lat: pin.lat,
      lng: pin.lng,
      isOwn: pin.isOwn,
    };
  });

  return { pins: mappedPins, cards: mappedCards };
};

export const normalizeFoundToDiscovery = (
  pins: HomeLostFeedPin[],
  cards: HomeLostFeedCard[]
): { pins: MapDiscoveryPin[]; cards: MapDiscoveryCard[] } => {
  const mappedCards: MapDiscoveryCard[] = cards.map(card => {
    const rawId = card.itemId.startsWith('found:') ? card.itemId.slice(6) : card.itemId;
    return {
      ...card,
      discoveryKey: `FOUND_REPORT:${rawId}`,
      rawId,
      source: 'FOUND_REPORT',
      reportType: 'FOUND',
    };
  });

  const mappedPins: MapDiscoveryPin[] = pins.map(pin => {
    const rawId = pin.itemId.startsWith('found:') ? pin.itemId.slice(6) : pin.itemId;
    return {
      discoveryKey: `FOUND_REPORT:${rawId}`,
      rawId,
      source: 'FOUND_REPORT',
      lat: pin.lat,
      lng: pin.lng,
      isOwn: pin.isOwn,
    };
  });

  return { pins: mappedPins, cards: mappedCards };
};

export const mergeDiscoveryResults = (
  lostData: { pins: MapDiscoveryPin[]; cards: MapDiscoveryCard[] },
  foundData: { pins: MapDiscoveryPin[]; cards: MapDiscoveryCard[] }
): { pins: MapDiscoveryPin[]; cards: MapDiscoveryCard[] } => {
  const combinedCards = [...lostData.cards, ...foundData.cards];

  // Sort: User's own items first, then nearest first
  combinedCards.sort((a, b) => {
    if (a.isOwn && !b.isOwn) return -1;
    if (!a.isOwn && b.isOwn) return 1;
    const distA = typeof a.distanceMeters === 'number' ? a.distanceMeters : Infinity;
    const distB = typeof b.distanceMeters === 'number' ? b.distanceMeters : Infinity;
    return distA - distB;
  });

  // Deduplicate pins by canonical discoveryKey
  const seenPinKeys = new Set<string>();
  const combinedPins: MapDiscoveryPin[] = [];
  for (const pin of [...lostData.pins, ...foundData.pins]) {
    if (!seenPinKeys.has(pin.discoveryKey)) {
      seenPinKeys.add(pin.discoveryKey);
      combinedPins.push(pin);
    }
  }

  return { pins: combinedPins, cards: combinedCards };
};

export const useMapDiscovery = ({
  radiusMeters = DEFAULT_RADIUS_METERS,
  initialTypeFilter = 'ALL',
  initialCategoryFilter = 'all',
  onError,
  onPartialError,
}: UseMapDiscoveryOptions = {}) => {
  const normalizedRadius = clampRadius(radiusMeters);

  const [typeFilter, setTypeFilterState] = useState<DiscoveryFilterType>(initialTypeFilter);
  const [categoryFilter, setCategoryFilterState] = useState<ItemCategory | 'all'>(
    initialCategoryFilter
  );

  const [mapPins, setMapPins] = useState<MapDiscoveryPin[]>([]);
  const [discoveryCards, setDiscoveryCards] = useState<MapDiscoveryCard[]>([]);
  const [myLostCount, setMyLostCount] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const [isViewportLoading, setIsViewportLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RadarCoordinates | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const socketRef = useRef<RadarSocket | null>(null);
  const locationRef = useRef<RadarCoordinates | null>(null);
  const activeRadiusRef = useRef(normalizedRadius);
  const typeFilterRef = useRef(typeFilter);
  const categoryFilterRef = useRef(categoryFilter);

  const discoveryRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotRef = useRef<LastSnapshotState | null>(null);
  const snapshotInFlightRef = useRef(false);
  const lastErrorAtRef = useRef(0);
  const lastTabFocusSyncAtRef = useRef(0);

  const onErrorRef = useRef(onError);
  const onPartialErrorRef = useRef(onPartialError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onPartialErrorRef.current = onPartialError;
  }, [onPartialError]);

  useEffect(() => {
    typeFilterRef.current = typeFilter;
  }, [typeFilter]);

  useEffect(() => {
    categoryFilterRef.current = categoryFilter;
  }, [categoryFilter]);

  useEffect(() => {
    activeRadiusRef.current = normalizedRadius;
  }, [normalizedRadius]);

  const notifyError = useCallback((fallbackMessage: string, error?: unknown) => {
    const now = Date.now();
    if (now - lastErrorAtRef.current < ERROR_THROTTLE_MS) {
      return;
    }
    lastErrorAtRef.current = now;
    const message = error instanceof Error ? error.message : fallbackMessage;
    onErrorRef.current?.(message);
  }, []);

  const notifyPartialError = useCallback((message: string) => {
    onPartialErrorRef.current?.(message);
  }, []);

  const emitSubscribe = useCallback(async (socket: RadarSocket, coords: RadarCoordinates) => {
    const ack = await subscribeRadar(socket, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: activeRadiusRef.current,
    });
    if (__DEV__) {
      console.log('[useMapDiscovery] Subscribed radar:', ack);
    }
  }, []);

  const sendHeartbeat = useCallback(async (coords?: RadarCoordinates) => {
    const socket = socketRef.current;
    const targetCoords = coords || locationRef.current;
    if (!socket || !socket.connected || !targetCoords) return;

    await sendRadarHeartbeat(socket, {
      latitude: targetCoords.latitude,
      longitude: targetCoords.longitude,
      radius: activeRadiusRef.current,
    });
  }, []);

  const ensureSocketConnection = useCallback(async () => {
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }
      return;
    }

    try {
      const token = await authStorage.getAccessToken();
      const socket = createRadarSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsRealtimeConnected(true);
        if (__DEV__) console.log('[useMapDiscovery] Socket connected:', socket.id);
        const coords = locationRef.current;
        if (coords) void emitSubscribe(socket, coords);
      });

      socket.on('disconnect', () => {
        setIsRealtimeConnected(false);
      });

      socket.on('connect_error', (error: Error) => {
        console.warn('[useMapDiscovery] Socket connection error:', error.message);
      });

      // Handle realtime new lost item
      socket.on('radar:new-lost-item', (item: RadarRealtimeLostItemPayload) => {
        if (!item || !item.itemId) return;

        // If currently filtering to FOUND, do not show newly reported LOST items
        if (typeFilterRef.current === 'FOUND') return;

        // If category filter is active and does not match, ignore
        if (categoryFilterRef.current !== 'all' && item.category !== categoryFilterRef.current) {
          return;
        }

        const distanceMeters =
          typeof item.distanceMeters === 'number' ? Math.round(item.distanceMeters) : null;
        const distanceLabel = distanceMeters !== null ? `${distanceMeters}m` : null;

        const newCard: MapDiscoveryCard = {
          discoveryKey: `LOST_ITEM:${item.itemId}`,
          rawId: item.itemId,
          source: 'LOST_ITEM',
          reportType: 'LOST',
          name: item.name || 'Vật phẩm thất lạc',
          category: item.category || 'other',
          imagePublicUrl: item.imagePublicUrl || null,
          lostMessage: item.lostMessage || null,
          address: null,
          distanceMeters,
          distanceLabel,
          lostLat: item.latitude,
          lostLng: item.longitude,
          isOwn: false,
          ownerDisplayName: 'Người dùng',
          ownerPhotoURL: null,
          reportedAt: item.reportedAt || new Date().toISOString(),
        };

        const newPin: MapDiscoveryPin = {
          discoveryKey: `LOST_ITEM:${item.itemId}`,
          rawId: item.itemId,
          source: 'LOST_ITEM',
          lat: item.latitude,
          lng: item.longitude,
          isOwn: false,
        };

        setDiscoveryCards(prev => {
          const filtered = prev.filter(c => c.discoveryKey !== newCard.discoveryKey);
          return [newCard, ...filtered];
        });

        setMapPins(prev => {
          const filtered = prev.filter(p => p.discoveryKey !== newPin.discoveryKey);
          return [newPin, ...filtered];
        });

        setNearbyCount(prev => prev + 1);
        setLastUpdatedAt(new Date().toISOString());
      });

      // Handle realtime lost item removed/resolved
      socket.on('radar:lost-item-removed', (data: RadarRealtimeRemovedPayload) => {
        if (!data || !data.itemId) return;
        const targetKey = `LOST_ITEM:${data.itemId}`;

        setDiscoveryCards(prev => {
          const target = prev.find(c => c.discoveryKey === targetKey);
          if (target?.isOwn) {
            setMyLostCount(c => Math.max(0, c - 1));
          }
          return prev.filter(c => c.discoveryKey !== targetKey);
        });

        setMapPins(prev => prev.filter(p => p.discoveryKey !== targetKey));
        setNearbyCount(prev => Math.max(0, prev - 1));
        setLastUpdatedAt(new Date().toISOString());
      });
    } catch (error) {
      notifyError('Không thể kết nối Socket Radar.', error);
    }
  }, [emitSubscribe, notifyError]);

  // Centralized query execution: coordinates + radius + typeFilter + categoryFilter
  const executeDiscoveryQuery = useCallback(
    async (
      coords: RadarCoordinates,
      radius: number,
      targetTypeFilter: DiscoveryFilterType,
      targetCategoryFilter: ItemCategory | 'all',
      requestId: number,
      isBackgroundSnapshot = false
    ) => {
      const categoryParam = targetCategoryFilter !== 'all' ? targetCategoryFilter : undefined;

      const fetchLost = async () => {
        const res = await radarApi.getHomeLostFeed({
          lat: coords.latitude,
          lng: coords.longitude,
          radius,
          category: categoryParam,
        });
        return {
          normalized: normalizeLostToDiscovery(res.pins, res.cards),
          myLostCount: res.myLostCount,
          nearbyCount: res.nearbyCount,
        };
      };

      const fetchFound = async () => {
        const res = await foundReportsApi.getFeed({
          lat: coords.latitude,
          lng: coords.longitude,
          radius,
          category: categoryParam,
        });
        return {
          normalized: normalizeFoundToDiscovery(res.pins, res.cards),
          totalCount: res.totalCount,
        };
      };

      try {
        if (targetTypeFilter === 'LOST') {
          const lostRes = await fetchLost();
          if (requestId !== discoveryRequestIdRef.current) return;

          setMapPins(lostRes.normalized.pins);
          setDiscoveryCards(lostRes.normalized.cards);
          setMyLostCount(lostRes.myLostCount);
          setNearbyCount(lostRes.normalized.cards.length);
          setRefreshFailed(false);
          setLastUpdatedAt(new Date().toISOString());
        } else if (targetTypeFilter === 'FOUND') {
          const foundRes = await fetchFound();
          if (requestId !== discoveryRequestIdRef.current) return;

          setMapPins(foundRes.normalized.pins);
          setDiscoveryCards(foundRes.normalized.cards);
          setNearbyCount(foundRes.normalized.cards.length);
          setRefreshFailed(false);
          setLastUpdatedAt(new Date().toISOString());
        } else {
          // 'ALL': Fetch both with Promise.allSettled for fault isolation
          const [lostSettled, foundSettled] = await Promise.allSettled([fetchLost(), fetchFound()]);

          if (requestId !== discoveryRequestIdRef.current) return;

          if (lostSettled.status === 'fulfilled' && foundSettled.status === 'fulfilled') {
            const merged = mergeDiscoveryResults(
              lostSettled.value.normalized,
              foundSettled.value.normalized
            );
            setMapPins(merged.pins);
            setDiscoveryCards(merged.cards);
            setMyLostCount(lostSettled.value.myLostCount);
            setNearbyCount(merged.cards.length);
            setRefreshFailed(false);
            setLastUpdatedAt(new Date().toISOString());
          } else if (lostSettled.status === 'fulfilled') {
            // LOST succeeded, FOUND failed: Render only LOST for new viewport. Zero mixing!
            setMapPins(lostSettled.value.normalized.pins);
            setDiscoveryCards(lostSettled.value.normalized.cards);
            setMyLostCount(lostSettled.value.myLostCount);
            setNearbyCount(lostSettled.value.normalized.cards.length);
            setRefreshFailed(false);
            setLastUpdatedAt(new Date().toISOString());
            notifyPartialError('Đã tải đồ thất lạc; không thể tải bài đăng nhặt được.');
          } else if (foundSettled.status === 'fulfilled') {
            // FOUND succeeded, LOST failed: Render only FOUND for new viewport. Zero mixing!
            setMapPins(foundSettled.value.normalized.pins);
            setDiscoveryCards(foundSettled.value.normalized.cards);
            setNearbyCount(foundSettled.value.normalized.cards.length);
            setRefreshFailed(false);
            setLastUpdatedAt(new Date().toISOString());
            notifyPartialError('Đã tải bài đăng nhặt được; không thể tải đồ thất lạc.');
          } else {
            // Both failed: Keep previous markers as fallback and indicate refresh failed
            setRefreshFailed(true);
            notifyError('Không thể làm mới dữ liệu khám phá.');
          }
        }

        if (isBackgroundSnapshot) {
          lastSnapshotRef.current = {
            location: coords,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        if (requestId === discoveryRequestIdRef.current) {
          setRefreshFailed(true);
          notifyError('Không thể tải dữ liệu khám phá.', error);
        }
      } finally {
        if (requestId === discoveryRequestIdRef.current) {
          setIsRadarLoading(false);
          setIsViewportLoading(false);
          snapshotInFlightRef.current = false;
        }
      }
    },
    [notifyError, notifyPartialError]
  );

  const fetchViewportDiscovery = useCallback(
    (coords: RadarCoordinates, radiusMetersParam: number) => {
      if (!coords || !Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const clamped = clampRadius(radiusMetersParam);
      activeRadiusRef.current = clamped;

      debounceTimerRef.current = setTimeout(() => {
        const requestId = ++discoveryRequestIdRef.current;
        setIsViewportLoading(true);
        setIsRadarLoading(true);

        void executeDiscoveryQuery(
          coords,
          clamped,
          typeFilterRef.current,
          categoryFilterRef.current,
          requestId,
          false
        );
      }, DEBOUNCE_VIEWPORT_MS);
    },
    [executeDiscoveryQuery]
  );

  const refreshDiscovery = useCallback(
    async (coords?: RadarCoordinates) => {
      const targetCoords = coords || locationRef.current;
      if (!targetCoords) {
        if (__DEV__) {
          console.log('[useMapDiscovery] Skipping refresh: GPS coordinates not available yet');
        }
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const requestId = ++discoveryRequestIdRef.current;
      setIsRadarLoading(true);
      snapshotInFlightRef.current = true;

      await executeDiscoveryQuery(
        targetCoords,
        activeRadiusRef.current,
        typeFilterRef.current,
        categoryFilterRef.current,
        requestId,
        true
      );
    },
    [executeDiscoveryQuery]
  );

  // Instant filter change: cancels debouncing, immediately queries active viewport with new filter
  const setTypeFilter = useCallback(
    (newType: DiscoveryFilterType) => {
      if (newType === typeFilterRef.current) return;
      setTypeFilterState(newType);
      typeFilterRef.current = newType;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const coords = locationRef.current;
      if (!coords) return;

      const requestId = ++discoveryRequestIdRef.current;
      setIsRadarLoading(true);

      void executeDiscoveryQuery(
        coords,
        activeRadiusRef.current,
        newType,
        categoryFilterRef.current,
        requestId,
        false
      );
    },
    [executeDiscoveryQuery]
  );

  const setCategoryFilter = useCallback(
    (newCategory: ItemCategory | 'all') => {
      if (newCategory === categoryFilterRef.current) return;
      setCategoryFilterState(newCategory);
      categoryFilterRef.current = newCategory;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const coords = locationRef.current;
      if (!coords) return;

      const requestId = ++discoveryRequestIdRef.current;
      setIsRadarLoading(true);

      void executeDiscoveryQuery(
        coords,
        activeRadiusRef.current,
        typeFilterRef.current,
        newCategory,
        requestId,
        false
      );
    },
    [executeDiscoveryQuery]
  );

  const handleUserLocationChange = useCallback(
    (coords: RadarCoordinates) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      const isFirst = !locationRef.current;
      locationRef.current = coords;
      setCurrentLocation(coords);

      void ensureSocketConnection();

      if (socketRef.current?.connected) {
        void emitSubscribe(socketRef.current, coords);
        void sendHeartbeat(coords);
      }

      const shouldSnapshot =
        isFirst ||
        !lastSnapshotRef.current ||
        getDistanceMeters(lastSnapshotRef.current.location, coords) >=
          SNAPSHOT_REFRESH_DISTANCE_METERS ||
        Date.now() - lastSnapshotRef.current.timestamp >= SNAPSHOT_REFRESH_INTERVAL_MS;

      if (shouldSnapshot && !snapshotInFlightRef.current) {
        void refreshDiscovery(coords);
      }
    },
    [emitSubscribe, ensureSocketConnection, refreshDiscovery, sendHeartbeat]
  );

  const syncOnTabFocus = useCallback(async () => {
    const now = Date.now();
    if (now - lastTabFocusSyncAtRef.current < TAB_FOCUS_SYNC_THROTTLE_MS) {
      return;
    }
    lastTabFocusSyncAtRef.current = now;

    const coords = locationRef.current;
    if (coords) {
      await refreshDiscovery(coords);
    }
  }, [refreshDiscovery]);

  // AppState foreground synchronization
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const coords = locationRef.current;
        if (coords) {
          void refreshDiscovery(coords);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshDiscovery]);

  // Periodic heartbeat timer
  useEffect(() => {
    const timer = setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [sendHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    typeFilter,
    categoryFilter,
    setTypeFilter,
    setCategoryFilter,
    mapPins,
    discoveryCards,
    myLostCount,
    nearbyCount,
    isRadarLoading,
    isViewportLoading,
    isRealtimeConnected,
    lastUpdatedAt,
    currentLocation,
    refreshFailed,
    handleUserLocationChange,
    fetchViewportDiscovery,
    refreshDiscovery,
    syncOnTabFocus,
  };
};

export default useMapDiscovery;
