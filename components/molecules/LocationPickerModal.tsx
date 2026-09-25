/**
 * LocationPickerModal Component
 * Phase 1 — Location Selection and Persistence
 *
 * Interactive Google Maps modal with:
 * - Tap to select coordinate
 * - Draggable marker with drag end update
 * - GPS current location button with permission checking and race condition protection
 * - Separate draft vs confirmed state management (cancellation discards draft changes)
 * - Safe area & dark mode styling matching FindBack design system
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  MapPressEvent,
  Marker,
  MarkerDragStartEndEvent,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Crosshair, MapPin, X } from 'lucide-react-native';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { FIND_BACK } from '@/constants/theme';
import { Coordinate, isValidCoordinate, SelectedLocation } from '@/types/location';

export interface LocationPickerModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  initialCoordinate?: Coordinate | null;
  initialAddress?: string;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  title = 'Chọn vị trí trên bản đồ',
  subtitle = 'Chạm vào bản đồ hoặc kéo ghim để chọn vị trí',
  initialCoordinate,
  initialAddress,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const isMountedRef = useRef(true);
  const geocodeRequestIdRef = useRef(0);
  const gpsRequestIdRef = useRef(0);

  // Separate DRAFT states (never overwrite confirmed state until user clicks Confirm)
  const [draftCoordinate, setDraftCoordinate] = useState<Coordinate | null>(null);
  const [draftAddress, setDraftAddress] = useState<string>('');
  const [draftAccuracy, setDraftAccuracy] = useState<number | undefined>(undefined);
  const [draftTimestamp, setDraftTimestamp] = useState<string | undefined>(undefined);

  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // When modal opens or initialCoordinate changes, initialize draft state
  useEffect(() => {
    if (visible) {
      if (initialCoordinate && isValidCoordinate(initialCoordinate)) {
        setDraftCoordinate({
          latitude: initialCoordinate.latitude,
          longitude: initialCoordinate.longitude,
        });
        setDraftAddress(initialAddress || '');
      } else {
        setDraftCoordinate(null);
        setDraftAddress('');
      }
      setDraftAccuracy(undefined);
      setDraftTimestamp(undefined);
      setIsLocatingGPS(false);
      setIsGeocoding(false);
    }
  }, [visible, initialCoordinate, initialAddress]);

  // Animate map camera to initial coordinate once map is ready
  useEffect(() => {
    if (visible && isMapReady && initialCoordinate && isValidCoordinate(initialCoordinate)) {
      mapRef.current?.animateToRegion(
        {
          latitude: initialCoordinate.latitude,
          longitude: initialCoordinate.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        400
      );
    }
  }, [visible, isMapReady, initialCoordinate]);

  /**
   * Reverse geocodes a coordinate asynchronously with race-condition guard.
   * A failure in reverse geocoding does NOT block coordinate selection.
   */
  const resolveAddressAsync = useCallback(async (coord: Coordinate) => {
    const currentRequestId = ++geocodeRequestIdRef.current;
    setIsGeocoding(true);

    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coord.latitude,
        longitude: coord.longitude,
      });

      // Guard against stale asynchronous results or unmounted component
      if (!isMountedRef.current || currentRequestId !== geocodeRequestIdRef.current) {
        return;
      }

      if (results && results.length > 0) {
        const item = results[0];
        const parts = [
          item.streetNumber,
          item.street,
          item.subregion || item.district,
          item.region || item.city,
        ].filter(Boolean);

        if (parts.length > 0) {
          setDraftAddress(parts.join(', '));
        }
      }
    } catch {
      // Reverse geocoding failure is non-fatal: user can still confirm coordinates
    } finally {
      if (isMountedRef.current && currentRequestId === geocodeRequestIdRef.current) {
        setIsGeocoding(false);
      }
    }
  }, []);

  /**
   * Tap on map selects or moves the marker
   */
  const handleMapPress = useCallback(
    (e: MapPressEvent) => {
      const coord = e.nativeEvent.coordinate;
      if (!isValidCoordinate(coord)) {
        return;
      }

      const nextCoord: Coordinate = {
        latitude: Number(coord.latitude.toFixed(6)),
        longitude: Number(coord.longitude.toFixed(6)),
      };

      setDraftCoordinate(nextCoord);
      setDraftAddress(''); // Clear previous address until geocoded
      setDraftTimestamp(new Date().toISOString());
      setDraftAccuracy(undefined);

      void resolveAddressAsync(nextCoord);
    },
    [resolveAddressAsync]
  );

  /**
   * Drag end updates the marker's coordinate
   */
  const handleMarkerDragEnd = useCallback(
    (e: MarkerDragStartEndEvent) => {
      const coord = e.nativeEvent.coordinate;
      if (!isValidCoordinate(coord)) {
        return;
      }

      const nextCoord: Coordinate = {
        latitude: Number(coord.latitude.toFixed(6)),
        longitude: Number(coord.longitude.toFixed(6)),
      };

      setDraftCoordinate(nextCoord);
      setDraftAddress('');
      setDraftTimestamp(new Date().toISOString());
      setDraftAccuracy(undefined);

      void resolveAddressAsync(nextCoord);
    },
    [resolveAddressAsync]
  );

  /**
   * GPS: Request foreground permission on demand, fetch current coordinates,
   * animate camera to current position and place marker.
   */
  const handleUseCurrentLocation = useCallback(async () => {
    const currentGpsId = ++gpsRequestIdRef.current;

    try {
      setIsLocatingGPS(true);

      // 1. Check existing permission
      let perm = await Location.getForegroundPermissionsAsync();

      // 2. Request if not determined or can ask
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain) {
          Alert.alert(
            'Quyền vị trí bị từ chối',
            'Bạn đã từ chối quyền truy cập vị trí trước đó. Bạn vẫn có thể chạm vào bản đồ để chọn vị trí thủ công, hoặc bật lại quyền trong Cài đặt thiết bị.',
            [{ text: 'Đã hiểu' }]
          );
          return;
        }

        perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert(
            'Quyền vị trí chưa được cấp',
            'Cần quyền vị trí để định vị GPS. Bạn vẫn có thể chạm vào bản đồ để chọn vị trí thủ công.',
            [{ text: 'Đóng' }]
          );
          return;
        }
      }

      // 3. Acquire location with timeout
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Guard against stale response or unmounted component
      if (!isMountedRef.current || currentGpsId !== gpsRequestIdRef.current) {
        return;
      }

      const nextCoord: Coordinate = {
        latitude: Number(loc.coords.latitude.toFixed(6)),
        longitude: Number(loc.coords.longitude.toFixed(6)),
      };

      if (!isValidCoordinate(nextCoord)) {
        Alert.alert('Lỗi tọa độ', 'Tọa độ nhận được từ thiết bị không hợp lệ.');
        return;
      }

      setDraftCoordinate(nextCoord);
      setDraftAccuracy(loc.coords.accuracy ?? undefined);
      setDraftTimestamp(new Date(loc.timestamp).toISOString());

      // 4. Animate camera to new location
      mapRef.current?.animateToRegion(
        {
          latitude: nextCoord.latitude,
          longitude: nextCoord.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        400
      );

      // 5. Reverse geocode asynchronously
      void resolveAddressAsync(nextCoord);
    } catch (err: any) {
      if (!isMountedRef.current || currentGpsId !== gpsRequestIdRef.current) {
        return;
      }
      Alert.alert(
        'Không thể lấy vị trí GPS',
        err?.message ||
          'Không thể lấy vị trí hiện tại lúc này. Bạn vẫn có thể chạm vào bản đồ để đặt ghim vị trí.'
      );
    } finally {
      if (isMountedRef.current && currentGpsId === gpsRequestIdRef.current) {
        setIsLocatingGPS(false);
      }
    }
  }, [resolveAddressAsync]);

  /**
   * Cancel: Discard all draft changes and notify parent to close
   */
  const handleCancel = useCallback(() => {
    // Discard any draft changes without calling onConfirm
    onClose();
  }, [onClose]);

  /**
   * Confirm: Validate and pass confirmed location to parent
   */
  const handleConfirm = useCallback(() => {
    if (!draftCoordinate || !isValidCoordinate(draftCoordinate)) {
      Alert.alert(
        'Chưa chọn vị trí',
        'Vui lòng chạm vào bản đồ để đặt ghim vị trí trước khi xác nhận.'
      );
      return;
    }

    onConfirm({
      latitude: draftCoordinate.latitude,
      longitude: draftCoordinate.longitude,
      address: draftAddress.trim() || undefined,
      accuracyMeters: draftAccuracy,
      capturedAt: draftTimestamp || new Date().toISOString(),
    });

    onClose();
  }, [draftCoordinate, draftAddress, draftAccuracy, draftTimestamp, onConfirm, onClose]);

  const hasSelectedLocation = draftCoordinate !== null && isValidCoordinate(draftCoordinate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Đóng bản đồ"
            onPress={handleCancel}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={FIND_BACK.bodyText} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Hủy chọn vị trí"
            onPress={handleCancel}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={FIND_BACK.mutedText} />
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={DARK_GOOGLE_MAP_STYLE}
            initialRegion={
              initialCoordinate && isValidCoordinate(initialCoordinate)
                ? {
                    latitude: initialCoordinate.latitude,
                    longitude: initialCoordinate.longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }
                : DEFAULT_REGION
            }
            onPress={handleMapPress}
            onMapReady={() => setIsMapReady(true)}
            toolbarEnabled={false}
            showsCompass={false}
            style={StyleSheet.absoluteFillObject}
          >
            {hasSelectedLocation && (
              <Marker
                coordinate={draftCoordinate}
                draggable
                onDragEnd={handleMarkerDragEnd}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerPin}>
                    <MapPin size={22} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                  <View style={styles.markerTip} />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Floating GPS Button */}
          <TouchableOpacity
            style={[styles.gpsFloatingBtn, isLocatingGPS && styles.gpsFloatingBtnLoading]}
            onPress={handleUseCurrentLocation}
            disabled={isLocatingGPS}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sử dụng vị trí hiện tại"
          >
            {isLocatingGPS ? (
              <ActivityIndicator size="small" color={FIND_BACK.primary} />
            ) : (
              <>
                <Crosshair size={18} color={FIND_BACK.primary} />
                <Text style={styles.gpsFloatingBtnText}>Vị trí hiện tại</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bottom Coordinates & Address Badge */}
          <View style={styles.locationBadgeContainer} pointerEvents="none">
            {hasSelectedLocation ? (
              <View style={styles.locationBadge}>
                <View style={styles.locationBadgeHeader}>
                  <MapPin size={15} color={FIND_BACK.secondary} />
                  <Text style={styles.locationBadgeCoords}>
                    {draftCoordinate.latitude.toFixed(5)}, {draftCoordinate.longitude.toFixed(5)}
                    {draftAccuracy !== undefined ? ` (±${Math.round(draftAccuracy)}m)` : ''}
                  </Text>
                </View>
                {isGeocoding ? (
                  <View style={styles.geocodingRow}>
                    <ActivityIndicator size="small" color={FIND_BACK.mutedText} />
                    <Text style={styles.locationBadgeAddressMuted}>Đang tìm địa chỉ...</Text>
                  </View>
                ) : draftAddress ? (
                  <Text style={styles.locationBadgeAddress} numberOfLines={2}>
                    {draftAddress}
                  </Text>
                ) : (
                  <Text style={styles.locationBadgeAddressMuted}>
                    Kéo ghim để tinh chỉnh vị trí
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.instructionBadge}>
                <MapPin size={16} color={FIND_BACK.mutedText} />
                <Text style={styles.instructionText}>
                  Chạm vào bất kỳ điểm nào trên bản đồ để đặt ghim
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Actions */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 20 : 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Hủy"
          >
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>

          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              !hasSelectedLocation && styles.confirmBtnDisabled,
              pressed && hasSelectedLocation && styles.btnPressed,
            ]}
            onPress={handleConfirm}
            disabled={!hasSelectedLocation}
            accessibilityRole="button"
            accessibilityLabel="Xác nhận vị trí"
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>
              {hasSelectedLocation ? 'Xác nhận vị trí' : 'Chưa chọn vị trí'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FIND_BACK.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: FIND_BACK.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FIND_BACK.borderGlass,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FIND_BACK.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    color: FIND_BACK.bodyText,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: FIND_BACK.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: FIND_BACK.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: FIND_BACK.primary,
    marginTop: -2,
  },
  gpsFloatingBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(19, 19, 25, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(124, 106, 246, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gpsFloatingBtnLoading: {
    paddingHorizontal: 16,
  },
  gpsFloatingBtnText: {
    color: FIND_BACK.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  locationBadgeContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  locationBadge: {
    backgroundColor: 'rgba(19, 19, 25, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 139, 0.3)',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  locationBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationBadgeCoords: {
    color: FIND_BACK.bodyText,
    fontSize: 13,
    fontWeight: '700',
  },
  locationBadgeAddress: {
    color: FIND_BACK.mutedText,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  locationBadgeAddressMuted: {
    color: FIND_BACK.labelText,
    fontSize: 11,
    marginTop: 2,
  },
  geocodingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 19, 25, 0.92)',
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  instructionText: {
    color: FIND_BACK.mutedText,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    backgroundColor: FIND_BACK.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FIND_BACK.borderGlass,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIND_BACK.surfaceMuted,
    borderWidth: 1,
    borderColor: FIND_BACK.borderGlass,
  },
  cancelBtnText: {
    color: FIND_BACK.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FIND_BACK.primary,
  },
  confirmBtnDisabled: {
    backgroundColor: 'rgba(124, 106, 246, 0.35)',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
  },
});
