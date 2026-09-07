import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { CATEGORY_CONFIG, ItemCategory } from '@/types/item';

export const CATEGORY_OPTIONS: { value: ItemCategory; label: string }[] = Object.entries(
  CATEGORY_CONFIG
).map(([key, config]) => ({
  value: key as ItemCategory,
  label: config.label,
}));

export const DEFAULT_MAP_REGION: Region = {
  latitude: 21.027763,
  longitude: 105.83416,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

export const toAddressString = (location: Location.LocationGeocodedAddress): string => {
  if (location.formattedAddress?.trim()) return location.formattedAddress.trim();

  return [
    location.name,
    [location.streetNumber, location.street].filter(Boolean).join(' '),
    location.district,
    location.city,
    location.region,
  ]
    .map(value => value?.trim())
    .filter(Boolean)
    .join(', ');
};
