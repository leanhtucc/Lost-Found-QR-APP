import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { MapPin, Search, X } from 'lucide-react-native';
import { FIND_BACK } from '@/constants/theme';
import { mapApi, MapAutocompletePrediction } from '@/services/map';

export interface DiscoverySearchBarProps {
  onSelectLocation: (coords: { latitude: number; longitude: number; address: string }) => void;
  locationBias?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  testID?: string;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY_MS = 350;

export const DiscoverySearchBar: React.FC<DiscoverySearchBarProps> = ({
  onSelectLocation,
  locationBias,
  testID = 'discovery-search-bar',
}) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<MapAutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const isMountedRef = useRef(true);
  const sessionTokenRef = useRef<string | null>(null);
  const searchRequestIdRef = useRef(0);
  const selectionRequestIdRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Maintain mounted lifecycle tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      selectionRequestIdRef.current++;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDropdownVisible) {
        setIsDropdownVisible(false);
        Keyboard.dismiss();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isDropdownVisible]);

  // Execute debounced autocomplete search
  const executeAutocomplete = useCallback(
    async (text: string, currentRequestId: number) => {
      const trimmed = text.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        setPredictions([]);
        setIsSearching(false);
        setIsDropdownVisible(false);
        return;
      }

      // Initialize unique session token if one does not exist for this search session
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = Crypto.randomUUID();
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await mapApi.autocomplete(trimmed, {
          sessionToken: sessionTokenRef.current || undefined,
          lat: locationBias?.lat,
          lng: locationBias?.lng,
          radius: locationBias?.radius,
        });

        // Request race protection: only keep response if this is still the active search request
        if (!isMountedRef.current || currentRequestId !== searchRequestIdRef.current) {
          return;
        }

        setPredictions(results);
        setIsDropdownVisible(true);
      } catch (err) {
        if (!isMountedRef.current || currentRequestId !== searchRequestIdRef.current) {
          return;
        }
        console.warn('[DiscoverySearchBar] Autocomplete failed:', err);
        setSearchError('Không thể tải gợi ý. Vui lòng thử lại.');
        setPredictions([]);
        setIsDropdownVisible(true);
      } finally {
        if (isMountedRef.current && currentRequestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [locationBias]
  );

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      setSearchError(null);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      const trimmed = text.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        // Cancel in-flight requests and clear suggestions
        searchRequestIdRef.current++;
        setPredictions([]);
        setIsSearching(false);
        setIsDropdownVisible(false);
        return;
      }

      const nextRequestId = ++searchRequestIdRef.current;
      debounceTimeoutRef.current = setTimeout(() => {
        void executeAutocomplete(trimmed, nextRequestId);
      }, DEBOUNCE_DELAY_MS);
    },
    [executeAutocomplete]
  );

  const handleClear = useCallback(() => {
    // Invalidate in-flight autocomplete and selection requests
    searchRequestIdRef.current++;
    selectionRequestIdRef.current++;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setQuery('');
    setPredictions([]);
    setIsSearching(false);
    setIsResolving(false);
    setIsDropdownVisible(false);
    setSearchError(null);

    // Terminate current session token
    sessionTokenRef.current = null;
  }, []);

  const handleSelectPrediction = useCallback(
    async (prediction: MapAutocompletePrediction) => {
      Keyboard.dismiss();
      setIsDropdownVisible(false);

      const currentSelectionId = ++selectionRequestIdRef.current;
      const activeSessionToken = sessionTokenRef.current || undefined;

      setIsResolving(true);
      setSearchError(null);

      try {
        const details = await mapApi.getPlaceDetails(prediction.place_id, activeSessionToken);

        // Selection race check & unmount protection
        if (!isMountedRef.current || currentSelectionId !== selectionRequestIdRef.current) {
          return;
        }

        const lat = details?.lat;
        const lng = details?.lng;

        if (
          typeof lat === 'number' &&
          Number.isFinite(lat) &&
          lat >= -90 &&
          lat <= 90 &&
          typeof lng === 'number' &&
          Number.isFinite(lng) &&
          lng >= -180 &&
          lng <= 180
        ) {
          // Terminate session token after place details is resolved
          sessionTokenRef.current = null;

          const address = details?.formatted_address || prediction.description;
          setQuery(prediction.main_text || address);

          onSelectLocation({
            latitude: lat,
            longitude: lng,
            address,
          });
        } else {
          console.warn(
            '[DiscoverySearchBar] Invalid coordinates received from place details:',
            details
          );
          setSearchError('Tọa độ địa điểm không hợp lệ.');
          setIsDropdownVisible(true);
        }
      } catch (err) {
        if (!isMountedRef.current || currentSelectionId !== selectionRequestIdRef.current) {
          return;
        }
        console.warn('[DiscoverySearchBar] Get place details failed:', err);
        setSearchError('Không thể lấy chi tiết vị trí.');
        setIsDropdownVisible(true);
      } finally {
        if (isMountedRef.current && currentSelectionId === selectionRequestIdRef.current) {
          setIsResolving(false);
        }
      }
    },
    [onSelectLocation]
  );

  return (
    <View testID={testID} style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputContainer}>
        <Search size={18} color={FIND_BACK.primaryLight} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          testID="discovery-search-input"
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Tìm địa điểm, khu vực..."
          placeholderTextColor={FIND_BACK.mutedText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.textInput}
          onFocus={() => {
            if (predictions.length > 0 && query.trim().length >= MIN_QUERY_LENGTH) {
              setIsDropdownVisible(true);
            }
          }}
        />

        {isSearching || isResolving ? (
          <ActivityIndicator
            testID="discovery-search-loading"
            size="small"
            color={FIND_BACK.primaryLight}
            style={styles.actionIcon}
          />
        ) : null}

        {query.length > 0 ? (
          <TouchableOpacity
            testID="discovery-search-clear"
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Xóa tìm kiếm"
            style={styles.actionIcon}
          >
            <X size={16} color={FIND_BACK.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Dropdown Suggestions */}
      {isDropdownVisible && (
        <View testID="discovery-search-dropdown" style={styles.dropdownContainer}>
          {searchError ? (
            <View style={styles.stateNoticeBox}>
              <Text testID="discovery-search-error-text" style={styles.errorText}>
                {searchError}
              </Text>
            </View>
          ) : predictions.length === 0 && !isSearching ? (
            <View style={styles.stateNoticeBox}>
              <Text testID="discovery-search-empty-text" style={styles.emptyText}>
                Không tìm thấy địa điểm phù hợp
              </Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.resultsList}
            >
              {predictions.map(item => (
                <TouchableOpacity
                  key={item.place_id}
                  testID={`discovery-search-item-${item.place_id}`}
                  activeOpacity={0.7}
                  onPress={() => handleSelectPrediction(item)}
                  style={styles.resultItem}
                >
                  <View style={styles.pinIconBox}>
                    <MapPin size={16} color={FIND_BACK.primaryLight} />
                  </View>
                  <View style={styles.resultTextCol}>
                    <Text numberOfLines={1} style={styles.mainText}>
                      {item.main_text || item.description}
                    </Text>
                    {item.secondary_text ? (
                      <Text numberOfLines={1} style={styles.secondaryText}>
                        {item.secondary_text}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
    zIndex: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1b26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    paddingVertical: 0,
  },
  actionIcon: {
    marginLeft: 6,
    padding: 2,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    maxHeight: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 100,
  },
  resultsList: {
    maxHeight: 250,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  resultTextCol: {
    flex: 1,
  },
  mainText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
  secondaryText: {
    fontSize: 11,
    color: FIND_BACK.mutedText,
    marginTop: 2,
  },
  stateNoticeBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: FIND_BACK.mutedText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#fb7185',
    textAlign: 'center',
  },
});

export default DiscoverySearchBar;
