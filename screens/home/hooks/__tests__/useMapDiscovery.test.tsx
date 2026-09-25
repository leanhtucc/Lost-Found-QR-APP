import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  useMapDiscovery,
  normalizeLostToDiscovery,
  normalizeFoundToDiscovery,
  mergeDiscoveryResults,
} from '../useMapDiscovery';
import { radarApi } from '@services/radar';
import { foundReportsApi } from '@services/reports/found';
import { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';

jest.mock('@services/radar', () => ({
  radarApi: {
    getHomeLostFeed: jest.fn(),
  },
  createRadarSocket: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
  subscribeRadar: jest.fn(),
  sendRadarHeartbeat: jest.fn(),
}));

jest.mock('@services/reports/found', () => ({
  foundReportsApi: {
    getFeed: jest.fn(),
  },
}));

jest.mock('@storage/auth', () => ({
  authStorage: {
    getAccessToken: jest.fn().mockResolvedValue('test-token'),
  },
}));

describe('useMapDiscovery', () => {
  let hookResult: ReturnType<typeof useMapDiscovery>;
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockOnError = jest.fn();
  const mockOnPartialError = jest.fn();

  const HookHarness: React.FC<{
    onError?: (msg: string) => void;
    onPartialError?: (msg: string) => void;
  }> = ({ onError, onPartialError }) => {
    hookResult = useMapDiscovery({ onError, onPartialError });
    return null;
  };

  const mountHarness = async (onError = mockOnError, onPartialError = mockOnPartialError) => {
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <HookHarness onError={onError} onPartialError={onPartialError} />
      );
    });
  };

  const mockLostCard: HomeLostFeedCard = {
    itemId: 'item-101',
    name: 'Bao da hộ chiếu',
    category: 'wallet',
    imagePublicUrl: 'https://example.com/lost.jpg',
    lostMessage: 'Rơi tại thư viện',
    address: 'Thư viện Tạ Quang Bửu',
    distanceMeters: 450,
    distanceLabel: '450m',
    lostLat: 21.004,
    lostLng: 105.843,
    isOwn: false,
    ownerDisplayName: 'Nguyễn Văn A',
    ownerPhotoURL: null,
    reportedAt: '2026-09-24T10:00:00.000Z',
    reportType: 'LOST',
  };

  const mockLostPin: HomeLostFeedPin = {
    itemId: 'item-101',
    lat: 21.004,
    lng: 105.843,
    isOwn: false,
  };

  const mockFoundCard: HomeLostFeedCard = {
    itemId: 'found:report-202',
    name: 'Chùm chìa khóa',
    category: 'keys',
    imagePublicUrl: 'https://example.com/found.jpg',
    lostMessage: 'Nhặt được ở căng tin',
    address: 'Căng tin B1',
    distanceMeters: 200,
    distanceLabel: '200m',
    lostLat: 21.006,
    lostLng: 105.845,
    isOwn: false,
    ownerDisplayName: 'Người nhặt được',
    ownerPhotoURL: null,
    reportedAt: '2026-09-24T10:30:00.000Z',
    reportType: 'FOUND',
  };

  const mockFoundPin: HomeLostFeedPin = {
    itemId: 'found:report-202',
    lat: 21.006,
    lng: 105.845,
    isOwn: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
  });

  describe('Normalization & Canonical Identifiers', () => {
    it('normalizes lost items with LOST_ITEM: prefix and rawId', () => {
      const { pins, cards } = normalizeLostToDiscovery([mockLostPin], [mockLostCard]);
      expect(pins[0]!.discoveryKey).toBe('LOST_ITEM:item-101');
      expect(pins[0]!.rawId).toBe('item-101');
      expect(pins[0]!.source).toBe('LOST_ITEM');

      expect(cards[0]!.discoveryKey).toBe('LOST_ITEM:item-101');
      expect(cards[0]!.rawId).toBe('item-101');
      expect(cards[0]!.source).toBe('LOST_ITEM');
      expect(cards[0]!.reportType).toBe('LOST');
    });

    it('normalizes found reports with FOUND_REPORT: prefix and strips found: prefix from rawId', () => {
      const { pins, cards } = normalizeFoundToDiscovery([mockFoundPin], [mockFoundCard]);
      expect(pins[0]!.discoveryKey).toBe('FOUND_REPORT:report-202');
      expect(pins[0]!.rawId).toBe('report-202');
      expect(pins[0]!.source).toBe('FOUND_REPORT');

      expect(cards[0]!.discoveryKey).toBe('FOUND_REPORT:report-202');
      expect(cards[0]!.rawId).toBe('report-202');
      expect(cards[0]!.source).toBe('FOUND_REPORT');
      expect(cards[0]!.reportType).toBe('FOUND');
    });

    it('merges discovery results prioritizing own items and sorting by nearest distance', () => {
      const lost = normalizeLostToDiscovery(
        [mockLostPin],
        [{ ...mockLostCard, distanceMeters: 800, isOwn: false }]
      );
      const found = normalizeFoundToDiscovery(
        [mockFoundPin],
        [{ ...mockFoundCard, distanceMeters: 300, isOwn: true }]
      );

      const merged = mergeDiscoveryResults(lost, found);
      expect(merged.cards[0]!.isOwn).toBe(true);
      expect(merged.cards[0]!.discoveryKey).toBe('FOUND_REPORT:report-202');
      expect(merged.cards[1]!.discoveryKey).toBe('LOST_ITEM:item-101');
      expect(merged.pins).toHaveLength(2);
    });

    it('deduplicates pins with identical discovery keys without dropping mixed sources', () => {
      const lost = normalizeLostToDiscovery(
        [{ itemId: 'uuid-1', lat: 21, lng: 105, isOwn: false }],
        []
      );
      const found = normalizeFoundToDiscovery(
        [{ itemId: 'found:uuid-1', lat: 21, lng: 105, isOwn: false }],
        []
      );

      const merged = mergeDiscoveryResults(lost, found);
      expect(merged.pins).toHaveLength(2);
      expect(merged.pins.map(p => p.discoveryKey)).toEqual([
        'LOST_ITEM:uuid-1',
        'FOUND_REPORT:uuid-1',
      ]);
    });

    it('creates two independent markers and cards with preserved rawId when raw IDs are identical', () => {
      const lostCard: HomeLostFeedCard = {
        itemId: 'common-uuid-999',
        name: 'Chùm chìa khóa',
        category: 'keys',
        imagePublicUrl: null,
        lostMessage: null,
        address: 'Hà Nội',
        distanceMeters: 50,
        distanceLabel: '50m',
        lostLat: 21.01,
        lostLng: 105.81,
        isOwn: true,
        ownerDisplayName: 'Owner A',
        ownerPhotoURL: null,
        reportedAt: '2026-09-24T00:00:00Z',
      };
      const foundCard: HomeLostFeedCard = {
        itemId: 'found:common-uuid-999',
        reportType: 'FOUND',
        name: 'Chùm chìa khóa nhặt được',
        category: 'keys',
        imagePublicUrl: null,
        lostMessage: null,
        address: 'Hà Nội',
        distanceMeters: 80,
        distanceLabel: '80m',
        lostLat: 21.015,
        lostLng: 105.815,
        isOwn: false,
        ownerDisplayName: 'Finder B',
        ownerPhotoURL: null,
        reportedAt: '2026-09-24T01:00:00Z',
      };

      const lostNorm = normalizeLostToDiscovery(
        [{ itemId: 'common-uuid-999', lat: 21.01, lng: 105.81, isOwn: true }],
        [lostCard]
      );
      const foundNorm = normalizeFoundToDiscovery(
        [{ itemId: 'found:common-uuid-999', lat: 21.015, lng: 105.815, isOwn: false }],
        [foundCard]
      );

      const merged = mergeDiscoveryResults(lostNorm, foundNorm);

      expect(merged.pins).toHaveLength(2);
      expect(merged.cards).toHaveLength(2);

      // Verify compound keys
      expect(merged.pins[0]!.discoveryKey).toBe('LOST_ITEM:common-uuid-999');
      expect(merged.pins[1]!.discoveryKey).toBe('FOUND_REPORT:common-uuid-999');

      // Verify rawId preserved separately for navigation
      expect(merged.cards.find(c => c.discoveryKey === 'LOST_ITEM:common-uuid-999')?.rawId).toBe(
        'common-uuid-999'
      );
      expect(merged.cards.find(c => c.discoveryKey === 'FOUND_REPORT:common-uuid-999')?.rawId).toBe(
        'common-uuid-999'
      );
    });
  });

  describe('Discovery Query Orchestration', () => {
    it('fetches both LOST and FOUND when typeFilter is ALL', async () => {
      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockLostCard],
        pins: [mockLostPin],
        myLostCount: 1,
        nearbyCount: 1,
      });

      (foundReportsApi.getFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockFoundCard],
        pins: [mockFoundPin],
        totalCount: 1,
      });

      await mountHarness();

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      expect(radarApi.getHomeLostFeed).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 21.005, lng: 105.844 })
      );
      expect(foundReportsApi.getFeed).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 21.005, lng: 105.844 })
      );

      expect(hookResult.discoveryCards).toHaveLength(2);
      expect(hookResult.mapPins).toHaveLength(2);
      expect(hookResult.myLostCount).toBe(1);
    });

    it('fetches only LOST when typeFilter is changed to LOST', async () => {
      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValue({
        cards: [mockLostCard],
        pins: [mockLostPin],
        myLostCount: 1,
        nearbyCount: 1,
      });

      await mountHarness();

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      (radarApi.getHomeLostFeed as jest.Mock).mockClear();
      (foundReportsApi.getFeed as jest.Mock).mockClear();

      await act(async () => {
        hookResult.setTypeFilter('LOST');
      });

      expect(radarApi.getHomeLostFeed).toHaveBeenCalled();
      expect(foundReportsApi.getFeed).not.toHaveBeenCalled();
      expect(hookResult.typeFilter).toBe('LOST');
      expect(hookResult.discoveryCards).toHaveLength(1);
      expect(hookResult.discoveryCards[0]!.source).toBe('LOST_ITEM');
    });

    it('fetches only FOUND when typeFilter is changed to FOUND', async () => {
      (foundReportsApi.getFeed as jest.Mock).mockResolvedValue({
        cards: [mockFoundCard],
        pins: [mockFoundPin],
        totalCount: 1,
      });

      await mountHarness();

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      (radarApi.getHomeLostFeed as jest.Mock).mockClear();
      (foundReportsApi.getFeed as jest.Mock).mockClear();

      await act(async () => {
        hookResult.setTypeFilter('FOUND');
      });

      expect(foundReportsApi.getFeed).toHaveBeenCalled();
      expect(radarApi.getHomeLostFeed).not.toHaveBeenCalled();
      expect(hookResult.typeFilter).toBe('FOUND');
      expect(hookResult.discoveryCards).toHaveLength(1);
      expect(hookResult.discoveryCards[0]!.source).toBe('FOUND_REPORT');
    });

    it('propagates category filter to API calls when selected', async () => {
      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValue({
        cards: [mockLostCard],
        pins: [mockLostPin],
        myLostCount: 0,
        nearbyCount: 1,
      });
      (foundReportsApi.getFeed as jest.Mock).mockResolvedValue({
        cards: [],
        pins: [],
        totalCount: 0,
      });

      await mountHarness();

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      (radarApi.getHomeLostFeed as jest.Mock).mockClear();

      await act(async () => {
        hookResult.setCategoryFilter('wallet');
      });

      expect(radarApi.getHomeLostFeed).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'wallet' })
      );
      expect(foundReportsApi.getFeed).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'wallet' })
      );
      expect(hookResult.categoryFilter).toBe('wallet');
    });
  });

  describe('Partial Failure & Fault Isolation (No Cross-Viewport Mixing)', () => {
    it('renders only LOST items when FOUND feed fails, with non-blocking notice and zero old pins retained', async () => {
      const onPartialError = jest.fn();
      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockLostCard],
        pins: [mockLostPin],
        myLostCount: 1,
        nearbyCount: 1,
      });
      (foundReportsApi.getFeed as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await mountHarness(mockOnError, onPartialError);

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      expect(hookResult.discoveryCards).toHaveLength(1);
      expect(hookResult.discoveryCards[0]!.discoveryKey).toBe('LOST_ITEM:item-101');
      expect(hookResult.mapPins).toHaveLength(1);
      expect(onPartialError).toHaveBeenCalledWith(
        expect.stringContaining('Đã tải đồ thất lạc; không thể tải bài đăng nhặt được')
      );
    });

    it('renders only FOUND reports when LOST feed fails, with non-blocking notice', async () => {
      const onPartialError = jest.fn();
      (radarApi.getHomeLostFeed as jest.Mock).mockRejectedValueOnce(new Error('Radar timeout'));
      (foundReportsApi.getFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockFoundCard],
        pins: [mockFoundPin],
        totalCount: 1,
      });

      await mountHarness(mockOnError, onPartialError);

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      expect(hookResult.discoveryCards).toHaveLength(1);
      expect(hookResult.discoveryCards[0]!.discoveryKey).toBe('FOUND_REPORT:report-202');
      expect(hookResult.mapPins).toHaveLength(1);
      expect(onPartialError).toHaveBeenCalledWith(
        expect.stringContaining('Đã tải bài đăng nhặt được; không thể tải đồ thất lạc')
      );
    });

    it('preserves previous data and indicates failure when both feeds fail', async () => {
      const onError = jest.fn();

      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockLostCard],
        pins: [mockLostPin],
        myLostCount: 1,
        nearbyCount: 1,
      });
      (foundReportsApi.getFeed as jest.Mock).mockResolvedValueOnce({
        cards: [mockFoundCard],
        pins: [mockFoundPin],
        totalCount: 1,
      });

      await mountHarness(onError);

      await act(async () => {
        hookResult.handleUserLocationChange({ latitude: 21.005, longitude: 105.844 });
      });

      expect(hookResult.discoveryCards).toHaveLength(2);

      (radarApi.getHomeLostFeed as jest.Mock).mockRejectedValueOnce(new Error('500 Error'));
      (foundReportsApi.getFeed as jest.Mock).mockRejectedValueOnce(new Error('500 Error'));

      await act(async () => {
        await hookResult.refreshDiscovery();
      });

      expect(hookResult.discoveryCards).toHaveLength(2);
      expect(hookResult.refreshFailed).toBe(true);
      expect(onError).toHaveBeenCalledWith(
        expect.stringContaining('Không thể làm mới dữ liệu khám phá')
      );
    });
  });

  describe('Request Race Condition Protection', () => {
    it('discards stale response when a newer request resolves earlier', async () => {
      jest.useFakeTimers();

      let resolveSlowRequest: (val: any) => void;
      const slowPromise = new Promise(resolve => {
        resolveSlowRequest = resolve;
      });

      await mountHarness();

      (radarApi.getHomeLostFeed as jest.Mock).mockReturnValueOnce(slowPromise as any);
      (foundReportsApi.getFeed as jest.Mock).mockReturnValueOnce(slowPromise as any);

      act(() => {
        hookResult.fetchViewportDiscovery({ latitude: 21.01, longitude: 105.81 }, 2000);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const fastLostCard = { ...mockLostCard, itemId: 'item-fast', name: 'Fast Item' };
      (radarApi.getHomeLostFeed as jest.Mock).mockResolvedValueOnce({
        cards: [fastLostCard],
        pins: [{ itemId: 'item-fast', lat: 21.05, lng: 105.85, isOwn: false }],
        myLostCount: 0,
        nearbyCount: 1,
      });
      (foundReportsApi.getFeed as jest.Mock).mockResolvedValueOnce({
        cards: [],
        pins: [],
        totalCount: 0,
      });

      act(() => {
        hookResult.fetchViewportDiscovery({ latitude: 21.05, longitude: 105.85 }, 2000);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(hookResult.discoveryCards[0]!.rawId).toBe('item-fast');

      await act(async () => {
        resolveSlowRequest!({
          cards: [mockLostCard],
          pins: [mockLostPin],
          myLostCount: 0,
          nearbyCount: 1,
        });
        await Promise.resolve();
      });

      expect(hookResult.discoveryCards[0]!.rawId).toBe('item-fast');

      jest.useRealTimers();
    });
  });
});
