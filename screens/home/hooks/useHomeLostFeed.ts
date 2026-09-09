import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  HomeLostFeedCard,
  HomeLostFeedPin,
  RadarRealtimeLostItemPayload,
  RadarRealtimeRemovedPayload,
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

const DEFAULT_RADIUS_METERS = 10000; // 10 km chuẩn backend
const MIN_RADIUS_METERS = 1;
const MAX_RADIUS_METERS = 10000;
const HEARTBEAT_INTERVAL_MS = 30000; // 30 giây gửi heartbeat một lần
const SNAPSHOT_REFRESH_DISTANCE_METERS = 500; // Load lại feed nếu di chuyển > 500m
const SNAPSHOT_REFRESH_INTERVAL_MS = 300000; // 5 phút refresh lại snapshot
const ERROR_THROTTLE_MS = 6000;
const FOREGROUND_SYNC_THROTTLE_MS = 10000; // 10 giây throttle
const TAB_FOCUS_SYNC_THROTTLE_MS = 10000;

interface RadarCoordinates {
  latitude: number;
  longitude: number;
}

interface LastSnapshotState {
  location: RadarCoordinates;
  timestamp: number;
}

interface UseHomeLostFeedOptions {
  radiusMeters?: number;
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
  onError,
}: UseHomeLostFeedOptions = {}) => {
  const normalizedRadius = clampRadius(radiusMeters);

  const [mapPins, setMapPins] = useState<HomeLostFeedPin[]>([]);
  const [lostFeedCards, setLostFeedCards] = useState<HomeLostFeedCard[]>([]);
  const [myLostCount, setMyLostCount] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
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
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const notifyError = useCallback((fallbackMessage: string, error?: unknown) => {
    const now = Date.now();
    if (now - lastErrorAtRef.current < ERROR_THROTTLE_MS) {
      return;
    }

    lastErrorAtRef.current = now;
    const message = error instanceof Error ? error.message : fallbackMessage;

    if (onErrorRef.current) {
      onErrorRef.current(message);
    }
  }, []);

  const emitSubscribe = useCallback(
    async (socket: RadarSocket, coords: RadarCoordinates) => {
      const ack = await subscribeRadar(socket, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius: normalizedRadius,
      });

      if (__DEV__) {
        console.log('[RadarSocket] Subscribed radar:', ack);
      }
    },
    [normalizedRadius]
  );

  const sendHeartbeat = useCallback(
    async (coords?: RadarCoordinates) => {
      const socket = socketRef.current;
      const targetCoords = coords || locationRef.current;

      if (!socket || !socket.connected || !targetCoords) {
        return;
      }

      await sendRadarHeartbeat(socket, {
        latitude: targetCoords.latitude,
        longitude: targetCoords.longitude,
        radius: normalizedRadius,
      });
    },
    [normalizedRadius]
  );

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
        if (__DEV__) console.log('[RadarSocket] Connected, socket id:', socket.id);
        const coords = locationRef.current;
        if (coords) {
          void emitSubscribe(socket, coords);
        }
      });

      socket.on('disconnect', () => {
        setIsRealtimeConnected(false);
        if (__DEV__) console.log('[RadarSocket] Disconnected');
      });

      socket.on('connect_error', (error: Error) => {
        console.warn('[RadarSocket] Connection error:', error.message);
      });

      // 3.3. Lắng nghe đồ mất mới: radar:new-lost-item
      socket.on('radar:new-lost-item', (item: RadarRealtimeLostItemPayload) => {
        if (!item || !item.itemId) return;

        if (__DEV__) {
          console.log('[RadarSocket] Received radar:new-lost-item:', item.itemId);
        }

        const distanceMeters =
          typeof item.distanceMeters === 'number' ? Math.round(item.distanceMeters) : null;
        const distanceLabel = distanceMeters !== null ? `${distanceMeters}m` : null;

        const newCard: HomeLostFeedCard = {
          itemId: item.itemId,
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
          reportType: 'LOST',
        };

        const newPin: HomeLostFeedPin = {
          itemId: item.itemId,
          lat: item.latitude,
          lng: item.longitude,
          isOwn: false,
        };

        // 1. Thêm marker vào bản đồ (pin)
        // 2. Chèn card lên đầu danh sách BottomSheet
        // Luôn giữ tỷ lệ 1:1, cùng thứ tự, cùng ID
        setLostFeedCards(prevCards => {
          const filtered = prevCards.filter(card => card.itemId !== item.itemId);
          return [newCard, ...filtered];
        });

        setMapPins(prevPins => {
          const filtered = prevPins.filter(pin => pin.itemId !== item.itemId);
          return [newPin, ...filtered];
        });

        setNearbyCount(prev => prev + 1);
        setLastUpdatedAt(new Date().toISOString());
      });

      // 3.4. Lắng nghe đồ đã được tìm thấy / hủy báo mất: radar:lost-item-removed
      socket.on('radar:lost-item-removed', (data: RadarRealtimeRemovedPayload) => {
        if (!data || !data.itemId) return;

        if (__DEV__) {
          console.log('[RadarSocket] Received radar:lost-item-removed:', data.itemId, data.status);
        }

        // Xóa item khỏi danh sách cards và xóa marker tương ứng trên bản đồ theo itemId
        setLostFeedCards(prevCards => {
          const targetCard = prevCards.find(card => card.itemId === data.itemId);
          if (targetCard) {
            if (targetCard.isOwn) {
              setMyLostCount(prev => Math.max(0, prev - 1));
            } else {
              setNearbyCount(prev => Math.max(0, prev - 1));
            }
          }
          return prevCards.filter(card => card.itemId !== data.itemId);
        });

        setMapPins(prevPins => prevPins.filter(pin => pin.itemId !== data.itemId));
        setLastUpdatedAt(new Date().toISOString());
      });
    } catch (error) {
      notifyError('Không thể kết nối Socket Radar.', error);
    }
  }, [emitSubscribe, notifyError]);

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
      const targetCoords = coords || locationRef.current;

      // Tuyệt đối không gọi API nếu thiếu tọa độ GPS (bắt buộc theo backend contract mới)
      if (!targetCoords) {
        if (__DEV__) {
          console.log('[HomeFeed] Skipping feed fetch: GPS coordinates not available yet');
        }
        return;
      }

      if (snapshotInFlightRef.current) {
        return;
      }

      snapshotInFlightRef.current = true;
      setIsRadarLoading(true);

      try {
        const data = await radarApi.getHomeLostFeed({
          lat: targetCoords.latitude,
          lng: targetCoords.longitude,
          radius: normalizedRadius,
        });

        setMapPins(data.pins);
        setLostFeedCards(data.cards);
        setMyLostCount(data.myLostCount);
        setNearbyCount(data.nearbyCount);
        setLastUpdatedAt(new Date().toISOString());

        lastSnapshotRef.current = {
          location: targetCoords,
          timestamp: Date.now(),
        };

        if (__DEV__) {
          console.log('[HomeFeed] Loaded lost feed:', {
            myLostCount: data.myLostCount,
            nearbyCount: data.nearbyCount,
            cardsCount: data.cards.length,
            pinsCount: data.pins.length,
          });
        }
      } catch (error) {
        notifyError('Không thể tải dữ liệu Radar Feed.', error);
      } finally {
        snapshotInFlightRef.current = false;
        setIsRadarLoading(false);
      }
    },
    [normalizedRadius, notifyError]
  );

  const handleUserLocationChange = useCallback(
    (coords: RadarCoordinates) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      const isFirstLocation = !locationRef.current;
      locationRef.current = coords;
      setCurrentLocation(coords);

      void ensureSocketConnection();

      if (socketRef.current?.connected) {
        void emitSubscribe(socketRef.current, coords);
        void sendHeartbeat(coords);
      }

      if (isFirstLocation || shouldRefreshSnapshot(coords)) {
        void refreshLostFeed(coords);
      }
    },
    [emitSubscribe, ensureSocketConnection, refreshLostFeed, sendHeartbeat, shouldRefreshSnapshot]
  );

  const syncOnForeground = useCallback(async () => {
    const coords = locationRef.current;
    if (!coords) return;

    await ensureSocketConnection();
    if (socketRef.current?.connected) {
      await emitSubscribe(socketRef.current, coords);
      await sendHeartbeat(coords);
    }

    if (shouldRefreshSnapshot(coords)) {
      await refreshLostFeed(coords);
    }
  }, [
    emitSubscribe,
    ensureSocketConnection,
    refreshLostFeed,
    sendHeartbeat,
    shouldRefreshSnapshot,
  ]);

  const syncOnTabFocus = useCallback(async () => {
    const now = Date.now();
    if (now - lastTabFocusSyncAtRef.current < TAB_FOCUS_SYNC_THROTTLE_MS) {
      return;
    }
    lastTabFocusSyncAtRef.current = now;

    const coords = locationRef.current;
    if (!coords) return;

    if (!lastSnapshotRef.current || shouldRefreshSnapshot(coords)) {
      await refreshLostFeed(coords);
    }
  }, [refreshLostFeed, shouldRefreshSnapshot]);

  // Thiết lập định kỳ gửi radar:heartbeat mỗi 30 - 60 giây
  useEffect(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [sendHeartbeat]);

  // Lắng nghe thay đổi trạng thái ứng dụng (foreground / background)
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

  // Cleanup socket khi hook unmount
  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      if (socket) {
        socketRef.current = null;
        socket.removeAllListeners();
        try {
          if (socket.connected) {
            void unsubscribeRadar(socket);
          }
        } catch {
          // ignore
        }
        socket.disconnect();
      }
    };
  }, []);

  return {
    mapPins,
    lostFeedCards,
    myLostCount,
    nearbyCount,
    isRadarLoading,
    isRealtimeConnected,
    lastUpdatedAt,
    currentLocation,
    handleUserLocationChange,
    refreshLostFeed,
    syncOnTabFocus,
  };
};

export default useHomeLostFeed;
