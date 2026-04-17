import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  RadarHeartbeatPayload,
  RadarLostItem,
  RadarRealtimeLostItemPayload,
  RadarSubscribePayload,
} from '@/types/radar';
import {
  createRadarSocket,
  radarApi,
  RadarSocket,
  sendRadarHeartbeat,
  subscribeRadar,
  unsubscribeRadar,
} from '@services/radar';
import { authStorage } from '@storage/auth';

const DEFAULT_NEARBY_RADIUS_METERS = 5000;
const DEFAULT_SUBSCRIBE_RADIUS_METERS = 3000;
const MIN_RADIUS_METERS = 1;
const MAX_NEARBY_RADIUS_METERS = 50000;
const MAX_SUBSCRIBE_RADIUS_METERS = 20000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 30000;
const SNAPSHOT_REFRESH_DISTANCE_METERS = 250;
const SNAPSHOT_REFRESH_INTERVAL_MS = 60000;
const ERROR_THROTTLE_MS = 6000;
const FOREGROUND_SYNC_THROTTLE_MS = 3000;
const TAB_FOCUS_SYNC_THROTTLE_MS = 5000;
const DEFAULT_MIN_SYNC_REFRESH_AGE_MS = 20000;

interface RadarCoordinates {
  latitude: number;
  longitude: number;
}

interface LastSnapshotState {
  location: RadarCoordinates;
  timestamp: number;
}

interface UseLiveRadarOptions {
  nearbyRadiusMeters?: number;
  subscribeRadiusMeters?: number;
  heartbeatIntervalMs?: number;
  minSyncRefreshAgeMs?: number;
  onError?: (message: string) => void;
  onNewLostItem?: (item: RadarLostItem) => void;
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

const clampRadius = (value: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return MIN_RADIUS_METERS;
  }

  return Math.min(max, Math.max(MIN_RADIUS_METERS, Math.floor(value)));
};

const toFiniteNumber = (value: unknown): number | null => {
  const normalized = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
};

const sortRadarItems = (items: RadarLostItem[]): RadarLostItem[] => {
  return [...items].sort((left, right) => {
    const leftDistance =
      typeof left.distanceMeters === 'number' ? left.distanceMeters : Number.POSITIVE_INFINITY;
    const rightDistance =
      typeof right.distanceMeters === 'number' ? right.distanceMeters : Number.POSITIVE_INFINITY;

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    const leftReportedAt = left.reportedAt ? new Date(left.reportedAt).getTime() : 0;
    const rightReportedAt = right.reportedAt ? new Date(right.reportedAt).getTime() : 0;
    return rightReportedAt - leftReportedAt;
  });
};

const mergeRadarItems = (current: RadarLostItem[], incoming: RadarLostItem[]): RadarLostItem[] => {
  const itemMap = new Map<string, RadarLostItem>();

  for (const item of current) {
    itemMap.set(item.itemId, item);
  }

  for (const item of incoming) {
    itemMap.set(item.itemId, item);
  }

  return sortRadarItems([...itemMap.values()]);
};

const normalizeRealtimeItem = (payload: RadarRealtimeLostItemPayload): RadarLostItem | null => {
  if (!payload || typeof payload.itemId !== 'string' || typeof payload.name !== 'string') {
    return null;
  }

  const latitude = toFiniteNumber(payload.latitude);
  const longitude = toFiniteNumber(payload.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  const distanceMeters = toFiniteNumber(payload.distanceMeters);

  return {
    itemId: payload.itemId,
    name: payload.name,
    category: typeof payload.category === 'string' ? payload.category : 'other',
    status: 'LOST',
    lostMessage: payload.lostMessage,
    imagePublicUrl: payload.imagePublicUrl,
    latitude,
    longitude,
    distanceMeters: distanceMeters ?? undefined,
    reportedAt: payload.reportedAt,
  };
};

export const useLiveRadar = ({
  nearbyRadiusMeters = DEFAULT_NEARBY_RADIUS_METERS,
  subscribeRadiusMeters = DEFAULT_SUBSCRIBE_RADIUS_METERS,
  heartbeatIntervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS,
  minSyncRefreshAgeMs = DEFAULT_MIN_SYNC_REFRESH_AGE_MS,
  onError,
  onNewLostItem,
}: UseLiveRadarOptions = {}) => {
  const normalizedNearbyRadius = clampRadius(nearbyRadiusMeters, MAX_NEARBY_RADIUS_METERS);
  const normalizedSubscribeRadius = clampRadius(subscribeRadiusMeters, MAX_SUBSCRIBE_RADIUS_METERS);

  const [radarItems, setRadarItems] = useState<RadarLostItem[]>([]);
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RadarCoordinates | null>(null);

  const socketRef = useRef<RadarSocket | null>(null);
  const locationRef = useRef<RadarCoordinates | null>(null);
  const lastSnapshotRef = useRef<LastSnapshotState | null>(null);
  const snapshotInFlightRef = useRef(false);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastErrorAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastForegroundSyncAtRef = useRef(0);
  const lastTabFocusSyncAtRef = useRef(0);

  const notifyError = useCallback(
    (fallbackMessage: string, error?: unknown) => {
      const now = Date.now();
      if (now - lastErrorAtRef.current < ERROR_THROTTLE_MS) {
        return;
      }

      lastErrorAtRef.current = now;
      const message = error instanceof Error ? error.message : fallbackMessage;

      if (onError) {
        onError(message);
      }
    },
    [onError]
  );

  const buildSubscribePayload = useCallback(
    (coords: RadarCoordinates): RadarSubscribePayload => ({
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: normalizedSubscribeRadius,
    }),
    [normalizedSubscribeRadius]
  );

  const buildHeartbeatPayload = useCallback(
    (coords: RadarCoordinates): RadarHeartbeatPayload => ({
      latitude: coords.latitude,
      longitude: coords.longitude,
    }),
    []
  );

  const refreshNearby = useCallback(
    async (coords?: RadarCoordinates) => {
      const targetCoords = coords || locationRef.current;
      if (!targetCoords || snapshotInFlightRef.current) {
        return;
      }

      snapshotInFlightRef.current = true;
      setIsRadarLoading(true);

      try {
        const nearbyItems = await radarApi.getNearbyLostItems({
          lat: targetCoords.latitude,
          lng: targetCoords.longitude,
          radius: normalizedNearbyRadius,
        });

        if (__DEV__) {
          console.log('[Radar] Nearby fetch result:', {
            count: nearbyItems.length,
            latitude: targetCoords.latitude,
            longitude: targetCoords.longitude,
            radius: normalizedNearbyRadius,
          });
        }

        setRadarItems(sortRadarItems(nearbyItems));
        setLastUpdatedAt(new Date().toISOString());
        lastSnapshotRef.current = {
          location: targetCoords,
          timestamp: Date.now(),
        };
      } catch (error) {
        notifyError('Không thể tải dữ liệu Live Radar.', error);
      } finally {
        snapshotInFlightRef.current = false;
        setIsRadarLoading(false);
      }
    },
    [normalizedNearbyRadius, notifyError]
  );

  const sendHeartbeatNow = useCallback(async () => {
    const socket = socketRef.current;
    const coords = locationRef.current;

    if (!socket || !socket.connected || !coords) {
      return;
    }

    const ack = await sendRadarHeartbeat(socket, buildHeartbeatPayload(coords));
    if (!ack.success && ack.message) {
      console.log('[Radar] Heartbeat ack:', ack.message);
    }
  }, [buildHeartbeatPayload]);

  const emitSubscribe = useCallback(
    async (socket: RadarSocket, coords: RadarCoordinates) => {
      const ack = await subscribeRadar(socket, buildSubscribePayload(coords));
      if (!ack.success && ack.message) {
        console.log('[Radar] Subscribe failed:', ack.message);
      }
    },
    [buildSubscribePayload]
  );

  const ensureRealtimeSocket = useCallback(async () => {
    const existingSocket = socketRef.current;
    if (existingSocket) {
      if (!existingSocket.connected) {
        existingSocket.connect();
      }
      return;
    }

    try {
      const token = await authStorage.getAccessToken();
      if (!token) {
        notifyError('Bạn cần đăng nhập lại để dùng Live Radar.');
        return;
      }

      const socket = createRadarSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsRealtimeConnected(true);
        const coords = locationRef.current;
        if (coords) {
          void emitSubscribe(socket, coords);
        }
      });

      socket.on('disconnect', () => {
        setIsRealtimeConnected(false);
      });

      socket.on('connect_error', (error: Error) => {
        console.warn('[Radar] Socket connection error:', error.message);
      });

      socket.on('radar:new-lost-item', (payload: RadarRealtimeLostItemPayload) => {
        const normalizedItem = normalizeRealtimeItem(payload);
        if (!normalizedItem) {
          if (__DEV__) {
            console.log('[Radar] Realtime payload ignored (invalid):', payload);
          }
          return;
        }

        if (__DEV__) {
          console.log('[Radar] Realtime new item:', normalizedItem.itemId);
        }

        setRadarItems(previous => mergeRadarItems(previous, [normalizedItem]));
        setLastUpdatedAt(new Date().toISOString());

        if (onNewLostItem) {
          onNewLostItem(normalizedItem);
        }
      });
    } catch (error) {
      notifyError('Không thể kết nối Live Radar.', error);
    }
  }, [emitSubscribe, notifyError, onNewLostItem]);

  const shouldRefreshSnapshot = useCallback((nextCoords: RadarCoordinates): boolean => {
    if (!lastSnapshotRef.current) {
      return true;
    }

    const movedDistance = getDistanceMeters(lastSnapshotRef.current.location, nextCoords);
    const staleSnapshot =
      Date.now() - lastSnapshotRef.current.timestamp >= SNAPSHOT_REFRESH_INTERVAL_MS;

    return movedDistance >= SNAPSHOT_REFRESH_DISTANCE_METERS || staleSnapshot;
  }, []);

  const handleUserLocationChange = useCallback(
    (coords: RadarCoordinates) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      locationRef.current = coords;
      setCurrentLocation(coords);

      if (!socketRef.current) {
        void ensureRealtimeSocket();
      }

      if (shouldRefreshSnapshot(coords)) {
        void refreshNearby(coords);
      } else {
        void sendHeartbeatNow();
      }
    },
    [ensureRealtimeSocket, refreshNearby, sendHeartbeatNow, shouldRefreshSnapshot]
  );

  const disconnectRealtime = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    socketRef.current = null;
    socket.removeAllListeners();

    try {
      if (socket.connected) {
        await unsubscribeRadar(socket);
      }
    } catch {
      // ignore cleanup errors
    }

    socket.disconnect();
    setIsRealtimeConnected(false);
  }, []);

  const syncRadarAtCurrentLocation = useCallback(
    async (source: 'foreground' | 'tab-focus') => {
      const coords = locationRef.current;
      if (!coords) {
        return;
      }

      await ensureRealtimeSocket();

      const socket = socketRef.current;
      if (socket?.connected) {
        await emitSubscribe(socket, coords);
        const heartbeatAck = await sendRadarHeartbeat(socket, buildHeartbeatPayload(coords));
        if (!heartbeatAck.success && heartbeatAck.message) {
          console.log(`[Radar] ${source} heartbeat ack:`, heartbeatAck.message);
        }
      }

      const snapshotAge = lastSnapshotRef.current
        ? Date.now() - lastSnapshotRef.current.timestamp
        : Number.POSITIVE_INFINITY;
      const snapshotIsOldEnough = snapshotAge >= minSyncRefreshAgeMs;

      if (snapshotIsOldEnough || shouldRefreshSnapshot(coords)) {
        await refreshNearby(coords);
      }
    },
    [
      buildHeartbeatPayload,
      emitSubscribe,
      ensureRealtimeSocket,
      minSyncRefreshAgeMs,
      refreshNearby,
      shouldRefreshSnapshot,
    ]
  );

  const syncOnForeground = useCallback(async () => {
    await syncRadarAtCurrentLocation('foreground');
  }, [syncRadarAtCurrentLocation]);

  const syncOnTabFocus = useCallback(async () => {
    const now = Date.now();
    if (now - lastTabFocusSyncAtRef.current < TAB_FOCUS_SYNC_THROTTLE_MS) {
      return;
    }

    lastTabFocusSyncAtRef.current = now;
    await syncRadarAtCurrentLocation('tab-focus');
  }, [syncRadarAtCurrentLocation]);

  useEffect(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      void sendHeartbeatNow();
    }, heartbeatIntervalMs);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [heartbeatIntervalMs, sendHeartbeatNow]);

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
    return () => {
      void disconnectRealtime();
    };
  }, [disconnectRealtime]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[Radar] Hook state:', {
      radarItems: radarItems.length,
      isRadarLoading,
      isRealtimeConnected,
      hasLocation: Boolean(currentLocation),
    });
  }, [currentLocation, isRadarLoading, isRealtimeConnected, radarItems.length]);

  return {
    radarItems,
    isRadarLoading,
    isRealtimeConnected,
    lastUpdatedAt,
    currentLocation,
    handleUserLocationChange,
    refreshNearby,
    syncOnTabFocus,
  };
};

export default useLiveRadar;
