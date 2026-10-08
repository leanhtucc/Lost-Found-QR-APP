import { ENV } from '@/constants/environment';
import { sessionEvents } from '@/lib/sessionEvents';
import { authStorage } from '@/storage/auth';

import { ApiError, BackendErrorShape } from './apiError';

type AuthMode = 'required' | 'optional' | 'none';

export interface ApiRequestOptions extends RequestInit {
  auth?: AuthMode;
  skipAuth?: boolean;
  skipRefresh?: boolean;
  timeoutMs?: number;
}

export interface ApiEnvelope<T> {
  status?: number;
  success: boolean;
  message?: string;
  data?: T;
  error?: BackendErrorShape | string;
  timestamp?: string;
}

const DEFAULT_TIMEOUT_MS = 15_000;
export interface RefreshedSession {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<RefreshedSession> | null = null;
let sessionExpiryPromise: Promise<void> | null = null;

const resolveUrl = (input: string): string => {
  if (/^https?:\/\//i.test(input)) return input;
  return `${ENV.API_URL.replace(/\/+$/, '')}/${input.replace(/^\/+/, '')}`;
};

const normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!headers) return result;

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) result[key.toLowerCase()] = String(value);
  });
  return result;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
};

const expireSessionOnce = async (): Promise<void> => {
  if (!sessionExpiryPromise) {
    sessionExpiryPromise = (async () => {
      await authStorage.clearAll();
      sessionEvents.emitSessionExpired();
    })();
  }
  return sessionExpiryPromise;
};

const executeFetch = async (
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const callerSignal = options.signal;
  const onCallerAbort = () => controller.abort();
  callerSignal?.addEventListener('abort', onCallerAbort);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !callerSignal?.aborted) throw ApiError.timeout();
    if (error instanceof ApiError) throw error;
    throw ApiError.network(error);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
};

const refreshAccessToken = async (): Promise<RefreshedSession> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await authStorage.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('Phiên đăng nhập đã hết hạn.', 401, 'UNAUTHORIZED');
    }

    const response = await executeFetch(
      `${ENV.API_URL.replace(/\/+$/, '')}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
      DEFAULT_TIMEOUT_MS
    );
    const payload =
      await parseJsonSafely<ApiEnvelope<{ accessToken?: string; refreshToken?: string }>>(response);
    const accessToken = payload?.data?.accessToken;
    const nextRefreshToken = payload?.data?.refreshToken;

    if (!response.ok || !accessToken || !nextRefreshToken) {
      const backendError =
        payload?.error && typeof payload.error === 'object' ? payload.error : undefined;
      throw new ApiError(
        payload?.message || 'Phiên đăng nhập đã hết hạn.',
        response.status || 401,
        backendError?.code || 'UNAUTHORIZED',
        backendError?.details || backendError?.fields
      );
    }

    await authStorage.saveTokens(accessToken, nextRefreshToken);
    sessionExpiryPromise = null;
    return { accessToken, refreshToken: nextRefreshToken };
  })()
    .catch(async error => {
      await expireSessionOnce();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const fetchWithPolicy = async (
  input: string,
  options: ApiRequestOptions = {},
  hasRetried = false
): Promise<Response> => {
  const {
    auth = options.skipAuth ? 'none' : 'required',
    skipAuth: _skipAuth,
    skipRefresh = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...requestOptions
  } = options;
  const headers = normalizeHeaders(requestOptions.headers);
  const token = auth === 'none' ? null : await authStorage.getAccessToken();

  if (token && sessionExpiryPromise && !refreshPromise) sessionExpiryPromise = null;
  if (auth === 'required' && !token) {
    await expireSessionOnce();
    throw new ApiError('Vui lòng đăng nhập lại.', 401, 'UNAUTHORIZED');
  }

  delete headers.authorization;
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
  if (requestOptions.body && !isFormData && !headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  const response = await executeFetch(resolveUrl(input), { ...requestOptions, headers }, timeoutMs);

  const canRefresh =
    response.status === 401 && !hasRetried && !skipRefresh && auth !== 'none' && Boolean(token);

  if (!canRefresh) return response;

  await refreshAccessToken();
  const retriedResponse = await fetchWithPolicy(input, options, true);
  if (retriedResponse.status === 401) await expireSessionOnce();
  return retriedResponse;
};

const toApiError = async (response: Response): Promise<ApiError> => {
  const payload = await parseJsonSafely<ApiEnvelope<unknown>>(response);
  const backendError =
    payload?.error && typeof payload.error === 'object' ? payload.error : undefined;
  return new ApiError(
    payload?.message || `Yêu cầu thất bại (${response.status})`,
    response.status,
    backendError?.code || `HTTP_${response.status}`,
    backendError?.details || backendError?.fields
  );
};

export const apiClient = {
  fetch: fetchWithPolicy,
  refreshSession: refreshAccessToken,

  async request<T>(input: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await fetchWithPolicy(input, options);
    if (!response.ok) throw await toApiError(response);
    const payload = await parseJsonSafely<ApiEnvelope<T> | T>(response);
    if (payload && typeof payload === 'object' && 'success' in payload) {
      const envelope = payload as ApiEnvelope<T>;
      return (envelope.data !== undefined ? envelope.data : envelope) as T;
    }
    return payload as T;
  },
};

export const resetApiClientStateForTests = (): void => {
  refreshPromise = null;
  sessionExpiryPromise = null;
};
