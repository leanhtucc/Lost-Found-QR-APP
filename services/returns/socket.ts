/**
 * Return Session Socket Service
 * Quản lý kết nối WebSocket độc lập theo từng phiên hoàn trả (returnSessionId).
 * Tách biệt hoàn toàn với radar socket công khai để bảo vệ vị trí chính xác của người dùng.
 */

import { getApiUrl } from '@constants/environment';
import { io, Socket } from 'socket.io-client';
import {
  LiveLocation,
  HandoverDetails,
  RewardPayout,
  ReturnSession,
  ReturnSessionStatus,
} from '@/types/return-flow';
import { authStorage } from '@/storage/auth';

export interface ReturnServerToClientEvents {
  'return:location-updated': (payload: {
    sessionId: string;
    userId: string;
    location: LiveLocation;
  }) => void;
  'return:participant-arrived': (payload: { sessionId: string; userId: string }) => void;
  'return:handover-updated': (payload: {
    sessionId: string;
    handover: HandoverDetails;
    status: ReturnSessionStatus;
  }) => void;
  'return:reward-updated': (payload: {
    sessionId: string;
    reward: RewardPayout;
    status: ReturnSessionStatus;
  }) => void;
  'return:session-updated': (payload: { sessionId: string; session: ReturnSession }) => void;
}

export interface ReturnClientToServerEvents {
  'return:join': (payload: { sessionId: string }) => void;
  'return:leave': (payload: { sessionId: string }) => void;
  // Zero-Trust: Server tự xác định userId qua auth JWT, client không truyền userId
  'return:update-location': (payload: { sessionId: string; location: LiveLocation }) => void;
}

export type ReturnSocket = Socket<ReturnServerToClientEvents, ReturnClientToServerEvents>;

const resolveSocketBaseUrl = (): string => {
  const apiUrl = getApiUrl().replace(/\/+$/, '');
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  return apiUrl;
};

export const createReturnSocket = (accessToken: string): ReturnSocket => {
  return io(resolveSocketBaseUrl(), {
    path: '/socket.io',
    auth: {
      token: accessToken,
    },
    transports: ['websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionDelay: 1200,
    reconnectionAttempts: 6,
  });
};

// ─── Return Socket Singleton Manager ─────────────────────────────────────────

class ReturnSocketManager {
  private socket: ReturnSocket | null = null;
  private currentSessionId: string | null = null;
  private isConnecting: boolean = false;

  getSocket(): ReturnSocket | null {
    return this.socket;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  async connect(sessionId: string): Promise<ReturnSocket | null> {
    if (this.socket?.connected && this.currentSessionId === sessionId) {
      return this.socket;
    }

    if (this.socket && this.currentSessionId && this.currentSessionId !== sessionId) {
      this.socket.emit('return:leave', { sessionId: this.currentSessionId });
    }

    this.currentSessionId = sessionId;

    try {
      this.isConnecting = true;
      const token = await authStorage.getAccessToken();
      if (!token) {
        console.warn('[ReturnSocket] No access token available to connect');
        return null;
      }

      if (!this.socket || !this.socket.connected) {
        this.socket = createReturnSocket(token);

        this.socket.on('connect', () => {
          if (this.currentSessionId) {
            this.socket?.emit('return:join', { sessionId: this.currentSessionId });
          }
        });

        this.socket.on('disconnect', reason => {
          console.log('[ReturnSocket] Disconnected:', reason);
        });
      } else {
        this.socket.emit('return:join', { sessionId });
      }

      return this.socket;
    } catch (err) {
      console.warn('[ReturnSocket] Connect failed:', err);
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  emitLocation(sessionId: string, location: LiveLocation): boolean {
    if (!this.socket || !this.socket.connected) {
      // If not connected yet, try connecting in background
      if (!this.isConnecting) {
        void this.connect(sessionId);
      }
      return false;
    }

    this.socket.emit('return:update-location', {
      sessionId,
      location,
    });
    return true;
  }

  disconnect(sessionId?: string): void {
    if (!this.socket) return;

    const targetSession = sessionId || this.currentSessionId;
    if (targetSession) {
      this.socket.emit('return:leave', { sessionId: targetSession });
    }

    if (!sessionId || sessionId === this.currentSessionId) {
      this.socket.disconnect();
      this.socket = null;
      this.currentSessionId = null;
    }
  }
}

export const returnSocketManager = new ReturnSocketManager();

export const emitReturnLocation = (sessionId: string, location: LiveLocation): boolean => {
  return returnSocketManager.emitLocation(sessionId, location);
};
