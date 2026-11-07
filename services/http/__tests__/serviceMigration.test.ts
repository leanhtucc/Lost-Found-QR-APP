import { apiClient } from '@/services/http';
import { itemsApi } from '@/services/items/api';
import { radarApi } from '@/services/radar/api';
import { getNotifications } from '@/services/notifications/api';
import { foundReportsApi } from '@/services/reports/found';
import { returnApi } from '@/services/returns/api';

jest.mock('@/services/http', () => ({
  apiClient: { fetch: jest.fn() },
}));

const mockApiFetch = apiClient.fetch as jest.Mock;

const response = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn(async () => body),
  }) as unknown as Response;

const item = {
  id: 'internal-1',
  itemId: 'item-1',
  publicItemId: 'item-1',
  qrCodeId: 'qr-1',
  ownerId: 'owner-1',
  name: 'Ví da',
  category: 'wallet',
  status: 'SAFE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('feature services migrated to central apiClient', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it('keeps Items list and detail contracts', async () => {
    mockApiFetch
      .mockResolvedValueOnce(
        response(200, {
          success: true,
          data: { items: [item], total: 1, page: 1, limit: 10, totalPages: 1 },
        })
      )
      .mockResolvedValueOnce(response(200, { success: true, data: item }));

    const list = await itemsApi.getItems();
    const detail = await itemsApi.getItemById('item-1');

    expect(list.items[0]).toMatchObject({ itemId: 'item-1', qrCodeId: 'qr-1' });
    expect(detail).toMatchObject({ id: 'internal-1', itemId: 'item-1' });
    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  it('keeps the Home/Radar HTTP snapshot contract', async () => {
    mockApiFetch.mockResolvedValueOnce(
      response(200, {
        success: true,
        data: { cards: [], pins: [], myLostCount: 0, nearbyCount: 0 },
      })
    );

    const snapshot = await radarApi.getHomeLostFeed({ lat: 10.7, lng: 106.6 });

    expect(snapshot).toMatchObject({ cards: [], pins: [], myLostCount: 0, nearbyCount: 0 });
  });

  it('maps the backend notification list to the app shape', async () => {
    mockApiFetch.mockResolvedValueOnce(
      response(200, {
        success: true,
        data: {
          total_unread: 1,
          total: 2,
          page: 1,
          per_page: 20,
          items: [
            {
              _id: 'n1',
              type: 'NEW_CHAT',
              title: { vi: 'Tin nhắn mới', en: 'New message' },
              content: { vi: 'Xin chào', en: 'Hello' },
              status: 'UN_VIEW',
              user_id: 'u1',
              entity_type: 'CHAT',
              entity_id: 'room-1',
              created_at: '2026-01-01T00:00:00.000Z',
            },
            {
              _id: 'n2',
              type: 'ESCROW_LOCKED',
              title: { vi: 'Giao dịch', en: 'Tx' },
              content: { vi: 'Đã khóa', en: 'Locked' },
              status: 'VIEW',
              user_id: 'u1',
              entity_type: null,
              entity_id: null,
              created_at: '2026-01-02T00:00:00.000Z',
            },
          ],
        },
      })
    );

    const result = await getNotifications({ category: 'SOCIAL' });

    expect(mockApiFetch.mock.calls[0][0]).toContain('per_page=20');
    expect(result.total_unread).toBe(1);
    expect(result.pagination).toMatchObject({ total: 2, hasNextPage: false });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'n1',
      title: 'Tin nhắn mới',
      category: 'SOCIAL',
      is_read: false,
      metadata: { room_id: 'room-1' },
    });
  });

  it('keeps the basic found-report detail contract', async () => {
    mockApiFetch.mockResolvedValueOnce(
      response(200, {
        success: true,
        data: {
          id: 'found-1',
          name: 'Chìa khóa',
          category: 'keys',
          imagePublicUrl: 'https://example.test/key.jpg',
          lat: 10.7,
          lng: 106.6,
          address: 'Quận 1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      })
    );

    await expect(foundReportsApi.get('found-1')).resolves.toMatchObject({ id: 'found-1' });
  });

  it('keeps a basic Return HTTP request contract', async () => {
    mockApiFetch.mockResolvedValueOnce(
      response(200, {
        success: true,
        data: {
          id: 'return-1',
          channelId: 'return_return-1',
          sourceType: 'ITEM',
          itemName: 'Ví da',
          status: 'CHAT_ACTIVE',
          owner: { id: 'owner-1', role: 'OWNER', displayName: 'Owner' },
          finder: { id: 'finder-1', role: 'FINDER', displayName: 'Finder' },
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          serverRevision: 1,
          capabilities: {
            canReviewMeetup: false,
            directionsAllowed: false,
            liveSharingAllowed: false,
            handoverAllowed: false,
            canCancel: false,
          },
        },
      })
    );

    await expect(returnApi.getSession('return-1')).resolves.toMatchObject({
      id: 'return-1',
      channelId: 'return_return-1',
    });
  });
});
