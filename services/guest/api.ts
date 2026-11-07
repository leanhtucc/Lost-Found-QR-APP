import { apiClient } from '@/services/http';
import { buildApiUrl } from '@/services/shared/url';

export interface GuestStreamTokenResponse {
  token: string;
  userId: string;
  expiresAt?: string;
}

export const guestApi = {
  async getStreamToken(): Promise<GuestStreamTokenResponse> {
    return apiClient.request<GuestStreamTokenResponse>(buildApiUrl('guest', 'stream-token'), {
      method: 'POST',
    });
  },
};
