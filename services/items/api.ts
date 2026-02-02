/**
 * Items API Service
 * Xử lý tất cả API calls liên quan đến Items
 */

import { getApiUrl } from '@constants/environment';
import { authStorage } from '@storage/auth';
import type {
  Item,
  CreateItemParams,
  UpdateItemParams,
  ListItemsResponse,
  DashboardData,
  UpdateStatusParams,
  ScanItemResponse,
  ItemApiResponse,
  ItemStatus,
  ItemCategory,
} from '@types/item';

/**
 * Base URL cho Items API
 */
const getItemsApiUrl = () => `${getApiUrl()}/api/items`;

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
 * Items API
 */
export const itemsApi = {
  /**
   * Lấy danh sách categories từ backend
   * GET /api/items/categories
   */
  async getCategories(): Promise<Array<{ value: ItemCategory; label: string; icon: string }>> {
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

    const data: ItemApiResponse<Array<{ value: ItemCategory; label: string; icon: string }>> =
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
    status?: ItemStatus | 'all';
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

    return data.data;
  },

  /**
   * Lấy Dashboard data với statistics
   * Helper method kết hợp getItems + tính toán stats
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.getItems({
      status: 'all',
      limit: 50,
    });

    const safeCount = response.items.filter(item => item.status === 'safe').length;
    const lostCount = response.items.filter(item => item.status === 'lost').length;

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

    return data.data;
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

    return data.data;
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

    return data.data;
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

    return data.data;
  },

  /**
   * Quét QR Code (Public - không cần auth)
   * GET /api/scan/:itemId
   */
  async scanQR(itemId: string): Promise<ScanItemResponse> {
    const url = `${getApiUrl()}/api/scan/${itemId}`;

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

    return await response.json();
  },
};

export default itemsApi;
