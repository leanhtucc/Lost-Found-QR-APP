import { Linking } from 'react-native';

export const isValidCoordinate = (latitude?: number, longitude?: number): boolean =>
  typeof latitude === 'number' &&
  Number.isFinite(latitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  typeof longitude === 'number' &&
  Number.isFinite(longitude) &&
  longitude >= -180 &&
  longitude <= 180;

export async function openExternalDirections(
  latitude: number,
  longitude: number
): Promise<boolean> {
  if (!isValidCoordinate(latitude, longitude)) return false;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.warn('[Directions] Could not open external Google Maps:', error);
    return false;
  }
}
