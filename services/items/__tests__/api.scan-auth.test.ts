import { itemsApi } from '@/services/items/api';
import { authStorage } from '@/storage/auth';

jest.mock('@/storage/auth', () => ({
  authStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('@/services/auth', () => ({
  authApi: { refreshToken: jest.fn() },
}));

describe('Items API authenticated QR scan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authStorage.getAccessToken as jest.Mock).mockResolvedValue('test-access-token');
  });

  it('sends the current user token so the backend can create the finder return channel', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          action: 'open_chat',
          channelId: 'return_test-session',
          item_info: {
            id: 'qr-test',
            name: 'Test item',
            category: 'OTHER',
            status: 'LOST',
          },
        },
      }),
    } as Response);

    await itemsApi.scanQR('qr-test');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/scan/qr-test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access-token',
        }),
      })
    );

    fetchMock.mockRestore();
  });
});
