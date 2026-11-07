import { sessionEvents } from '@/lib/sessionEvents';
import { authStorage } from '@/storage/auth';
import { apiClient, resetApiClientStateForTests } from '../apiClient';

const authState = {
  accessToken: 'access-old' as string | null,
  refreshToken: 'refresh-old' as string | null,
};
const mockGuestSessionState: { session: any } = { session: null };

jest.mock('@/constants/environment', () => ({
  ENV: { API_URL: 'https://api.example.test' },
}));
jest.mock('@/storage/auth', () => ({
  authStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveTokens: jest.fn(),
    clearAll: jest.fn(),
  },
}));
jest.mock('@/storage/guestSession', () => ({
  guestSessionStorage: {
    get: jest.fn(async () => mockGuestSessionState.session),
    save: jest.fn(async (session: unknown) => {
      mockGuestSessionState.session = session;
    }),
    clear: jest.fn(async () => {
      mockGuestSessionState.session = null;
    }),
  },
}));
jest.mock('@/lib/sessionEvents', () => ({
  sessionEvents: { emitSessionExpired: jest.fn() },
}));

const mockAuthStorage = authStorage as jest.Mocked<typeof authStorage>;
const mockEmitSessionExpired = sessionEvents.emitSessionExpired as jest.Mock;

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn(async () => JSON.stringify(body)),
  }) as unknown as Response;

describe('central apiClient', () => {
  beforeEach(() => {
    resetApiClientStateForTests();
    authState.accessToken = 'access-old';
    authState.refreshToken = 'refresh-old';
    mockGuestSessionState.session = null;
    jest.clearAllMocks();
    mockAuthStorage.getAccessToken.mockImplementation(async () => authState.accessToken);
    mockAuthStorage.getRefreshToken.mockImplementation(async () => authState.refreshToken);
    mockAuthStorage.saveTokens.mockImplementation(async (accessToken, refreshToken) => {
      authState.accessToken = accessToken;
      authState.refreshToken = refreshToken;
    });
    mockAuthStorage.clearAll.mockImplementation(async () => {
      authState.accessToken = null;
      authState.refreshToken = null;
    });
  });

  it('attaches the stored access token to authenticated requests', async () => {
    global.fetch = jest.fn(async () => jsonResponse(200, {}));

    await apiClient.fetch('/api/items');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.test/api/items',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer access-old' }),
      })
    );
  });

  it('does not attach authorization to a public request', async () => {
    global.fetch = jest.fn(async () => jsonResponse(200, {}));

    await apiClient.fetch('/api/auth/login', { auth: 'none', method: 'POST' });

    const options = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('never attaches a guest token to item or stream token requests', async () => {
    mockGuestSessionState.session = {
      guestId: 'guest-1',
      returnSessionId: 'return-1',
      channelId: 'channel-1',
      guestAccessToken: 'guest-secret',
      expiresAt: '2099-01-01T00:00:00.000Z',
      chatToken: 'stream-token',
    };
    authState.accessToken = null;
    global.fetch = jest.fn(async () => jsonResponse(200, {}));

    await apiClient.fetch('/api/items/item-1', { auth: 'none' });
    await apiClient.fetch('/api/stream/token', { auth: 'none', method: 'POST' });

    const headers = (global.fetch as jest.Mock).mock.calls.map(([, options]) => options.headers);
    expect(headers.every(value => value.Authorization === undefined)).toBe(true);
  });

  it('refreshes a guest token once after a return request returns 401', async () => {
    mockGuestSessionState.session = {
      guestId: 'guest-1',
      returnSessionId: 'return-1',
      channelId: 'channel-1',
      guestAccessToken: 'guest-token-old',
      expiresAt: '2099-01-01T00:00:00.000Z',
      chatToken: 'stream-token',
    };
    authState.accessToken = null;
    let returnCalls = 0;
    global.fetch = jest.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith('/api/guest/refresh')) {
        return jsonResponse(200, {
          success: true,
          data: {
            guestAccessToken: 'guest-token-new',
            guestAccessExpiresAt: '2099-01-01T01:00:00.000Z',
          },
        });
      }
      returnCalls += 1;
      if (returnCalls === 1) return jsonResponse(401, { message: 'expired' });
      expect((options?.headers as Record<string, string>).Authorization).toBe(
        'Bearer guest-token-new'
      );
      return jsonResponse(200, { success: true, data: { id: 'return-1' } });
    }) as jest.Mock;

    const response = await apiClient.fetch('/api/v1/returns/return-1');

    expect(response.status).toBe(200);
    expect(returnCalls).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('clears the guest session after a forbidden guest call', async () => {
    mockGuestSessionState.session = {
      guestId: 'guest-1',
      returnSessionId: 'return-1',
      channelId: 'channel-1',
      guestAccessToken: 'guest-token',
      expiresAt: '2099-01-01T00:00:00.000Z',
      chatToken: 'stream-token',
    };
    authState.accessToken = null;
    global.fetch = jest.fn(async () => jsonResponse(403, { message: 'forbidden' }));

    await expect(apiClient.fetch('/api/returns/return-1')).rejects.toMatchObject({
      status: 403,
      code: 'GUEST_SESSION_EXPIRED',
    });
    expect(mockGuestSessionState.session).toBeNull();
  });

  it('parses a normal 200 backend envelope', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(200, { success: true, data: { id: 'item-1' } })
    );

    await expect(apiClient.request<{ id: string }>('/api/items/item-1')).resolves.toEqual({
      id: 'item-1',
    });
  });

  it('parses a 400 backend error into ApiError', async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(400, {
        success: false,
        message: 'Request data is invalid',
        error: { code: 'VALIDATION_ERROR', fields: { name: 'Required' } },
      })
    );

    await expect(apiClient.request('/api/items', { method: 'POST' })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      kind: 'validation',
      details: { name: 'Required' },
    });
  });

  it('refreshes once and retries the original request after 401', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: 'UNAUTHORIZED' } }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: { accessToken: 'access-new', refreshToken: 'refresh-new' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { success: true }));

    const response = await apiClient.fetch('/api/items');

    expect(response.status).toBe(200);
    expect(mockAuthStorage.saveTokens).toHaveBeenCalledWith('access-new', 'refresh-new');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('uses exactly one refresh request for three parallel 401 responses', async () => {
    global.fetch = jest.fn(async (url: string) => {
      if (url.endsWith('/api/auth/refresh')) {
        await new Promise(resolve => setTimeout(resolve, 5));
        return jsonResponse(200, {
          success: true,
          data: { accessToken: 'access-new', refreshToken: 'refresh-new' },
        });
      }
      return authState.accessToken === 'access-old'
        ? jsonResponse(401, { error: { code: 'UNAUTHORIZED' } })
        : jsonResponse(200, { success: true });
    }) as jest.Mock;

    const responses = await Promise.all([
      apiClient.fetch('/api/items'),
      apiClient.fetch('/api/home'),
      apiClient.fetch('/v1/notifications'),
    ]);

    expect(responses.every(response => response.status === 200)).toBe(true);
    const refreshCalls = (global.fetch as jest.Mock).mock.calls.filter(([url]) =>
      String(url).endsWith('/api/auth/refresh')
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it('clears and emits session expiration once when shared refresh fails', async () => {
    global.fetch = jest.fn(async (url: string) =>
      url.endsWith('/api/auth/refresh')
        ? jsonResponse(401, {
            success: false,
            message: 'Refresh token expired',
            error: { code: 'REFRESH_TOKEN_EXPIRED' },
          })
        : jsonResponse(401, { error: { code: 'UNAUTHORIZED' } })
    ) as jest.Mock;

    const results = await Promise.allSettled([
      apiClient.fetch('/api/items'),
      apiClient.fetch('/api/home'),
      apiClient.fetch('/v1/notifications'),
    ]);

    expect(results.every(result => result.status === 'rejected')).toBe(true);
    expect(mockAuthStorage.clearAll).toHaveBeenCalledTimes(1);
    expect(mockEmitSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('does not enter a refresh loop when the single retry is still 401', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          data: { accessToken: 'access-new', refreshToken: 'refresh-new' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(401, {}));

    const response = await apiClient.fetch('/api/items');

    expect(response.status).toBe(401);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('normalizes network failures', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('socket failed');
    });

    await expect(apiClient.fetch('/api/items')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      kind: 'network',
    });
  });

  it('aborts and classifies timed out requests', async () => {
    global.fetch = jest.fn(
      (_url: string, options?: RequestInit) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        })
    ) as jest.Mock;

    await expect(apiClient.fetch('/api/items', { timeoutMs: 1 })).rejects.toMatchObject({
      code: 'TIMEOUT',
      kind: 'timeout',
    });
  });
});
