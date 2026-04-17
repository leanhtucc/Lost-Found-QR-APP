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
  ListItemsResponse,
  ScanGuestInitParams,
  ScanGuestInitResponse,
  ScanItemResponse,
  UpdateItemParams,
  UpdateStatusParams,
} from '@/types';
import { buildItemsUrl, buildScanUrl } from '@services/shared/url';
import { authStorage } from '@storage/auth';

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

const normalizeItemStatus = (status: unknown): ItemStatus => {
  const normalized = typeof status === 'string' ? status.trim().toUpperCase() : '';

  switch (normalized) {
    case 'SAFE':
      return 'SAFE';
    case 'PENDING_PAYMENT':
      return 'PENDING_PAYMENT';
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

const normalizeItem = (item: Item): Item => {
  return {
    ...item,
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
   * Lấy danh sách categories từ backend
   * GET /api/items/categories
   */
  async getCategories(): Promise<{ value: ItemCategory; label: string; icon: string }[]> {
    const url = `${getItemsApiUrl()}/categories`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
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

    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const url = `${getItemsApiUrl()}?${queryParams.toString()}`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch items');
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

    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const baseUrl = `${getItemsApiUrl()}/my-vault`;
    const url = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
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
    const lostCount = response.items.filter(
      item => item.status === 'LOST' || item.status === 'PENDING_PAYMENT'
    ).length;

    return {
      items: response.items,
      total: response.total,
      safeCount,
      lostCount,
    };
  },

  /**
   * Lấy thông tin 1 item
   * GET /api/items/:id
   */
  async getItemById(itemId: string): Promise<Item> {
    const url = `${getItemsApiUrl()}/${itemId}`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
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
    const queryParams = new URLSearchParams();

    queryParams.append('name', params.name);
    queryParams.append('category', params.category);

    if (params.description) {
      queryParams.append('description', params.description);
    }
    if (params.imagePublicUrl) {
      queryParams.append('imagePublicUrl', params.imagePublicUrl);
    }
    if (params.lastSeenLocation) {
      const location =
        typeof params.lastSeenLocation === 'string'
          ? params.lastSeenLocation
          : JSON.stringify(params.lastSeenLocation);
      queryParams.append('lastSeenLocation', location);
    }
    if (params.securityPin) {
      queryParams.append('securityPin', params.securityPin);
    }

    const url = `${getItemsApiUrl()}?${queryParams.toString()}`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create item');
    }

    const data: ItemApiResponse<Item> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create item');
    }

    return normalizeItem(data.data);
  },

  /**
   * Cập nhật item
   * PATCH /api/items/:id
   */
  async updateItem(itemId: string, params: UpdateItemParams): Promise<Item> {
    const queryParams = new URLSearchParams();

    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.description !== undefined) {
      queryParams.append('description', params.description);
    }
    if (params.imagePublicUrl !== undefined) {
      queryParams.append('imagePublicUrl', params.imagePublicUrl);
    }
    if (params.lastSeenLocation) {
      const location =
        typeof params.lastSeenLocation === 'string'
          ? params.lastSeenLocation
          : JSON.stringify(params.lastSeenLocation);
      queryParams.append('lastSeenLocation', location);
    }
    if (params.securityPin !== undefined) {
      queryParams.append('securityPin', params.securityPin);
    }

    const url = `${getItemsApiUrl()}/${itemId}?${queryParams.toString()}`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
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
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete item');
    }

    const data: ItemApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete item');
    }
  },

  /**
   * Cập nhật status (Báo mất/Tìm thấy)
   * PATCH /api/items/:id/status
   */
  async updateStatus(itemId: string, params: UpdateStatusParams): Promise<Item> {
    const queryParams = new URLSearchParams();

    queryParams.append('status', params.status);

    if (params.lostMessage) {
      queryParams.append('lostMessage', params.lostMessage);
    }

    const hasLatitude = typeof params.latitude === 'number';
    const hasLongitude = typeof params.longitude === 'number';

    if (hasLatitude !== hasLongitude) {
      throw new Error('latitude and longitude must be provided together');
    }

    if (hasLatitude && hasLongitude) {
      queryParams.append('latitude', String(params.latitude));
      queryParams.append('longitude', String(params.longitude));
    }

    const url = `${getItemsApiUrl()}/${itemId}/status?${queryParams.toString()}`;
    const headers = await createHeaders();

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update status');
    }

    const data: ItemApiResponse<Item> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to update status');
    }

    return normalizeItem(data.data);
  },

  /**
   * Quét QR Code (Public - không cần auth)
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

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to scan QR code');
    }

    const data = (await response.json()) as ScanItemResponse;
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
