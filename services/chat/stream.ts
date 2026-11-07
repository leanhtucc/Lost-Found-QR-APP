/**
 * Stream Chat client (singleton).
 *
 * Registered users get a token from GET /api/stream/token; guest finders from
 * POST /api/guest/stream-token (sent with the guest access token by apiClient).
 */

import { StreamChat } from 'stream-chat';
import { apiClient } from '@services/http';
import { buildApiUrl, buildStreamUrl } from '@services/shared/url';
import { guestSessionStorage } from '@/storage/guestSession';

interface StreamCredentials {
  token: string;
  apiKey: string;
  userId: string;
}

const readCredentials = async (response: Response): Promise<StreamCredentials> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `HTTP ${response.status}`);
  }
  const data = body?.data;
  if (!data?.token || !data?.apiKey || !data?.userId) {
    throw new Error('Chat chưa được cấu hình trên máy chủ.');
  }
  return { token: data.token, apiKey: data.apiKey, userId: data.userId };
};

/** Fetch a fresh token. A stored guest session for this channel takes priority. */
export const fetchStreamCredentials = async (channelId?: string): Promise<StreamCredentials> => {
  const guest = await guestSessionStorage.get();
  if (guest && (!channelId || guest.channelId === channelId)) {
    const response = await apiClient.fetch(buildApiUrl('guest', 'stream-token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return readCredentials(response);
  }

  const response = await apiClient.fetch(buildStreamUrl('token'), { method: 'GET' });
  return readCredentials(response);
};

let connecting: Promise<StreamChat> | null = null;
let currentClient: StreamChat | null = null;

/** Connect (or reuse) the Stream client for whoever owns the given channel. */
export const connectStreamClient = async (channelId?: string): Promise<StreamChat> => {
  if (connecting) return connecting;

  connecting = (async () => {
    const initial = await fetchStreamCredentials(channelId);
    const client = StreamChat.getInstance(initial.apiKey);

    if (client.userID && client.userID !== initial.userId) {
      await client.disconnectUser();
    }

    if (client.userID !== initial.userId) {
      let first = true;
      await client.connectUser({ id: initial.userId }, async () => {
        if (first) {
          first = false;
          return initial.token;
        }
        return (await fetchStreamCredentials(channelId)).token;
      });
    }

    currentClient = client;
    return client;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
};

/** Disconnect on logout / guest session end. */
export const disconnectStreamClient = async (): Promise<void> => {
  const client = currentClient;
  currentClient = null;
  if (client?.userID) {
    await client.disconnectUser().catch(() => undefined);
  }
};
