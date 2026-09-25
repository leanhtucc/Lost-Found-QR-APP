import * as Location from 'expo-location';
import { buildV1Url, buildApiUrl } from '@services/shared/url';
import { authStorage } from '@storage/auth';
import {
  AutocompleteOptions,
  MapApiResponse,
  MapAutocompletePrediction,
  MapGeocodeResult,
  MapPlaceDetails,
} from './types';

const createHeaders = async (): Promise<HeadersInit> => {
  const token = await authStorage.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const toAddressString = (loc: Location.LocationGeocodedAddress): string => {
  const segments = [
    loc.name,
    loc.streetNumber,
    loc.street,
    loc.district,
    loc.city,
    loc.region,
    loc.country,
  ];

  return segments
    .map(segment => (typeof segment === 'string' ? segment.trim() : ''))
    .filter(Boolean)
    .join(', ');
};

export const mapApi = {
  /**
   * 1. Gợi ý địa chỉ theo thời gian thực (Google Maps Places Autocomplete)
   * GET /v1/map/autocomplete?input=...&sessiontoken=...
   */
  async autocomplete(
    input: string,
    options?: AutocompleteOptions
  ): Promise<MapAutocompletePrediction[]> {
    const trimmed = input.trim();
    if (!trimmed) return [];

    try {
      const headers = await createHeaders();
      let queryParams = `input=${encodeURIComponent(trimmed)}`;
      if (options?.sessionToken) {
        queryParams += `&sessiontoken=${encodeURIComponent(options.sessionToken)}`;
      }
      if (options?.lat !== undefined && options?.lng !== undefined) {
        queryParams += `&lat=${options.lat}&lng=${options.lng}`;
        if (options.radius) {
          queryParams += `&radius=${options.radius}`;
        }
      }

      let url = `${buildV1Url('map', 'autocomplete')}?${queryParams}`;
      let response = await fetch(url, { method: 'GET', headers });

      if (!response.ok && response.status === 404) {
        url = `${buildApiUrl('map', 'autocomplete')}?${queryParams}`;
        response = await fetch(url, { method: 'GET', headers });
      }

      const payload = await parseJsonSafely<MapApiResponse<MapAutocompletePrediction[]>>(response);
      if (
        response.ok &&
        payload?.success &&
        Array.isArray(payload.data) &&
        payload.data.length > 0
      ) {
        return payload.data;
      }
    } catch (error) {
      console.warn('[mapApi] Autocomplete backend request failed, falling back:', error);
    }

    // Fallback: Local geocoding if backend Places API is unavailable
    try {
      const results = await Location.geocodeAsync(trimmed);
      if (results.length === 0) return [];

      const enriched = await Promise.all(
        results.slice(0, 5).map(async (item, idx) => {
          let description = `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}`;
          let mainText = trimmed;
          let secondaryText = '';

          try {
            const [geo] = await Location.reverseGeocodeAsync({
              latitude: item.latitude,
              longitude: item.longitude,
            });
            if (geo) {
              const full = toAddressString(geo);
              if (full) {
                description = full;
                mainText = geo.name || geo.street || trimmed;
                secondaryText = [geo.district, geo.city || geo.region, geo.country]
                  .filter(Boolean)
                  .join(', ');
              }
            }
          } catch {
            // fallback coords
          }

          return {
            place_id: `fallback-${item.latitude}-${item.longitude}-${idx}`,
            description,
            main_text: mainText,
            secondary_text: secondaryText,
          };
        })
      );

      return enriched;
    } catch {
      return [];
    }
  },

  /**
   * 2. Lấy toạ độ GPS chính xác và địa chỉ đầy đủ từ place_id
   * GET /v1/map/place-details?place_id=...&sessiontoken=...
   */
  async getPlaceDetails(placeId: string, sessionToken?: string): Promise<MapPlaceDetails | null> {
    if (!placeId) return null;

    // If fallback place_id
    if (placeId.startsWith('fallback-')) {
      const parts = placeId.split('-');
      const lat = parseFloat(parts[1] || '0');
      const lng = parseFloat(parts[2] || '0');
      return {
        place_id: placeId,
        name: 'Vị trí đã chọn',
        formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat,
        lng,
      };
    }

    try {
      const headers = await createHeaders();
      let queryParams = `place_id=${encodeURIComponent(placeId)}`;
      if (sessionToken) {
        queryParams += `&sessiontoken=${encodeURIComponent(sessionToken)}`;
      }

      let url = `${buildV1Url('map', 'place-details')}?${queryParams}`;
      let response = await fetch(url, { method: 'GET', headers });

      if (!response.ok && response.status === 404) {
        url = `${buildApiUrl('map', 'place-details')}?${queryParams}`;
        response = await fetch(url, { method: 'GET', headers });
      }

      const payload = await parseJsonSafely<MapApiResponse<MapPlaceDetails>>(response);
      if (response.ok && payload?.success && payload.data) {
        return payload.data;
      }
    } catch (error) {
      console.warn('[mapApi] Place details backend request failed:', error);
    }

    return null;
  },

  /**
   * 3. Lấy địa chỉ tiếng Việt chuẩn khi kéo thả ghim trên bản đồ (Reverse Geocode)
   * GET /v1/map/reverse-geocode?lat=...&lng=...
   */
  async reverseGeocode(lat: number, lng: number): Promise<MapGeocodeResult | null> {
    try {
      const headers = await createHeaders();
      let url = `${buildV1Url('map', 'reverse-geocode')}?lat=${lat}&lng=${lng}`;
      let response = await fetch(url, { method: 'GET', headers });

      if (!response.ok && response.status === 404) {
        url = `${buildApiUrl('map', 'reverse-geocode')}?lat=${lat}&lng=${lng}`;
        response = await fetch(url, { method: 'GET', headers });
      }

      const payload = await parseJsonSafely<MapApiResponse<MapGeocodeResult>>(response);
      if (response.ok && payload?.success && payload.data) {
        return payload.data;
      }
    } catch (error) {
      console.warn('[mapApi] Reverse geocode backend request failed, falling back:', error);
    }

    // Fallback: Local reverse geocode
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geo) {
        return {
          formatted_address: toAddressString(geo),
          lat,
          lng,
        };
      }
    } catch {
      // fallback
    }

    return {
      formatted_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      lat,
      lng,
    };
  },

  /**
   * 4. Tìm toạ độ từ địa chỉ (Geocode)
   * GET /v1/map/geocode?address=...
   */
  async geocode(address: string): Promise<MapGeocodeResult | null> {
    const trimmed = address.trim();
    if (!trimmed) return null;

    try {
      const headers = await createHeaders();
      let url = `${buildV1Url('map', 'geocode')}?address=${encodeURIComponent(trimmed)}`;
      let response = await fetch(url, { method: 'GET', headers });

      if (!response.ok && response.status === 404) {
        url = `${buildApiUrl('map', 'geocode')}?address=${encodeURIComponent(trimmed)}`;
        response = await fetch(url, { method: 'GET', headers });
      }

      const payload = await parseJsonSafely<MapApiResponse<MapGeocodeResult>>(response);
      if (response.ok && payload?.success && payload.data) {
        return payload.data;
      }
    } catch (error) {
      console.warn('[mapApi] Geocode backend request failed, falling back:', error);
    }

    // Fallback
    try {
      const [first] = await Location.geocodeAsync(trimmed);
      if (first) {
        return {
          formatted_address: trimmed,
          lat: first.latitude,
          lng: first.longitude,
        };
      }
    } catch {
      // fallback
    }

    return null;
  },
};

export default mapApi;
