import * as Crypto from 'expo-crypto';
import { buildBaseUrl, buildReportsUrl } from '@services/shared/url';
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
  errors?: { field?: string; message?: string }[];
  data?: T;
  code?: string;
  error?: string | { code?: string; message?: string };
}

export class ReportsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ReportsApiError';
  }
}

interface GuardianReportLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface GuardianReportRadar {
  radius: number;
  durationHours: number;
}

interface GuardianReportReward {
  baseAmount: number;
  isCustom: boolean;
}

interface GuardianReportRequest {
  itemId: string;
  location: GuardianReportLocation;
  radar: GuardianReportRadar;
  reward: GuardianReportReward;
  idempotencyKey?: string;
}

interface GuardianReportApiPayload {
  report_id?: string;
  status?: string;
  payment?: {
    total_to_pay?: number;
    payment_url?: string;
  };
}

export interface GuardianReportCreationResult {
  reportId: string;
  status: string;
  totalToPay: number;
  paymentUrl: string;
}

const createAuthHeaders = async (customIdempotencyKey?: string): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const idempotencyKey = customIdempotencyKey || Crypto.randomUUID();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey,
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

const toApiErrorMessage = <T>(
  response: Response,
  payload: ReportsApiResponse<T> | null,
  fallback: string
): string => {
  const validationMessage = Array.isArray(payload?.errors)
    ? payload?.errors
        ?.map(item => item?.message)
        .filter(
          (message): message is string => typeof message === 'string' && message.trim().length > 0
        )
        .join('; ')
    : '';

  const apiError =
    typeof payload?.error === 'string'
      ? payload.error
      : typeof payload?.error?.message === 'string'
        ? payload.error.message
        : '';

  return (
    validationMessage || payload?.message || apiError || `${fallback} (HTTP ${response.status})`
  );
};

const toApiErrorCode = <T>(payload: ReportsApiResponse<T> | null): string | undefined => {
  if (typeof payload?.code === 'string') {
    return payload.code;
  }

  if (typeof payload?.error === 'string' && /^[A-Z][A-Z0-9_]+$/.test(payload.error)) {
    return payload.error;
  }

  return typeof payload?.error === 'object' && typeof payload.error.code === 'string'
    ? payload.error.code
    : undefined;
};

export const reportsApi = {
  async createGuardianReport(
    payload: GuardianReportRequest
  ): Promise<GuardianReportCreationResult> {
    if (!payload.itemId || payload.itemId.trim().length === 0) {
      throw new Error('item_id is required');
    }

    const lat = toFiniteNumber(payload.location.lat, 'location.lat');
    const lng = toFiniteNumber(payload.location.lng, 'location.lng');
    const radius = Math.floor(toFiniteNumber(payload.radar.radius, 'radar.radius'));
    const durationHours = Math.floor(
      toFiniteNumber(payload.radar.durationHours, 'radar.duration_hours')
    );
    const baseAmount = Math.floor(toFiniteNumber(payload.reward.baseAmount, 'reward.base_amount'));

    if (radius < 100 || radius > 5000) {
      throw new Error('radar.radius must be between 100 and 5000');
    }

    if (durationHours < 1 || durationHours > 168) {
      throw new Error('radar.duration_hours must be between 1 and 168');
    }

    if (baseAmount < 10000) {
      throw new Error('Minimum reward is 10,000đ');
    }

    const headers = await createAuthHeaders(payload.idempotencyKey);
    const response = await fetch(buildBaseUrl('v1', 'reports'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        item_id: payload.itemId,
        location: {
          lat,
          lng,
          address: payload.location.address || '',
        },
        radar: {
          radius,
          duration_hours: durationHours,
        },
        reward: {
          base_amount: baseAmount,
          is_custom: payload.reward.isCustom,
        },
      }),
    });

    const json = await parseJsonSafely<ReportsApiResponse<GuardianReportApiPayload>>(response);

    if (!response.ok || !json?.success || !json.data) {
      throw new ReportsApiError(
        toApiErrorMessage(response, json, 'Failed to create report'),
        response.status,
        toApiErrorCode(json)
      );
    }

    const reportId = typeof json.data.report_id === 'string' ? json.data.report_id : '';
    const status = typeof json.data.status === 'string' ? json.data.status : '';
    const paymentUrl =
      typeof json.data.payment?.payment_url === 'string' ? json.data.payment.payment_url : '';
    const totalToPay = Number.isFinite(Number(json.data.payment?.total_to_pay))
      ? Number(json.data.payment?.total_to_pay)
      : baseAmount;

    if (!reportId || !paymentUrl || !status) {
      throw new Error('Invalid report response from server');
    }

    return {
      reportId,
      status,
      totalToPay,
      paymentUrl,
    };
  },

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
      throw new ReportsApiError(
        toApiErrorMessage(response, json, fallbackMessage),
        response.status,
        toApiErrorCode(json)
      );
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
