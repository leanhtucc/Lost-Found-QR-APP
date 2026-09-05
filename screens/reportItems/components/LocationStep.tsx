import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Crosshair, MapPin, Search, X } from 'lucide-react-native';
import { DARK_GOOGLE_MAP_STYLE } from '@/constants/googleMapStyle';
import { mapApi, MapAutocompletePrediction } from '@/services/map';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { ReportLocation } from '../types';

interface LocationStepProps {
  location: ReportLocation;
  manualAddress: string;
  onChangeManualAddress: (value: string) => void;
  useCurrentLocation: boolean;
  onToggleUseCurrentLocation: () => void;
  isResolvingCurrentLocation?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

const isDaytimeNow = (): boolean => {
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 18;
};

const LOCATION_DELTA = {
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

export const LocationStep: React.FC<LocationStepProps> = ({
  location,
  manualAddress,
  onChangeManualAddress,
  useCurrentLocation,
  onToggleUseCurrentLocation,
  isResolvingCurrentLocation = false,
  onLocationChange,
}) => {
  const mapRef = useRef<MapView>(null);
  const lastMapCenterRef = useRef({ latitude: location.lat, longitude: location.lng });
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDaytime, setIsDaytime] = useState<boolean>(() => isDaytimeNow());

  // Address Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MapAutocompletePrediction[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setIsDaytime(isDaytimeNow()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isMapReady) return;

    const latitudeChanged = Math.abs(lastMapCenterRef.current.latitude - location.lat) > 0.000001;
    const longitudeChanged = Math.abs(lastMapCenterRef.current.longitude - location.lng) > 0.000001;
    if (!latitudeChanged && !longitudeChanged) return;

    lastMapCenterRef.current = { latitude: location.lat, longitude: location.lng };
    mapRef.current?.animateToRegion(
      { latitude: location.lat, longitude: location.lng, ...LOCATION_DELTA },
      350
    );
  }, [isMapReady, location.lat, location.lng]);

  const handleRegionChangeComplete = (region: Region) => {
    const latitude = Number(region.latitude.toFixed(6));
    const longitude = Number(region.longitude.toFixed(6));
    lastMapCenterRef.current = { latitude, longitude };
    onLocationChange?.(latitude, longitude);
  };

  const handleSearchAddress = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const predictions = await mapApi.autocomplete(query.trim());
        setSearchResults(predictions);
      } catch (error) {
        console.warn('[LocationStep] Autocomplete search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleSelectSearchResult = useCallback(
    async (prediction: MapAutocompletePrediction) => {
      Keyboard.dismiss();
      setIsSearching(true);

      try {
        const details = await mapApi.getPlaceDetails(prediction.place_id);
        const lat = details?.lat;
        const lng = details?.lng;
        const address = details?.formatted_address || prediction.description;

        if (typeof lat === 'number' && typeof lng === 'number') {
          lastMapCenterRef.current = { latitude: lat, longitude: lng };
          mapRef.current?.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.006,
              longitudeDelta: 0.006,
            },
            350
          );
          onLocationChange?.(lat, lng);
        }

        onChangeManualAddress(address);
        setSearchQuery(address);
        setSearchResults([]);
      } catch (error) {
        console.warn('[LocationStep] Get place details failed:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [onChangeManualAddress, onLocationChange]
  );

  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 22, fontWeight: '800' }}>
        Bạn mất ở đâu?
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 14, marginTop: 8 }}>
        Tìm kiếm địa chỉ hoặc kéo bản đồ để đặt ghim vị trí chính xác.
      </Text>

      {/* Address Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={REPORT_COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm địa chỉ, toà nhà, khu vực..."
            placeholderTextColor={REPORT_COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearchAddress}
            returnKeyType="search"
            autoCorrect={false}
          />
          {isSearching && <ActivityIndicator size="small" color={REPORT_COLORS.accent} />}
          {!isSearching && searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={REPORT_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResultsWrapper}>
            <ScrollView
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={item.place_id || `${item.description}-${index}`}
                  activeOpacity={0.7}
                  onPress={() => void handleSelectSearchResult(item)}
                  style={[
                    styles.searchResultItem,
                    index < searchResults.length - 1 && styles.searchResultItemBorder,
                  ]}
                >
                  <MapPin size={16} color={REPORT_COLORS.accent} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchResultMainText} numberOfLines={1}>
                      {item.main_text || item.description}
                    </Text>
                    {item.secondary_text ? (
                      <Text style={styles.searchResultSecondaryText} numberOfLines={1}>
                        {item.secondary_text}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.lat,
            longitude: location.lng,
            ...LOCATION_DELTA,
          }}
          customMapStyle={isDaytime ? [] : DARK_GOOGLE_MAP_STYLE}
          mapType="standard"
          toolbarEnabled={false}
          loadingEnabled
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={handleRegionChangeComplete}
          style={StyleSheet.absoluteFillObject}
        />

        <View pointerEvents="none" style={styles.centerPinContainer}>
          <View style={styles.centerPinPulse} />
          <View style={styles.centerPinCircle}>
            <MapPin size={24} color="#fff" fill="#fff" />
          </View>
          <View style={[styles.centerPinLabel, !isDaytime && styles.centerPinLabelDark]}>
            <Text style={styles.centerPinLabelText}>GHIM VỊ TRÍ</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          borderRadius: 20,
          backgroundColor: REPORT_COLORS.surfaceSoft,
          padding: 18,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: REPORT_COLORS.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MapPin size={18} color={REPORT_COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: REPORT_COLORS.textMuted,
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontWeight: '700',
            }}
          >
            {location.subtitle}
          </Text>
          <Text
            style={{
              color: REPORT_COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {location.title}
          </Text>
          <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
            {location.cityLine}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: 'rgba(36,36,54,0.55)',
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 12, fontWeight: '700' }}>
          VỊ TRÍ ĐÁNH RƠI (FALLBACK)
        </Text>
        <TextInput
          value={manualAddress}
          onChangeText={onChangeManualAddress}
          placeholder="Nhập địa chỉ nếu không lấy được tự động"
          placeholderTextColor={REPORT_COLORS.textMuted}
          multiline
          style={{
            marginTop: 8,
            color: REPORT_COLORS.textPrimary,
            fontSize: 14,
            minHeight: 52,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleUseCurrentLocation}
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: useCurrentLocation ? REPORT_COLORS.accent : REPORT_COLORS.border,
          backgroundColor: useCurrentLocation ? REPORT_COLORS.accentSoft : 'rgba(36,36,54,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <Crosshair size={18} color={REPORT_COLORS.textPrimary} />
        <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>
          {isResolvingCurrentLocation ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 14,
    zIndex: 20,
  },
  searchInputWrapper: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: REPORT_COLORS.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: REPORT_COLORS.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchResultsWrapper: {
    marginTop: 6,
    maxHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: '#17171F',
    overflow: 'hidden',
  },
  searchResultsList: {
    maxHeight: 180,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchResultItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: REPORT_COLORS.border,
  },
  searchResultMainText: {
    color: REPORT_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultSecondaryText: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  mapCard: {
    height: 300,
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: REPORT_LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: '#0a0a0f',
  },
  centerPinContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -45 }],
  },
  centerPinPulse: {
    position: 'absolute',
    top: 2,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  centerPinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    elevation: 8,
  },
  centerPinLabel: {
    marginTop: 7,
    marginLeft: -20,
    marginRight: -20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  centerPinLabelDark: {
    backgroundColor: 'rgba(8,8,15,0.92)',
  },
  centerPinLabelText: {
    color: '#8b5cf6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
