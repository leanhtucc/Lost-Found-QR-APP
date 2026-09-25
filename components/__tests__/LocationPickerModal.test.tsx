import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { LocationPickerModal } from '../molecules/LocationPickerModal';
import * as Location from 'expo-location';
import { Alert, TouchableOpacity, Pressable } from 'react-native';

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
    }));
    return (
      <View testID="mock-mapview" {...props}>
        {props.children}
      </View>
    );
  });

  const MockMarker = (props: any) => {
    return (
      <View testID="mock-marker" {...props}>
        {props.children}
      </View>
    );
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
    High: 4,
  },
}));

describe('LocationPickerModal', () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
  });

  it('renders modal in unselected state when initialCoordinate is null', () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    // MapView exists
    const mapView = root.findByProps({ testID: 'mock-mapview' });
    expect(mapView).toBeDefined();

    // No Marker rendered initially
    const markers = root.findAllByProps({ testID: 'mock-marker' }, { deep: false });
    expect(markers.length).toBe(0);

    // Confirm button is disabled
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    expect(confirmBtn.props.disabled).toBe(true);
  });

  it('renders modal with initial coordinates and enables confirm button', () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={{ latitude: 10.7769, longitude: 106.7009 }}
          initialAddress="123 Lê Lợi, Quận 1"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    // Exactly one Marker rendered
    const markers = root.findAllByProps({ testID: 'mock-marker' }, { deep: false });
    expect(markers.length).toBe(1);
    expect(markers[0].props.coordinate).toEqual({ latitude: 10.7769, longitude: 106.7009 });

    // Confirm button is enabled
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    expect(confirmBtn.props.disabled).toBe(false);
  });

  it('updates marker coordinate when user taps on map', async () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'mock-mapview' });

    // Simulate map press at Hanoi coordinate
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 21.0285, longitude: 105.8542 } },
      });
    });

    // Marker now exists at the tapped coordinate
    const markers = root.findAllByProps({ testID: 'mock-marker' }, { deep: false });
    expect(markers.length).toBe(1);
    expect(markers[0].props.coordinate.latitude).toBeCloseTo(21.0285, 4);
    expect(markers[0].props.coordinate.longitude).toBeCloseTo(105.8542, 4);

    // Confirm button is now enabled
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    expect(confirmBtn.props.disabled).toBe(false);
  });

  it('updates coordinate on marker drag end', () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={{ latitude: 10.7769, longitude: 106.7009 }}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const marker = root.findByProps({ testID: 'mock-marker' });

    // Drag marker to new coordinate
    act(() => {
      marker.props.onDragEnd({
        nativeEvent: { coordinate: { latitude: 10.8, longitude: 106.72 } },
      });
    });

    const updatedMarker = root.findByProps({ testID: 'mock-marker' });
    expect(updatedMarker.props.coordinate.latitude).toBeCloseTo(10.8, 4);
    expect(updatedMarker.props.coordinate.longitude).toBeCloseTo(106.72, 4);
  });

  it('discards draft changes when Cancel button is pressed', () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={{ latitude: 10.7769, longitude: 106.7009 }}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const cancelBtn = root.findByProps({ accessibilityLabel: 'Hủy' });

    act(() => {
      cancelBtn.props.onPress();
    });

    // Calls onClose, does NOT call onConfirm
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('confirms and passes selected coordinates when Confirm button is pressed', () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={{ latitude: 10.7769, longitude: 106.7009 }}
          initialAddress="123 Lê Lợi"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });

    act(() => {
      confirmBtn.props.onPress();
    });

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 10.7769,
        longitude: 106.7009,
        address: '123 Lê Lợi',
      })
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles GPS location fetch when permission is granted', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
      canAskAgain: true,
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: {
        latitude: 10.7725,
        longitude: 106.698,
        accuracy: 10,
      },
      timestamp: Date.now(),
    });

    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const gpsBtn = root.findByProps({ accessibilityLabel: 'Sử dụng vị trí hiện tại' });

    await act(async () => {
      await gpsBtn.props.onPress();
    });

    const markers = root.findAllByProps({ testID: 'mock-marker' }, { deep: false });
    expect(markers.length).toBe(1);
    expect(markers[0].props.coordinate.latitude).toBeCloseTo(10.7725, 4);
    expect(markers[0].props.coordinate.longitude).toBeCloseTo(106.698, 4);
  });

  it('handles GPS permission denied gracefully without crashing', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: false,
    });

    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const gpsBtn = root.findByProps({ accessibilityLabel: 'Sử dụng vị trí hiện tại' });

    await act(async () => {
      await gpsBtn.props.onPress();
    });

    // Alert shown to user in Vietnamese
    expect(Alert.alert).toHaveBeenCalledWith(
      'Quyền vị trí bị từ chối',
      expect.stringContaining('Cài đặt thiết bị'),
      expect.any(Array)
    );

    // Map manual selection remains functional
    const mapView = root.findByProps({ testID: 'mock-mapview' });
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 10.5, longitude: 106.5 } },
      });
    });

    const markers = root.findAllByProps({ testID: 'mock-marker' }, { deep: false });
    expect(markers.length).toBe(1);
  });

  it('race protection: ensures latest reverse-geocode result wins when earlier request resolves after later request (select A -> select B -> A resolves after B)', async () => {
    let resolveA!: (val: any) => void;
    let resolveB!: (val: any) => void;

    (Location.reverseGeocodeAsync as jest.Mock).mockImplementation((coord: any) => {
      if (Math.abs(coord.latitude - 10.1) < 0.001) {
        return new Promise(resolve => {
          resolveA = resolve;
        });
      }
      if (Math.abs(coord.latitude - 20.2) < 0.001) {
        return new Promise(resolve => {
          resolveB = resolve;
        });
      }
      return Promise.resolve([]);
    });

    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'mock-mapview' });

    // 1. Select A -> reverseGeocode(A) starts
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 10.1, longitude: 106.1 } },
      });
    });

    // 2. Select B -> reverseGeocode(B) starts
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 20.2, longitude: 106.2 } },
      });
    });

    // 3. Resolve B first
    await act(async () => {
      resolveB([{ street: 'Đường B', district: 'Quận B' }]);
    });

    // 4. Resolve A after B (stale resolution)
    await act(async () => {
      resolveA([{ street: 'Đường A', district: 'Quận A' }]);
    });

    // 5. Confirm
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    act(() => {
      confirmBtn.props.onPress();
    });

    // 6. Expected final state: coordinate B + address B (stale A was ignored)
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 20.2,
        longitude: 106.2,
        address: 'Đường B, Quận B',
      })
    );
  });

  it('allows coordinate confirmation even if reverse-geocoding fails with an error', async () => {
    (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Geocoding service unavailable')
    );

    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;
    const mapView = root.findByProps({ testID: 'mock-mapview' });

    // Tap map
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 10.8, longitude: 106.7 } },
      });
    });

    // Confirm button is still enabled despite geocode failure
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    expect(confirmBtn.props.disabled).toBe(false);

    act(() => {
      confirmBtn.props.onPress();
    });

    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 10.8,
        longitude: 106.7,
        address: undefined,
      })
    );
  });

  it('metadata consistency: manual map selection clears stale GPS accuracy', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
      canAskAgain: true,
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: {
        latitude: 10.7725,
        longitude: 106.698,
        accuracy: 15, // GPS accuracy is 15m
      },
      timestamp: 1672531200000,
    });

    act(() => {
      renderer = ReactTestRenderer.create(
        <LocationPickerModal
          visible={true}
          initialCoordinate={null}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );
    });

    const root = renderer!.root;

    // 1. Fetch GPS
    const gpsBtn = root.findByProps({ accessibilityLabel: 'Sử dụng vị trí hiện tại' });
    await act(async () => {
      await gpsBtn.props.onPress();
    });

    // 2. User then manually taps map to override location
    const mapView = root.findByProps({ testID: 'mock-mapview' });
    await act(async () => {
      mapView.props.onPress({
        nativeEvent: { coordinate: { latitude: 10.9, longitude: 106.8 } },
      });
    });

    // 3. Confirm
    const confirmBtn = root.findByProps({ accessibilityLabel: 'Xác nhận vị trí' });
    act(() => {
      confirmBtn.props.onPress();
    });

    // 4. Accuracy must be undefined (stale GPS accuracy cleared), timestamp is freshly generated
    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 10.9,
        longitude: 106.8,
        accuracyMeters: undefined,
      })
    );
  });
});
