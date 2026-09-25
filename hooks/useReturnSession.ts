/**
 * useReturnSession Hook
 * Quản lý vòng đời phiên hoàn trả đồ cho màn hình Chat và các màn hình con.
 * Tự động đồng bộ với backend khi App active lại và kết nối Socket phòng return:${sessionId}.
 */

import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useReturnStore } from '@/services/returns/store';
import { useAuthContext } from '@/contexts/AuthContext';
import { returnSocketManager, ReturnSocket } from '@/services/returns/socket';

interface UseReturnSessionOptions {
  channelId?: string;
  sessionId?: string;
  autoRefresh?: boolean;
}

const PRIVATE_REVOKED_STATES = new Set([
  'COMPLETED',
  'MEETUP_CANCELLED',
  'TRACKING_EXPIRED',
  'HANDOVER_DISPUTED',
  'REFUND_PENDING',
]);

export const useReturnSession = ({
  channelId,
  sessionId,
  autoRefresh = true,
}: UseReturnSessionOptions) => {
  const { user } = useAuthContext();
  const session = useReturnStore(state => state.session);
  const currentRole = useReturnStore(state => state.currentRole);
  const isLoading = useReturnStore(state => state.isLoading);
  const isSubmitting = useReturnStore(state => state.isSubmitting);
  const error = useReturnStore(state => state.error);
  const errorCode = useReturnStore(state => state.errorCode);
  const currentUserId = useReturnStore(state => state.currentUserId);
  const connectionState = useReturnStore(state => state.connectionState);

  const initSession = useReturnStore(state => state.initSession);
  const refreshSession = useReturnStore(state => state.refreshSession);
  const setPartnerLocation = useReturnStore(state => state.setPartnerLocation);
  const clearLiveLocations = useReturnStore(state => state.clearLiveLocations);
  const setConnectionState = useReturnStore(state => state.setConnectionState);

  // Initial load
  useEffect(() => {
    const load = async () => {
      if (channelId) {
        try {
          await initSession(channelId, user);
        } catch (err) {
          console.warn('[useReturnSession] Init session failed:', err);
        }
      } else if (sessionId) {
        try {
          await refreshSession(sessionId, user);
        } catch (err) {
          console.warn('[useReturnSession] Refresh session failed:', err);
        }
      }
    };

    void load();
  }, [channelId, sessionId, user, initSession, refreshSession]);

  // AppState focus sync
  useEffect(() => {
    if (!autoRefresh) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        void refreshSession(undefined, user);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [autoRefresh, refreshSession, user]);

  // Socket connection for this session room
  useEffect(() => {
    const currentSessionId = session?.id || sessionId;
    if (!currentSessionId) return;

    let socketInstance: ReturnSocket | null = null;

    const handleSessionUpdated = (payload: { sessionId: string }) => {
      if (payload.sessionId === currentSessionId) {
        void refreshSession(currentSessionId, user);
      }
    };

    const handleLocationUpdated = (payload: {
      sessionId: string;
      userId: string;
      location: any;
    }) => {
      if (
        payload.sessionId === currentSessionId &&
        payload.userId !== currentUserId &&
        payload.location
      ) {
        setPartnerLocation(payload.location);
      }
    };

    const handleParticipantArrived = (payload: { sessionId: string }) => {
      if (payload.sessionId === currentSessionId) {
        void refreshSession(currentSessionId, user);
      }
    };

    const handleHandoverUpdated = (payload: { sessionId: string }) => {
      if (payload.sessionId === currentSessionId) {
        void refreshSession(currentSessionId, user);
      }
    };

    const handleRewardUpdated = (payload: { sessionId: string }) => {
      if (payload.sessionId === currentSessionId) {
        void refreshSession(currentSessionId, user);
      }
    };

    const handleLocationCleared = (payload: { sessionId: string }) => {
      if (payload.sessionId === currentSessionId) {
        clearLiveLocations();
        void refreshSession(currentSessionId, user);
      }
    };

    const handleConnect = () => {
      setConnectionState('connected');
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
    };

    const handleConnectError = () => {
      setConnectionState('reconnecting');
    };

    const setupSocket = async () => {
      const socket = await returnSocketManager.connect(currentSessionId);
      if (!socket) return;
      socketInstance = socket;

      if (socket.connected) {
        setConnectionState('connected');
      }

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.on('return:session-updated', handleSessionUpdated);
      socket.on('return:location-updated', handleLocationUpdated);
      socket.on('return:participant-arrived', handleParticipantArrived);
      socket.on('return:handover-updated', handleHandoverUpdated);
      socket.on('return:reward-updated', handleRewardUpdated);
      socket.on('return:location-cleared', handleLocationCleared);
    };

    void setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleConnectError);
        socketInstance.off('return:session-updated', handleSessionUpdated);
        socketInstance.off('return:location-updated', handleLocationUpdated);
        socketInstance.off('return:participant-arrived', handleParticipantArrived);
        socketInstance.off('return:handover-updated', handleHandoverUpdated);
        socketInstance.off('return:reward-updated', handleRewardUpdated);
        socketInstance.off('return:location-cleared', handleLocationCleared);
        returnSocketManager.disconnect(currentSessionId);
      }
    };
  }, [
    session?.id,
    sessionId,
    currentUserId,
    user,
    setConnectionState,
    setPartnerLocation,
    clearLiveLocations,
    refreshSession,
  ]);

  useEffect(() => {
    if (session && PRIVATE_REVOKED_STATES.has(session.status)) {
      clearLiveLocations();
      returnSocketManager.disconnect(session.id);
    }
  }, [clearLiveLocations, session]);

  const manualRefresh = useCallback(() => {
    return refreshSession(undefined, user);
  }, [refreshSession, user]);

  return {
    session,
    currentRole,
    isLoading,
    isSubmitting,
    error,
    errorCode,
    connectionState,
    refresh: manualRefresh,
  };
};
