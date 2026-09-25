import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { MapSection } from '../MapSection';
import { RadarItemPreviewCard } from '../RadarItemPreviewCard';
import {
  HomeLostFeedCard,
  HomeLostFeedPin,
  MapDiscoveryCard,
  MapDiscoveryPin,
} from '@/types/radar';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
      fitToCoordinates: jest.fn(),
    }));
    return (
      <View testID={props.testID || 'mock-mapview'} {...props}>
        {props.children}
      </View>
    );
  });

  const MockMarker = (props: any) => {
    return (
      <View testID={props.testID || 'mock-marker'} {...props}>
        {props.children}
      </View>
    );
  };

  const MockCircle = (props: any) => {
    return <View testID="mock-circle" {...props} />;
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Circle: MockCircle,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 21.0278,
      longitude: 105.8342,
      accuracy: 10,
    },
  }),
  watchPositionAsync: jest.fn().mockResolvedValue({
    remove: jest.fn(),
  }),
  Accuracy: {
    Low: 1,
    Balanced: 3,
    High: 4,
  },
}));

describe('MapSection', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockOnUserLocationChange = jest.fn();
  const mockOnSelectItem = jest.fn();
  const mockOnLocationPermissionChange = jest.fn();
  const mockOnViewportChange = jest.fn();

  const samplePins: HomeLostFeedPin[] = [
    {
      itemId: 'item-public-1',
      lat: 21.028,
      lng: 105.835,
      isOwn: false,
    },
    {
      itemId: 'item-own-2',
      lat: 21.03,
      lng: 105.837,
      isOwn: true,
    },
  ];

  const sampleCards: HomeLostFeedCard[] = [
    {
      itemId: 'item-public-1',
      name: 'Ví da Nam châm',
      category: 'wallet',
      imagePublicUrl: 'https://example.com/wallet.jpg',
      lostMessage: 'Rơi tại quán trà chanh',
      address: 'Phố Nhà Thờ, Hoàn Kiếm, Hà Nội',
      distanceMeters: 450,
      distanceLabel: '450m',
      lostLat: 21.028,
      lostLng: 105.835,
      isOwn: false,
      ownerDisplayName: 'Nguyễn Văn Nam',
      ownerPhotoURL: null,
      reportedAt: '2026-09-20T10:00:00.000Z',
      reportType: 'LOST',
    },
    {
      itemId: 'item-own-2',
      name: 'Chìa khóa Smartkey',
      category: 'keys',
      imagePublicUrl: null,
      lostMessage: 'Chùm chìa khóa Honda có móc gấu',
      address: 'Hồ Hoàn Kiếm, Hà Nội',
      distanceMeters: 1200,
      distanceLabel: '1.2km',
      lostLat: 21.03,
      lostLng: 105.837,
      isOwn: true,
      ownerDisplayName: 'Tôi',
      ownerPhotoURL: null,
      reportedAt: '2026-09-21T08:30:00.000Z',
      reportType: 'LOST',
    },
  ];

  const renderComponent = async (props = {}) => {
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <MapSection
          pins={samplePins}
          cards={sampleCards}
          onUserLocationChange={mockOnUserLocationChange}
          onSelectItem={mockOnSelectItem}
          onLocationPermissionChange={mockOnLocationPermissionChange}
          onViewportChange={mockOnViewportChange}
          {...props}
        />
      );
    });
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

  it('renders MapView with native markers assigned correct pinColor based on isOwn', async () => {
    await renderComponent();

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'home-radar-map' });
    expect(mapView).toBeDefined();

    const publicMarker = root.findByProps({ testID: 'radar-marker-item-public-1' });
    expect(publicMarker.props.pinColor).toBe('#f97316'); // Public item color

    const ownMarker = root.findByProps({ testID: 'radar-marker-item-own-2' });
    expect(ownMarker.props.pinColor).toBe('#6366f1'); // Own item color
  });

  it('displays RadarItemPreviewCard when a marker is pressed, and dismisses on close press', async () => {
    await renderComponent();

    const root = renderer!.root;

    // Initially no preview card
    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(0);

    // Tap public marker
    const publicMarker = root.findByProps({ testID: 'radar-marker-item-public-1' });
    await act(async () => {
      publicMarker.props.onPress({ stopPropagation: jest.fn() });
    });

    // Preview card is rendered with item info
    const previewCards = root.findAllByType(RadarItemPreviewCard);
    expect(previewCards).toHaveLength(1);
    expect(previewCards[0].props.card.name).toBe('Ví da Nam châm');

    // Close preview card
    const closeBtn = root.findByProps({ testID: 'radar-preview-close-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    // Preview card is dismissed
    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(0);
  });

  it('invokes onSelectItem when "Xem chi tiết" CTA is pressed on RadarItemPreviewCard', async () => {
    await renderComponent();

    const root = renderer!.root;

    // Tap own marker
    const ownMarker = root.findByProps({ testID: 'radar-marker-item-own-2' });
    await act(async () => {
      ownMarker.props.onPress({ stopPropagation: jest.fn() });
    });

    // Tap CTA button
    const detailBtn = root.findByProps({ testID: 'radar-preview-detail-btn' });
    await act(async () => {
      detailBtn.props.onPress();
    });

    expect(mockOnSelectItem).toHaveBeenCalledWith('item-own-2');
  });

  it('dismisses preview card when tapping the map background', async () => {
    await renderComponent();

    const root = renderer!.root;
    const publicMarker = root.findByProps({ testID: 'radar-marker-item-public-1' });
    await act(async () => {
      publicMarker.props.onPress({ stopPropagation: jest.fn() });
    });

    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(1);

    // Tap map background
    const mapView = root.findByProps({ testID: 'home-radar-map' });
    await act(async () => {
      mapView.props.onPress();
    });

    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(0);
  });

  it('triggers onViewportChange when map region changes after map is ready', async () => {
    await renderComponent();

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'home-radar-map' });

    // Mark map ready
    await act(async () => {
      mapView.props.onMapReady();
    });

    // Simulate region change
    await act(async () => {
      mapView.props.onRegionChangeComplete({
        latitude: 21.0285,
        longitude: 105.8544,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    });

    expect(mockOnViewportChange).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 21.0285,
        lng: 105.8544,
        radius: expect.any(Number),
      })
    );
  });

  it('automatically clears selected marker when item leaves new viewport cards', async () => {
    await renderComponent();

    const root = renderer!.root;
    const publicMarker = root.findByProps({ testID: 'radar-marker-item-public-1' });
    await act(async () => {
      publicMarker.props.onPress({ stopPropagation: jest.fn() });
    });

    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(1);

    // Viewport query returns new cards excluding item-public-1
    await act(async () => {
      renderer!.update(
        <MapSection
          pins={[samplePins[1]]}
          cards={[sampleCards[1]]}
          onUserLocationChange={mockOnUserLocationChange}
          onSelectItem={mockOnSelectItem}
        />
      );
    });

    // Preview card is automatically dismissed
    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(0);
  });

  it('correctly joins pins and cards by canonical itemId regardless of array ordering (pins [A, B] vs cards [B, A])', async () => {
    // pins order: [A, B]
    const pinsAB = [samplePins[0], samplePins[1]];
    // cards order: [B, A]
    const cardsBA = [sampleCards[1], sampleCards[0]];

    await renderComponent({ pins: pinsAB, cards: cardsBA });

    const root = renderer!.root;

    // Tap marker A
    const markerA = root.findByProps({ testID: 'radar-marker-item-public-1' });
    await act(async () => {
      markerA.props.onPress({ stopPropagation: jest.fn() });
    });

    // Preview card must display card A info
    let previewCards = root.findAllByType(RadarItemPreviewCard);
    expect(previewCards).toHaveLength(1);
    expect(previewCards[0].props.card.itemId).toBe('item-public-1');
    expect(previewCards[0].props.card.name).toBe('Ví da Nam châm');

    // Close preview card
    const closeBtn = root.findByProps({ testID: 'radar-preview-close-btn' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    // Tap marker B
    const markerB = root.findByProps({ testID: 'radar-marker-item-own-2' });
    await act(async () => {
      markerB.props.onPress({ stopPropagation: jest.fn() });
    });

    // Preview card must display card B info
    previewCards = root.findAllByType(RadarItemPreviewCard);
    expect(previewCards).toHaveLength(1);
    expect(previewCards[0].props.card.itemId).toBe('item-own-2');
    expect(previewCards[0].props.card.name).toBe('Chìa khóa Smartkey');
  });

  it('handles pin without matching card gracefully without crashing', async () => {
    const orphanPin: HomeLostFeedPin = {
      itemId: 'orphan-pin-id',
      lat: 21.04,
      lng: 105.86,
      isOwn: false,
    };

    await renderComponent({ pins: [orphanPin], cards: [] });

    const root = renderer!.root;
    const orphanMarker = root.findByProps({ testID: 'radar-marker-orphan-pin-id' });
    expect(orphanMarker).toBeDefined();

    // Tap orphan marker: should not crash and should not render preview card
    await act(async () => {
      orphanMarker.props.onPress({ stopPropagation: jest.fn() });
    });

    expect(root.findAllByType(RadarItemPreviewCard)).toHaveLength(0);
  });

  it('deduplicates pins with identical itemId so no duplicate markers are rendered on the map', async () => {
    const duplicatePins = [samplePins[0], samplePins[0], samplePins[1]];

    await renderComponent({ pins: duplicatePins });

    const root = renderer!.root;

    const { Marker } = require('react-native-maps');
    const allMarkers = root.findAllByType(Marker);

    // Exactly 2 markers rendered (item-public-1 and item-own-2), duplicate is discarded
    expect(allMarkers).toHaveLength(2);

    const publicMarkers = allMarkers.filter(m => m.props.testID === 'radar-marker-item-public-1');
    expect(publicMarkers).toHaveLength(1);

    const ownMarkers = allMarkers.filter(m => m.props.testID === 'radar-marker-item-own-2');
    expect(ownMarkers).toHaveLength(1);
  });

  it('displays non-blocking 10 km capped viewport indicator when zoomed out beyond 10 km', async () => {
    await renderComponent();

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'home-radar-map' });

    await act(async () => {
      mapView.props.onMapReady();
    });

    // Zoomed-out region: delta 0.3 degrees ~ 33 km (well above 10 km cap)
    await act(async () => {
      mapView.props.onRegionChangeComplete({
        latitude: 21.0285,
        longitude: 105.8544,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      });
    });

    // Capped indicator is visible
    const cappedIndicator = root.findByProps({ testID: 'radar-capped-indicator' });
    expect(cappedIndicator).toBeDefined();
  });

  it('renders emerald green marker for FOUND reports and opens preview with FOUND badge', async () => {
    const mixedPins = [
      ...samplePins,
      {
        discoveryKey: 'FOUND_REPORT:rep-1',
        rawId: 'rep-1',
        source: 'FOUND_REPORT' as const,
        lat: 21.035,
        lng: 105.84,
        isOwn: false,
      },
    ];

    const mixedCards = [
      ...sampleCards,
      {
        discoveryKey: 'FOUND_REPORT:rep-1',
        rawId: 'rep-1',
        source: 'FOUND_REPORT' as const,
        reportType: 'FOUND' as const,
        name: 'Đồng hồ Casio nhặt được',
        category: 'other',
        imagePublicUrl: null,
        lostMessage: 'Nhặt ở ghế đá',
        address: 'Hồ Gươm',
        distanceMeters: 600,
        distanceLabel: '600m',
        lat: 21.035,
        lng: 105.84,
        isOwn: false,
        ownerDisplayName: 'Người nhặt được',
        ownerPhotoURL: null,
        reportedAt: '2026-09-24T00:00:00Z',
      },
    ];

    await renderComponent({ pins: mixedPins, cards: mixedCards });

    const root = renderer!.root;
    const { Marker } = require('react-native-maps');
    const allMarkers = root.findAllByType(Marker);

    expect(allMarkers).toHaveLength(3);

    // Verify pin colors: Public Lost = #f97316, Own Lost = #6366f1, Found = #10b981
    const publicLostMarker = allMarkers.find(m => m.props.testID === 'radar-marker-item-public-1');
    expect(publicLostMarker).toBeDefined();
    expect(publicLostMarker?.props.pinColor).toBe('#f97316');

    const ownLostMarker = allMarkers.find(m => m.props.testID === 'radar-marker-item-own-2');
    expect(ownLostMarker).toBeDefined();
    expect(ownLostMarker?.props.pinColor).toBe('#6366f1');

    const foundMarker = allMarkers.find(m => m.props.testID === 'radar-marker-FOUND_REPORT:rep-1');
    expect(foundMarker).toBeDefined();
    expect(foundMarker?.props.pinColor).toBe('#10b981');

    // Tapping found marker opens preview card
    await act(async () => {
      foundMarker?.props.onPress({ stopPropagation: jest.fn() });
    });

    const previewCard = root.findByType(RadarItemPreviewCard);
    expect(previewCard).toBeDefined();
    expect(previewCard.props.card.name).toBe('Đồng hồ Casio nhặt được');
  });

  it('renders combined maximum markers (100 LOST + 300 FOUND) efficiently without crashing', async () => {
    const { Marker } = require('react-native-maps');
    const largePins: MapDiscoveryPin[] = [];
    const largeCards: MapDiscoveryCard[] = [];

    // 100 Lost pins
    for (let i = 0; i < 100; i++) {
      largePins.push({
        discoveryKey: `LOST_ITEM:lost-${i}`,
        rawId: `lost-${i}`,
        source: 'LOST_ITEM',
        lat: 21.02 + i * 0.001,
        lng: 105.83 + i * 0.001,
        isOwn: i === 0,
      });
      largeCards.push({
        discoveryKey: `LOST_ITEM:lost-${i}`,
        rawId: `lost-${i}`,
        source: 'LOST_ITEM',
        reportType: 'LOST',
        name: `Đồ mất #${i}`,
        category: 'electronics',
        imagePublicUrl: null,
        lostMessage: null,
        address: 'Hà Nội',
        distanceMeters: i * 50,
        distanceLabel: `${i * 50}m`,
        lostLat: 21.02 + i * 0.001,
        lostLng: 105.83 + i * 0.001,
        isOwn: i === 0,
        ownerDisplayName: 'Owner',
        ownerPhotoURL: null,
        reportedAt: '2026-09-24T00:00:00Z',
      });
    }

    // 300 Found pins
    for (let j = 0; j < 300; j++) {
      largePins.push({
        discoveryKey: `FOUND_REPORT:found-${j}`,
        rawId: `found-${j}`,
        source: 'FOUND_REPORT',
        lat: 21.03 + j * 0.0005,
        lng: 105.84 + j * 0.0005,
        isOwn: false,
      });
      largeCards.push({
        discoveryKey: `FOUND_REPORT:found-${j}`,
        rawId: `found-${j}`,
        source: 'FOUND_REPORT',
        reportType: 'FOUND',
        name: `Đồ nhặt #${j}`,
        category: 'wallet',
        imagePublicUrl: null,
        lostMessage: null,
        address: 'Hà Nội',
        distanceMeters: j * 30,
        distanceLabel: `${j * 30}m`,
        lostLat: 21.03 + j * 0.0005,
        lostLng: 105.84 + j * 0.0005,
        isOwn: false,
        ownerDisplayName: 'Finder',
        ownerPhotoURL: null,
        reportedAt: '2026-09-24T00:00:00Z',
      });
    }

    const startTime = Date.now();
    await renderComponent({ pins: largePins, cards: largeCards });
    const elapsed = Date.now() - startTime;

    const allMarkers = renderer!.root.findAllByType(Marker);
    expect(allMarkers).toHaveLength(400);
    expect(elapsed).toBeLessThan(5000); // Renders cleanly well under 5 seconds
  });
});
