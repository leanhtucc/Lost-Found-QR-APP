import { HomeLostFeedCard, MapDiscoveryCard } from '@/types/radar';

export function resolveLostItemNavigation(
  itemId: string,
  cards: (HomeLostFeedCard | MapDiscoveryCard)[]
): {
  route: 'ItemDetails' | 'PublicItemDetails' | 'FoundReportDetails';
  params: Record<string, string>;
} {
  const matchedCard = cards.find(
    card =>
      ('discoveryKey' in card && card.discoveryKey === itemId) ||
      ('itemId' in card && card.itemId === itemId) ||
      ('rawId' in card && (card as MapDiscoveryCard).rawId === itemId)
  );

  const isFound =
    (matchedCard &&
      'source' in matchedCard &&
      (matchedCard as MapDiscoveryCard).source === 'FOUND_REPORT') ||
    itemId.startsWith('FOUND_REPORT:') ||
    itemId.startsWith('found:') ||
    (matchedCard &&
      'itemId' in matchedCard &&
      typeof matchedCard.itemId === 'string' &&
      matchedCard.itemId.startsWith('found:'));

  if (isFound) {
    const reportId =
      matchedCard && 'rawId' in matchedCard && (matchedCard as MapDiscoveryCard).rawId
        ? (matchedCard as MapDiscoveryCard).rawId
        : itemId.replace(/^(FOUND_REPORT:|found:)/, '');
    return {
      route: 'FoundReportDetails',
      params: { reportId },
    };
  }

  const cleanItemId =
    matchedCard && 'rawId' in matchedCard && (matchedCard as MapDiscoveryCard).rawId
      ? (matchedCard as MapDiscoveryCard).rawId
      : itemId.replace(/^LOST_ITEM:/, '');

  if (matchedCard?.isOwn === true) {
    return {
      route: 'ItemDetails',
      params: { itemId: cleanItemId },
    };
  }

  return {
    route: 'PublicItemDetails',
    params: { itemId: cleanItemId },
  };
}

describe('Home Screen Lost Item Navigation (Phase 2 Verification)', () => {
  const cards: HomeLostFeedCard[] = [
    {
      itemId: 'own-item-1',
      name: 'Ví của tôi',
      category: 'wallet',
      imagePublicUrl: null,
      lostMessage: null,
      address: null,
      distanceMeters: 100,
      distanceLabel: '100m',
      lostLat: 21.028,
      lostLng: 105.834,
      isOwn: true,
      ownerDisplayName: 'Me',
      ownerPhotoURL: null,
      reportedAt: '2026-09-22T00:00:00Z',
      reportType: 'LOST',
    },
    {
      itemId: 'public-item-2',
      name: 'Balo người khác',
      category: 'bag',
      imagePublicUrl: null,
      lostMessage: null,
      address: null,
      distanceMeters: 500,
      distanceLabel: '500m',
      lostLat: 21.03,
      lostLng: 105.84,
      isOwn: false,
      ownerDisplayName: 'Other',
      ownerPhotoURL: null,
      reportedAt: '2026-09-22T00:00:00Z',
      reportType: 'LOST',
    },
    {
      itemId: 'guest-item-3',
      name: 'Vật phẩm không rõ sở hữu',
      category: 'other',
      imagePublicUrl: null,
      lostMessage: null,
      address: null,
      distanceMeters: 800,
      distanceLabel: '800m',
      lostLat: 21.035,
      lostLng: 105.845,
      isOwn: undefined as unknown as boolean,
      ownerDisplayName: 'Unknown',
      ownerPhotoURL: null,
      reportedAt: '2026-09-22T00:00:00Z',
      reportType: 'LOST',
    },
  ];

  it('navigates to ItemDetails when isOwn === true', () => {
    const nav = resolveLostItemNavigation('own-item-1', cards);
    expect(nav.route).toBe('ItemDetails');
    expect(nav.params).toEqual({ itemId: 'own-item-1' });
  });

  it('navigates to PublicItemDetails when isOwn === false', () => {
    const nav = resolveLostItemNavigation('public-item-2', cards);
    expect(nav.route).toBe('PublicItemDetails');
    expect(nav.params).toEqual({ itemId: 'public-item-2' });
  });

  it('navigates to PublicItemDetails for guest or undefined isOwn', () => {
    const nav = resolveLostItemNavigation('guest-item-3', cards);
    expect(nav.route).toBe('PublicItemDetails');
    expect(nav.params).toEqual({ itemId: 'guest-item-3' });
  });

  it('navigates to PublicItemDetails if itemId is not found in cards (fallback security)', () => {
    const nav = resolveLostItemNavigation('unknown-item-99', cards);
    expect(nav.route).toBe('PublicItemDetails');
    expect(nav.params).toEqual({ itemId: 'unknown-item-99' });
  });

  it('navigates to FoundReportDetails when itemId begins with found:', () => {
    const nav = resolveLostItemNavigation('found:report-123', cards);
    expect(nav.route).toBe('FoundReportDetails');
    expect(nav.params).toEqual({ reportId: 'report-123' });
  });

  it('navigates to FoundReportDetails for canonical FOUND_REPORT: key', () => {
    const nav = resolveLostItemNavigation('FOUND_REPORT:report-777', cards);
    expect(nav.route).toBe('FoundReportDetails');
    expect(nav.params).toEqual({ reportId: 'report-777' });
  });

  it('navigates to ItemDetails for canonical LOST_ITEM: key when isOwn === true', () => {
    const discoveryCards: MapDiscoveryCard[] = [
      {
        discoveryKey: 'LOST_ITEM:own-item-1',
        rawId: 'own-item-1',
        source: 'LOST_ITEM',
        reportType: 'LOST',
        name: 'Ví của tôi',
        category: 'wallet',
        imagePublicUrl: null,
        lostMessage: null,
        address: null,
        distanceMeters: 100,
        distanceLabel: '100m',
        lostLat: 21.028,
        lostLng: 105.834,
        isOwn: true,
        ownerDisplayName: 'Me',
        ownerPhotoURL: null,
        reportedAt: '2026-09-22T00:00:00Z',
      },
    ];

    const nav = resolveLostItemNavigation('LOST_ITEM:own-item-1', discoveryCards);
    expect(nav.route).toBe('ItemDetails');
    expect(nav.params).toEqual({ itemId: 'own-item-1' });
  });

  it('navigates to PublicItemDetails for canonical LOST_ITEM: key when isOwn === false', () => {
    const discoveryCards: MapDiscoveryCard[] = [
      {
        discoveryKey: 'LOST_ITEM:public-item-2',
        rawId: 'public-item-2',
        source: 'LOST_ITEM',
        reportType: 'LOST',
        name: 'Balo người khác',
        category: 'bag',
        imagePublicUrl: null,
        lostMessage: null,
        address: null,
        distanceMeters: 500,
        distanceLabel: '500m',
        lostLat: 21.03,
        lostLng: 105.84,
        isOwn: false,
        ownerDisplayName: 'Other',
        ownerPhotoURL: null,
        reportedAt: '2026-09-22T00:00:00Z',
      },
    ];

    const nav = resolveLostItemNavigation('LOST_ITEM:public-item-2', discoveryCards);
    expect(nav.route).toBe('PublicItemDetails');
    expect(nav.params).toEqual({ itemId: 'public-item-2' });
  });
});
