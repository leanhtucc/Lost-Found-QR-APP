import { getApiUrl } from '@constants/environment';
import { io, Socket } from 'socket.io-client';
import {
  RadarHeartbeatPayload,
  RadarHeartbeatAck,
  RadarRealtimeLostItemPayload,
  RadarRealtimeRemovedPayload,
  RadarSubscribePayload,
  RadarSubscribeAck,
  RadarUnsubscribeAck,
} from '@/types/radar';

const ACK_TIMEOUT_MS = 8000;

interface RadarServerToClientEvents {
  'radar:new-lost-item': (payload: RadarRealtimeLostItemPayload) => void;
  'radar:lost-item-removed': (payload: RadarRealtimeRemovedPayload) => void;
}

interface RadarClientToServerEvents {
  'radar:subscribe': (
    payload: RadarSubscribePayload,
    ack?: (response: RadarSubscribeAck) => void
  ) => void;
  'radar:heartbeat': (
    payload: RadarHeartbeatPayload,
    ack?: (response: RadarHeartbeatAck) => void
  ) => void;
  'radar:unsubscribe': (ack?: (response: RadarUnsubscribeAck) => void) => void;
}

export type RadarSocket = Socket<RadarServerToClientEvents, RadarClientToServerEvents>;

const resolveSocketBaseUrl = (): string => {
  const apiUrl = getApiUrl().replace(/\/+$/, '');

  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }

  return apiUrl;
};

const withAckTimeout = <TAck>(
  execute: (done: (ack: TAck) => void) => void,
  fallback: TAck
): Promise<TAck> => {
  return new Promise(resolve => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      resolve(fallback);
    }, ACK_TIMEOUT_MS);

    execute(ack => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve(ack);
    });
  });
};

export const createRadarSocket = (accessToken?: string | null): RadarSocket => {
  return io(resolveSocketBaseUrl(), {
    path: '/socket.io',
    auth: accessToken
      ? {
          token: accessToken,
        }
      : undefined,
    transports: ['websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionDelay: 1200,
    reconnectionAttempts: 8,
  });
};

export const subscribeRadar = (
  socket: RadarSocket,
  payload: RadarSubscribePayload
): Promise<RadarSubscribeAck> => {
  return withAckTimeout<RadarSubscribeAck>(
    done => {
      socket.emit('radar:subscribe', payload, done);
    },
    {
      success: false,
      message: 'Subscribe timeout',
    }
  );
};

export const sendRadarHeartbeat = (
  socket: RadarSocket,
  payload: RadarHeartbeatPayload
): Promise<RadarHeartbeatAck> => {
  return withAckTimeout<RadarHeartbeatAck>(
    done => {
      socket.emit('radar:heartbeat', payload, done);
    },
    {
      success: false,
      message: 'Heartbeat timeout',
    }
  );
};

export const unsubscribeRadar = (socket: RadarSocket): Promise<RadarUnsubscribeAck> => {
  return withAckTimeout<RadarUnsubscribeAck>(
    done => {
      socket.emit('radar:unsubscribe', done);
    },
    {
      success: true,
      message: 'Unsubscribe without ack',
    }
  );
};
