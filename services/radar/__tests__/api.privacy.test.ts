import { radarApi } from '@/services/radar/api';
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

describe('Radar API privacy logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authStorage.getAccessToken as jest.Mock).mockResolvedValue(null);
  });

  it('does not write precise coordinates or coordinate-bearing URLs to debug logs', async () => {
    const latitude = 10.123456;
    const longitude = 106.654321;
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { pins: [], cards: [], myLostCount: 0, nearbyCount: 0 },
      }),
    } as Response);

    await radarApi.getHomeLostFeed({ lat: latitude, lng: longitude, radius: 5000 });

    const logged = JSON.stringify(log.mock.calls);
    expect(logged).not.toContain(String(latitude));
    expect(logged).not.toContain(String(longitude));
    expect(logged).not.toMatch(/[?&](lat|lng)=/i);

    fetchMock.mockRestore();
    log.mockRestore();
  });
});
