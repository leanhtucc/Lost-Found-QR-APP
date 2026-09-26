/**
 * Items API Service
 * Xử lý tất cả API calls liên quan đến Items
 */

import {
  CreateItemParams,
  DashboardData,
  Item,
  ItemApiResponse,
  ItemCategory,
  ItemStatus,
  ItemsSummary,
  ListItemsResponse,
  ScanGuestInitParams,
  ScanGuestInitResponse,
  ScanItemResponse,
  UpdateItemParams,
  UpdateStatusParams,
} from '@/types';
import {
  buildApiUrl,
  buildItemsUrl,
  buildScanUrl,
  buildV1Url,
  getFullImageUrl,
} from '@services/shared/url';
import { authStorage } from '@storage/auth';
import { authApi } from '@services/auth';
import { sessionEvents } from '@/lib/sessionEvents';

export interface EligibleForReportItem {
  /** Temporary compatibility alias returned by the backend. */
  id: string;
  item_id: string;
  name: string;
  category: string;
  image_url: string | null;
  details: {
    color: string | null;
    storage: string | null;
    serial: string | null;
  };
  has_insurance: boolean;
}

export class ItemsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ItemsApiError';
  }
}

export interface AnalyzeItemImageResult {
  name: string;
  category: string;
  /** color trả về ở top-level từ AI V2 */
  color: string;
  confidenceScore: number;
  imagePublicUrl?: string;
  filename?: string;
  details: {
    color: string;
    storage: string;
    serial: string;
    ai_visual_tags?: string[];
    ai_description?: string;
  };
}

export interface CreateGuardianItemPayload {
  name: string;
  category: string;
  imagePublicUrl?: string;
  details: {
    color?: string;
    storage?: string;
    model?: string;
    serial?: string;
    imei?: string;
    ai_visual_tags?: string[];
    ai_description?: string;
  };
  hasInsurance?: boolean;
}

export interface SelectionSummaryResponse {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  display_text: {
    primary: string;
    secondary: string;
    serial_number: string | null;
  };
  status_badges: {
    has_insurance: boolean;
    label: string;
    color_theme: 'SUCCESS' | 'STANDARD' | 'NONE';
  };
  ai_visual_tags: string[];
}

export interface CreateGuardianItemResult {
  /** cuid – dùng để build deep-link QR Code */
  qrCodeId: string;
  /** cuid – ID nội bộ của item */
  itemId: string;
  name: string;
  category: string;
  imagePublicUrl: string | null;
  details: {
    color: string | null;
    storage: string | null;
    serial: string | null;
  };
  hasInsurance: boolean;
}

interface EligibleForReportApiItem extends Omit<EligibleForReportItem, 'id' | 'item_id'> {
  id?: string;
  item_id?: string;
}

type EligibleForReportPayload = EligibleForReportApiItem[] | { data?: EligibleForReportApiItem[] };

interface UpdateStatusApiResponse extends Omit<ItemApiResponse<Item>, 'error'> {
  code?: string;
  error?: string | { code?: string; message?: string };
}

/** Response shape từ POST /v1/ai/analyze-item (Gemini 1.5 Flash) */
interface AnalyzeItemImageEnvelope {
  /** Tên gợi ý của vật phẩm */
  suggested_name?: string;
  category?: string;
  /** Màu trực tiếp ở top-level (không lồng trong details) */
  color?: string | null;
  confidence_score?: number;
  imagePublicUrl?: string;
  filename?: string;
  ai_visual_tags?: string[];
  description?: string;
}

/** Response shape từ POST /api/items */
interface CreateGuardianItemEnvelope {
  id?: string;
  /** cuid dùng để sinh QR deep-link */
  qrCodeId?: string;
  ownerId?: string;
  name?: string;
  category?: string;
  status?: string;
  imagePublicUrl?: string | null;
  hasInsurance?: boolean;
  details?: {
    color?: string | null;
    storage?: string | null;
    serial?: string | null;
  };
  createdAt?: string;
}

/**
 * Base URL cho Items API
 */
const getItemsApiUrl = () => buildItemsUrl();

/**
 * Helper function để lấy token
 */
const getToken = async (): Promise<string> => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

/**
 * Helper function để tạo headers
 */
const createHeaders = async (includeAuth = true): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Helper function để thực hiện fetch với Bearer token và auto-refresh khi gặp 401
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const existingHeaders = (options.headers as Record<string, string>) || {};
  let headers = await createHeaders(true);
  let response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...existingHeaders,
    },
  });

  if (response.status === 401) {
    if (__DEV__) {
      console.log('[ItemsAPI] 401 Unauthorized encountered, attempting refresh...');
    }
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResult = await authApi.refreshToken({ refreshToken });
      if (refreshResult.success && refreshResult.data) {
        if (__DEV__) {
          console.log('[ItemsAPI] Refresh token successful, retrying request...');
        }
        headers = await createHeaders(true);
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...existingHeaders,
          },
        });
        if (response.status !== 401) {
          return response;
        }
      }
      throw new Error(refreshResult.message || 'Token refresh failed');
    } catch (refreshErr) {
      console.warn('[ItemsAPI] Refresh failed, emitting session expired:', refreshErr);
      await authStorage.clearAll();
      sessionEvents.emitSessionExpired();
      throw new Error('Token expired');
    }
  }

  return response;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const normalizeItemStatus = (status: unknown): ItemStatus => {
  const normalized = typeof status === 'string' ? status.trim().toUpperCase() : '';

  switch (normalized) {
    case 'SAFE':
      return 'SAFE';
    case 'LOST':
      return 'LOST';
    case 'FOUND':
      return 'FOUND';
    case 'RESOLVED':
      return 'RESOLVED';
    default:
      return 'SAFE';
  }
};

const normalizeStatusFilter = (status: unknown): ItemStatus | undefined => {
  if (typeof status !== 'string') {
    return undefined;
  }

  const normalized = status.trim().toUpperCase();
  if (!normalized || normalized === 'ALL') {
    return undefined;
  }

  switch (normalized) {
    case 'SAFE':
    case 'LOST':
    case 'FOUND':
    case 'RESOLVED':
      return normalized;
    default:
      return undefined;
  }
};

const normalizeCategoryFilter = (category: unknown): ItemCategory | undefined => {
  if (typeof category !== 'string') {
    return undefined;
  }

  const normalized = category.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return normalized as ItemCategory;
};

const normalizeItem = (item: any): Item => {
  return {
    ...item,
    itemId: item.itemId || item.publicItemId || item.id,
    publicItemId: item.publicItemId || item.itemId,
    qrCodeId: item.qrCodeId || item.id,
    imagePublicUrl:
      typeof item.imagePublicUrl === 'string'
        ? getFullImageUrl(item.imagePublicUrl) || undefined
        : undefined,
    status: normalizeItemStatus(item.status),
  };
};

const normalizeListItemsResponse = (data: ListItemsResponse): ListItemsResponse => {
  return {
    ...data,
    items: Array.isArray(data.items) ? data.items.map(normalizeItem) : [],
  };
};

const normalizeScanResponse = (data: ScanItemResponse): ScanItemResponse => {
  return {
    ...data,
    item_info: {
      ...data.item_info,
      itemId: data.item_info.itemId || data.item_info.id,
      status: normalizeItemStatus(data.item_info.status),
    },
  };
};

/**
 * Items API
 */
export const itemsApi = {
  /**
   * Danh sách vật phẩm SAFE có thể báo mất ngay (Guardian flow)
   * GET /v1/items/eligible-for-report
   */
  async getEligibleForReportItems(): Promise<EligibleForReportItem[]> {
    const url = buildItemsUrl('eligible-for-report');

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const payload = await parseJsonSafely<ItemApiResponse<EligibleForReportPayload>>(response);

    if (!response.ok || !payload?.success) {
      const fallbackMessage = `Failed to fetch eligible report items (HTTP ${response.status})`;
      throw new Error(payload?.message || payload?.error || fallbackMessage);
    }

    const responseData = payload.data;
    const items = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

    return items.flatMap(item => {
      const itemId = String(item.item_id || item.id || '').trim();
      if (!itemId) {
        return [];
      }

      return [
        {
          id: itemId,
          item_id: itemId,
          name: String(item.name || 'Vật phẩm chưa đặt tên'),
          category: String(item.category || 'other'),
          image_url: typeof item.image_url === 'string' ? getFullImageUrl(item.image_url) : null,
          details: {
            color: typeof item.details?.color === 'string' ? item.details.color : null,
            storage: typeof item.details?.storage === 'string' ? item.details.storage : null,
            serial: typeof item.details?.serial === 'string' ? item.details.serial : null,
          },
          has_insurance: Boolean(item.has_insurance),
        },
      ];
    });
  },

  /**
   * Phân tích ảnh vật phẩm bằng Gemini AI để auto-fill form thêm mới
   * POST /v1/ai/analyze-item  ← V2 BREAKING CHANGE (cũ: analyze-image)
   * Content-Type: multipart/form-data, field name: "image"
   */
  async analyzeItemImage(imageUri: string): Promise<AnalyzeItemImageResult> {
    if (typeof imageUri !== 'string' || imageUri.trim().length === 0) {
      throw new Error('imageUri is required');
    }

    const token = await getToken();
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      name: 'item-image.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    // V2: endpoint đổi từ analyze-image → analyze-item (hỗ trợ cả /api và /v1)
    let response: Response;
    try {
      response = await fetch(buildApiUrl('ai', 'analyze-item'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok && (response.status === 404 || response.status === 405)) {
        response = await fetch(buildV1Url('ai', 'analyze-item'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }
    } catch {
      response = await fetch(buildV1Url('ai', 'analyze-item'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    const payload = await parseJsonSafely<ItemApiResponse<AnalyzeItemImageEnvelope>>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      const fallbackMessage = `Failed to analyze item image (HTTP ${response.status})`;
      throw new Error(payload?.message || payload?.error || fallbackMessage);
    }

    const confidenceScore =
      typeof payload.data.confidence_score === 'number' ? payload.data.confidence_score : 1;

    // V2: tên vật phẩm ở field suggested_name thay vì name
    const suggestedName = payload.data.suggested_name?.trim() || 'Vật phẩm mới';
    const category = payload.data.category?.trim() || 'other';
    // V2: color ở top-level, không lồng trong details
    const color = payload.data.color?.trim() || '';

    return {
      name: suggestedName,
      category,
      color,
      confidenceScore,
      imagePublicUrl: getFullImageUrl(payload.data.imagePublicUrl) || undefined,
      filename: payload.data.filename || undefined,
      details: {
        color,
        storage: '',
        serial: '',
        ai_visual_tags: payload.data.ai_visual_tags || [],
        ai_description: payload.data.description || '',
      },
    };
  },

  /**
   * Tạo vật phẩm mới theo contract Guardian API V2
   * POST /api/items  ← V2 BREAKING CHANGE (cũ: POST /v1/items)
   * Response: dùng qrCodeId (cuid) để build QR deep-link
   */
  async createGuardianItem(payload: CreateGuardianItemPayload): Promise<CreateGuardianItemResult> {
    if (!payload.name?.trim()) {
      throw new Error('name is required');
    }

    if (!payload.category?.trim()) {
      throw new Error('category is required');
    }

    // V2: dùng /api/items thay vì /v1/items
    const response = await fetchWithAuth(buildItemsUrl(), {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name.trim(),
        category: payload.category.trim(),
        // V2: field là imagePublicUrl (không phải image_url)
        imagePublicUrl: payload.imagePublicUrl || '',
        hasInsurance: Boolean(payload.hasInsurance),
        // V2: serial, color, storage nằm trong details
        details: {
          color: payload.details.color || null,
          storage: payload.details.storage || null,
          model: payload.details.model || null,
          serial: payload.details.serial || null,
          imei: payload.details.imei || null,
          ai_visual_tags: payload.details.ai_visual_tags || [],
          ai_description: payload.details.ai_description || null,
        },
      }),
    });

    const apiPayload = await parseJsonSafely<ItemApiResponse<CreateGuardianItemEnvelope>>(response);

    // V2: response chứa qrCodeId (cuid) – đây là field bắt buộc
    if (!response.ok || !apiPayload?.success || !apiPayload.data?.qrCodeId) {
      const fallbackMessage = `Failed to create item (HTTP ${response.status})`;
      throw new Error(apiPayload?.message || apiPayload?.error || fallbackMessage);
    }

    return {
      // V2: qrCodeId – dùng để sinh deep-link https://findback.vn/item/{qrCodeId}
      qrCodeId: apiPayload.data.qrCodeId,
      // id nội bộ vẫn giữ
      itemId: apiPayload.data.id || apiPayload.data.qrCodeId,
      name: apiPayload.data.name || payload.name,
      category: apiPayload.data.category || payload.category,
      imagePublicUrl:
        typeof apiPayload.data.imagePublicUrl === 'string'
          ? getFullImageUrl(apiPayload.data.imagePublicUrl)
          : null,
      details: {
        color: apiPayload.data.details?.color || null,
        storage: apiPayload.data.details?.storage || null,
        serial: apiPayload.data.details?.serial || null,
      },
      hasInsurance: Boolean(apiPayload.data.hasInsurance),
    };
  },

  /**
   * Lấy Chi tiết lựa chọn của 1 item (thay vì tự tính)
   * GET /v1/items/:id/selection-summary
   */
  async getSelectionSummary(itemId: string): Promise<SelectionSummaryResponse> {
    // V2: Dùng buildItemsUrl để trỏ vào /api/items thay vì /v1/items
    const url = buildItemsUrl(`${itemId}/selection-summary`);

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    const payload = await parseJsonSafely<ItemApiResponse<SelectionSummaryResponse>>(response);

    if (!response.ok || !payload?.success || !payload.data) {
      const fallbackMessage = `Failed to fetch selection summary (HTTP ${response.status})`;
      throw new Error(payload?.message || payload?.error || fallbackMessage);
    }

    if (payload.data.image_url) {
      payload.data.image_url = getFullImageUrl(payload.data.image_url) || undefined;
    }

    return payload.data;
  },

  /**
   * Lấy danh sách categories từ backend
   * GET /api/items/categories
   */
  async getCategories(): Promise<{ value: ItemCategory; label: string; icon: string }[]> {
    const url = `${getItemsApiUrl()}/categories`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch categories');
    }

    const data: ItemApiResponse<{ value: ItemCategory; label: string; icon: string }[]> =
      await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data.data;
  },

  /**
   * Lấy danh sách items
   * GET /api/items
   */
  async getItems(params?: {
    status?: ItemStatus | 'all' | 'ALL';
    category?: ItemCategory;
    page?: number;
    limit?: number;
  }): Promise<ListItemsResponse> {
    const queryParams = new URLSearchParams();
    const status = normalizeStatusFilter(params?.status);
    const category = normalizeCategoryFilter(params?.category);

    const page =
      typeof params?.page === 'number' && Number.isFinite(params.page) && params.page > 0
        ? Math.floor(params.page)
        : undefined;
    const limit =
      typeof params?.limit === 'number' && Number.isFinite(params.limit) && params.limit > 0
        ? Math.floor(params.limit)
        : undefined;

    if (status) queryParams.append('status', status);
    if (category) queryParams.append('category', category);
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));

    const baseUrl = getItemsApiUrl();
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

    if (__DEV__) {
      console.log('[ItemsAPI][getItems] Request', {
        url,
        rawParams: params,
        sentQuery: {
          status: status ?? null,
          category: category ?? null,
          page: page ?? null,
          limit: limit ?? null,
        },
      });
    }

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || 'Failed to fetch items';
      if (
        message.toLowerCase().includes('token expired') ||
        message.toLowerCase().includes('jwt expired') ||
        message.toLowerCase().includes('session expired')
      ) {
        await authStorage.clearAll();
        sessionEvents.emitSessionExpired();
      }
      throw new Error(message);
    }

    const data: ItemApiResponse<ListItemsResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch items');
    }

    return normalizeListItemsResponse(data.data);
  },

  /**
   * Lấy danh sách đồ SAFE trong kho cá nhân để báo mất nhanh
   * GET /api/items/my-vault
   */
  async getMyVaultItems(params?: {
    category?: ItemCategory;
    page?: number;
    limit?: number;
  }): Promise<ListItemsResponse> {
    const queryParams = new URLSearchParams();
    const category = normalizeCategoryFilter(params?.category);

    const page =
      typeof params?.page === 'number' && Number.isFinite(params.page) && params.page > 0
        ? Math.floor(params.page)
        : undefined;
    const limit =
      typeof params?.limit === 'number' && Number.isFinite(params.limit) && params.limit > 0
        ? Math.floor(params.limit)
        : undefined;

    if (category) queryParams.append('category', category);
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));

    const baseUrl = `${getItemsApiUrl()}/my-vault`;
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

    if (__DEV__) {
      console.log('[ItemsAPI][getMyVaultItems] Request', {
        url,
        rawParams: params,
        sentQuery: {
          category: category ?? null,
          page: page ?? null,
          limit: limit ?? null,
        },
      });
    }

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch my vault items');
    }

    const data: ItemApiResponse<ListItemsResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch my vault items');
    }

    return normalizeListItemsResponse(data.data);
  },

  /**
   * Lấy danh sách đồ thất lạc của chính user
   * GET /api/items?status=LOST
   */
  async getMyLostItems(params?: {
    limit?: number;
    category?: ItemCategory;
    page?: number;
  }): Promise<ListItemsResponse> {
    return this.getItems({
      status: 'LOST',
      limit: params?.limit,
      category: params?.category,
      page: params?.page,
    });
  },

  /**
   * Lấy Dashboard data với statistics
   * Helper method kết hợp getItems + tính toán stats
   */
  async getDashboardData(): Promise<DashboardData> {
    // Backend validates status strictly; omit status to fetch full dashboard list.
    const response = await this.getItems({
      limit: 50,
    });

    const safeCount = response.items.filter(item => item.status === 'SAFE').length;
    const lostCount = response.items.filter(item => item.status === 'LOST').length;

    return {
      items: response.items,
      total: response.total,
      safeCount,
      lostCount,
    };
  },

  /**
   * Lấy Item summary (Fast Badges)
   * GET /api/items/summary
   */
  async getSummary(): Promise<ItemsSummary> {
    const url = `${getItemsApiUrl()}/summary`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch items summary');
    }

    const data: ItemApiResponse<ItemsSummary> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch items summary');
    }

    return data.data;
  },

  /**
   * Lấy thông tin 1 item
   * GET /api/items/:id
   */
  async getItemById(itemId: string): Promise<Item> {
    const url = `${getItemsApiUrl()}/${itemId}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch item');
    }

    const data: ItemApiResponse<Item> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch item');
    }

    return normalizeItem(data.data);
  },

  /**
   * Tạo item mới
   * POST /api/items
   */
  async createItem(params: CreateItemParams): Promise<Item> {
    const bodyPayload: Record<string, any> = {
      name: params.name,
      category: params.category,
    };

    if (params.description) {
      bodyPayload.description = params.description;
    }
    if (params.imagePublicUrl) {
      bodyPayload.imagePublicUrl = params.imagePublicUrl;
    }
    if (params.latitude !== undefined && params.latitude !== null) {
      bodyPayload.latitude = params.latitude;
    }
    if (params.longitude !== undefined && params.longitude !== null) {
      bodyPayload.longitude = params.longitude;
    }
    if (params.address) {
      bodyPayload.address = params.address;
    }
    if (params.lastSeenLocation) {
      bodyPayload.lastSeenLocation =
        typeof params.lastSeenLocation === 'string'
          ? params.lastSeenLocation
          : JSON.stringify(params.lastSeenLocation);
    }
    if (params.securityPin) {
      bodyPayload.securityPin = params.securityPin;
    }
    if (params.captureLocation) {
      bodyPayload.captureLocation = params.captureLocation;
    }

    const response = await fetchWithAuth(getItemsApiUrl(), {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create item');
    }

    const data: ItemApiResponse<Item> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create item');
    }

    return normalizeItem(data.data);
  },

  /**
   * Lấy thông tin công khai của 1 item đang thất lạc
   * GET /api/items/public/:id
   */
  async getPublicItem(identifier: string): Promise<any> {
    const url = `${getItemsApiUrl()}/public/${identifier}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch public item details');
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to fetch public item details');
    }

    return data.data;
  },

  /**
   * Cập nhật item
   * PATCH /api/items/:id
   */
  async updateItem(itemId: string, params: UpdateItemParams): Promise<Item> {
    const bodyPayload: Record<string, any> = {};
    if (params.name) bodyPayload.name = params.name;
    if (params.category) bodyPayload.category = params.category;
    if (params.description !== undefined) bodyPayload.description = params.description;
    if (params.imagePublicUrl !== undefined) bodyPayload.imagePublicUrl = params.imagePublicUrl;
    if (params.latitude !== undefined) bodyPayload.latitude = params.latitude;
    if (params.longitude !== undefined) bodyPayload.longitude = params.longitude;
    if (params.address !== undefined) bodyPayload.address = params.address;
    if (params.lastSeenLocation !== undefined) {
      bodyPayload.lastSeenLocation =
        typeof params.lastSeenLocation === 'string'
          ? params.lastSeenLocation
          : JSON.stringify(params.lastSeenLocation);
    }
    if (params.securityPin !== undefined) bodyPayload.securityPin = params.securityPin;
    if (params.captureLocation !== undefined) bodyPayload.captureLocation = params.captureLocation;

    const response = await fetchWithAuth(`${getItemsApiUrl()}/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update item');
    }

    const data: ItemApiResponse<Item> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to update item');
    }

    return normalizeItem(data.data);
  },

  /**
   * Xóa item
   * DELETE /api/items/:id
   */
  async deleteItem(itemId: string): Promise<void> {
    const url = `${getItemsApiUrl()}/${itemId}`;

    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete item');
    }

    const data: ItemApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete item');
    }
  },

  /**
   * Cập nhật status (Báo mất/Tìm thấy)
   * PATCH /v1/items/:id/status
   */
  async updateStatus(itemId: string, params: UpdateStatusParams): Promise<Item> {
    if (params.status !== 'SAFE' && params.status !== 'LOST') {
      throw new Error('Client can only set SAFE or LOST status');
    }

    let requestBody: Record<string, unknown>;

    if (params.status === 'SAFE') {
      requestBody = { status: 'SAFE' };
    } else {
      if (
        typeof params.latitude !== 'number' ||
        typeof params.longitude !== 'number' ||
        !Number.isFinite(params.latitude) ||
        !Number.isFinite(params.longitude)
      ) {
        throw new Error('Tọa độ latitude và longitude là bắt buộc khi báo mất.');
      }

      requestBody = {
        status: 'LOST',
        lostMessage: params.lostMessage?.trim() || undefined,
        lostAddress: params.lostAddress?.trim() || undefined,
        latitude: params.latitude,
        longitude: params.longitude,
      };
    }

    // Ưu tiên PATCH /v1/items/:id/status, fallback PATCH /api/items/:id/status
    const v1Url = buildV1Url('items', itemId, 'status');
    let response = await fetchWithAuth(v1Url, {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok && (response.status === 404 || response.status === 405)) {
      const apiUrl = buildItemsUrl(itemId, 'status');
      response = await fetchWithAuth(apiUrl, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });
    }

    const data = await parseJsonSafely<UpdateStatusApiResponse>(response);

    if (!response.ok) {
      const errorCode =
        data?.code ||
        (typeof data?.error === 'object' ? data.error.code : undefined) ||
        (typeof data?.error === 'string' && /^[A-Z][A-Z0-9_]+$/.test(data.error)
          ? data.error
          : undefined);
      const errorMessage =
        data?.message ||
        (typeof data?.error === 'object' ? data.error.message : data?.error) ||
        'Failed to update status';

      throw new ItemsApiError(errorMessage, response.status, errorCode);
    }

    if (!data?.success || !data.data) {
      throw new ItemsApiError(data?.message || 'Failed to update status', response.status);
    }

    return normalizeItem(data.data);
  },

  /**
   * Quét QR Code bằng phiên đăng nhập hiện tại.
   * Backend vẫn có thể trả thông tin công khai cho guest, nhưng finder đã đăng
   * nhập phải gửi Bearer token để server tạo/reuse ReturnSession và channel.
   * GET /api/scan/:itemId
   */
  async scanQR(
    itemId: string,
    params?: {
      currentLat?: number;
      currentLng?: number;
    }
  ): Promise<ScanItemResponse> {
    const queryParams = new URLSearchParams();

    if (typeof params?.currentLat === 'number' && Number.isFinite(params.currentLat)) {
      queryParams.append('current_lat', String(params.currentLat));
    }

    if (typeof params?.currentLng === 'number' && Number.isFinite(params.currentLng)) {
      queryParams.append('current_lng', String(params.currentLng));
    }

    const baseUrl = buildScanUrl(itemId);
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to scan QR code');
    }

    const payload = (await response.json()) as ScanItemResponse | ItemApiResponse<ScanItemResponse>;
    const data = 'data' in payload && payload.data ? payload.data : (payload as ScanItemResponse);
    return normalizeScanResponse(data);
  },

  /**
   * B+ Flow: khởi tạo guest session cho finder khi scan QR trên web/app
   * POST /api/scan/guest-init
   */
  async initGuestScanSession(payload: ScanGuestInitParams): Promise<ScanGuestInitResponse> {
    if (!payload.itemId?.trim()) {
      throw new Error('itemId is required');
    }

    if (!payload.phoneNumber?.trim()) {
      throw new Error('phoneNumber is required');
    }

    const response = await fetch(buildScanUrl('guest-init'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: payload.itemId,
        phoneNumber: payload.phoneNumber,
        lat: payload.lat,
        lng: payload.lng,
      }),
    });

    const json = (await response.json()) as ScanGuestInitResponse & { error?: string };

    if (!response.ok || !json.success) {
      throw new Error(json.message || json.error || 'Failed to initialize guest session');
    }

    return json;
  },
};

export default itemsApi;
