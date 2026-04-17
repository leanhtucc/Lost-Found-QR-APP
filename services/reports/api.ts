import { buildReportsUrl } from '@services/shared/url';
import { authStorage } from '@storage/auth';

interface ReportLostItemLocation {
  lat: number;
  lng: number;
  address: string;
}

interface ReportLostItemRequest {
  itemId: string;
  location: ReportLostItemLocation;
  bounty: number;
  paymentMethod: string;
}

interface ReportLostItemResponseData {
  reportId?: string;
  paymentUrl?: string;
}

interface ReportsApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const createAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const toFiniteNumber = (value: number, fieldName: string): number => {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return value;
};

export const reportsApi = {
  async reportLostItem(payload: ReportLostItemRequest): Promise<ReportLostItemResponseData> {
    if (typeof payload.itemId !== 'string' || payload.itemId.trim().length === 0) {
      throw new Error('itemId is required');
    }

    toFiniteNumber(payload.location.lat, 'location.lat');
    toFiniteNumber(payload.location.lng, 'location.lng');

    if (!Number.isFinite(payload.bounty) || payload.bounty < 0) {
      throw new Error('bounty must be a non-negative number');
    }

    if (typeof payload.paymentMethod !== 'string' || payload.paymentMethod.trim().length === 0) {
      throw new Error('paymentMethod is required');
    }

    const headers = await createAuthHeaders();
    const response = await fetch(buildReportsUrl('lost-item'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        item_id: payload.itemId,
        location: {
          lat: payload.location.lat,
          lng: payload.location.lng,
          address: payload.location.address,
        },
        bounty: Math.floor(payload.bounty),
        payment_method: payload.paymentMethod,
      }),
    });

    const json = await parseJsonSafely<ReportsApiResponse<ReportLostItemResponseData>>(response);

    if (!response.ok || !json?.success) {
      const fallbackMessage = `Failed to submit lost-item report (HTTP ${response.status})`;
      throw new Error(json?.message || json?.error || fallbackMessage);
    }

    const data = json.data || {};
    const rawData = data as { reportId?: string; paymentUrl?: string; payment_url?: string };

    return {
      reportId: rawData.reportId,
      paymentUrl:
        typeof rawData.paymentUrl === 'string'
          ? rawData.paymentUrl
          : typeof rawData.payment_url === 'string'
            ? rawData.payment_url
            : undefined,
    };
  },
};

export default reportsApi;
