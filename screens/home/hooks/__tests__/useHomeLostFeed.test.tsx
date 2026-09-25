import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useHomeLostFeed } from '../useHomeLostFeed';
import { radarApi } from '@services/radar';
import { HomeLostFeedData } from '@/types/radar';

jest.mock('@services/radar', () => ({
  radarApi: {
    getHomeLostFeed: jest.fn(),
  },
  createRadarSocket: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
    connected: false,
  })),
  subscribeRadar: jest.fn(),
  sendRadarHeartbeat: jest.fn(),
  unsubscribeRadar: jest.fn(),
}));

jest.mock('@storage/auth', () => ({
  authStorage: {
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
  },
}));

describe('useHomeLostFeed (Phase 2 Verification)', () => {
  let hookResult: ReturnType<typeof useHomeLostFeed>;
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockOnError = jest.fn();

  const HookHarness: React.FC<{ onError?: (msg: string) => void }> = ({ onError }) => {
    hookResult = useHomeLostFeed({ onError });
    return null;
  };

  const mountHarness = async (onError = mockOnError) => {
    await act(async () => {
      renderer = ReactTestRenderer.create(<HookHarness onError={onError} />);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
    jest.useRealTimers();
  });

  it('handles request races: when Request B resolves before Request A, Region B remains the source of truth', async () => {
    await mountHarness();

    const dataRegionA: HomeLostFeedData = {
      cards: [
        {
          itemId: 'item-A',
          name: 'Item in Region A',
          category: 'wallet',
          imagePublicUrl: null,
          lostMessage: 'Region A message',
          address: 'District A',
          distanceMeters: 500,
          distanceLabel: '500m',
          lostLat: 21.01,
          lostLng: 105.81,
          isOwn: false,
          ownerDisplayName: 'Owner A',
          ownerPhotoURL: null,
          reportedAt: '2026-09-20T00:00:00Z',
          reportType: 'LOST',
        },
      ],
      pins: [{ itemId: 'item-A', lat: 21.01, lng: 105.81, isOwn: false }],
      myLostCount: 0,
      nearbyCount: 1,
    };

    const dataRegionB: HomeLostFeedData = {
      cards: [
        {
          itemId: 'item-B',
          name: 'Item in Region B',
          category: 'phone',
          imagePublicUrl: null,
          lostMessage: 'Region B message',
          address: 'District B',
          distanceMeters: 300,
          distanceLabel: '300m',
          lostLat: 21.05,
          lostLng: 105.85,
          isOwn: false,
          ownerDisplayName: 'Owner B',
          ownerPhotoURL: null,
          reportedAt: '2026-09-21T00:00:00Z',
          reportType: 'LOST',
        },
      ],
      pins: [{ itemId: 'item-B', lat: 21.05, lng: 105.85, isOwn: false }],
      myLostCount: 0,
      nearbyCount: 1,
    };

    let resolvePromiseA!: (val: HomeLostFeedData) => void;
    const promiseA = new Promise<HomeLostFeedData>(resolve => {
      resolvePromiseA = resolve;
    });

    let resolvePromiseB!: (val: HomeLostFeedData) => void;
    const promiseB = new Promise<HomeLostFeedData>(resolve => {
      resolvePromiseB = resolve;
    });

    const mockGetHomeLostFeed = radarApi.getHomeLostFeed as jest.Mock;
    mockGetHomeLostFeed.mockReturnValueOnce(promiseA).mockReturnValueOnce(promiseB);

    // 1. Dispatch Request A for Region A
    act(() => {
      hookResult.fetchViewportFeed({ latitude: 21.01, longitude: 105.81 }, 4000);
    });
    // Advance past debounce (450ms) to fire Request A
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockGetHomeLostFeed).toHaveBeenCalledTimes(1);

    // 2. User quickly pans to Region B -> Dispatch Request B
    act(() => {
      hookResult.fetchViewportFeed({ latitude: 21.05, longitude: 105.85 }, 4000);
    });
    // Advance past debounce to fire Request B
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockGetHomeLostFeed).toHaveBeenCalledTimes(2);

    // 3. Request B resolves FIRST
    await act(async () => {
      resolvePromiseB(dataRegionB);
    });

    // Region B is now active
    expect(hookResult.mapPins).toEqual(dataRegionB.pins);
    expect(hookResult.lostFeedCards).toEqual(dataRegionB.cards);
    expect(hookResult.mapPins[0].itemId).toBe('item-B');

    // 4. Request A resolves AFTERWARD (stale response)
    await act(async () => {
      resolvePromiseA(dataRegionA);
    });

    // REGION B MUST REMAIN THE SOURCE OF TRUTH (A cannot overwrite B)
    expect(hookResult.mapPins).toEqual(dataRegionB.pins);
    expect(hookResult.lostFeedCards).toEqual(dataRegionB.cards);
    expect(hookResult.mapPins[0].itemId).toBe('item-B');
    expect(hookResult.mapPins.find(p => p.itemId === 'item-A')).toBeUndefined();
  });

  it('handles failed refresh: preserves existing successful markers and notifies non-blocking error', async () => {
    await mountHarness();

    const initialRegionA: HomeLostFeedData = {
      cards: [
        {
          itemId: 'item-initial-1',
          name: 'Ví ban đầu',
          category: 'wallet',
          imagePublicUrl: null,
          lostMessage: null,
          address: 'Hà Nội',
          distanceMeters: 600,
          distanceLabel: '600m',
          lostLat: 21.028,
          lostLng: 105.834,
          isOwn: true,
          ownerDisplayName: 'Me',
          ownerPhotoURL: null,
          reportedAt: '2026-09-22T00:00:00Z',
          reportType: 'LOST',
        },
      ],
      pins: [{ itemId: 'item-initial-1', lat: 21.028, lng: 105.834, isOwn: true }],
      myLostCount: 1,
      nearbyCount: 0,
    };

    const mockGetHomeLostFeed = radarApi.getHomeLostFeed as jest.Mock;

    // First load for Region A succeeds
    mockGetHomeLostFeed.mockResolvedValueOnce(initialRegionA);

    act(() => {
      hookResult.fetchViewportFeed({ latitude: 21.028, longitude: 105.834 }, 3000);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for promise tick
    await act(async () => {
      await Promise.resolve();
    });

    expect(hookResult.mapPins).toEqual(initialRegionA.pins);
    expect(hookResult.lostFeedCards).toEqual(initialRegionA.cards);

    // Pan to Region B -> Request B fails (e.g. network disconnection)
    mockGetHomeLostFeed.mockRejectedValueOnce(new Error('Network connection timeout'));

    act(() => {
      hookResult.fetchViewportFeed({ latitude: 21.08, longitude: 105.9 }, 3000);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Map must NOT become blank: Region A's last successful markers remain intact
    expect(hookResult.mapPins).toHaveLength(1);
    expect(hookResult.mapPins[0].itemId).toBe('item-initial-1');
    expect(hookResult.lostFeedCards).toHaveLength(1);
    expect(hookResult.lostFeedCards[0].itemId).toBe('item-initial-1');

    // Non-blocking error notification is dispatched
    expect(mockOnError).toHaveBeenCalledWith('Network connection timeout');
  });
});
