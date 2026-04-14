import type { Catch } from '@/types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Resolve the best available coordinates for a catch.
 * Prefers device GPS (captured at log time) over EXIF (from photo metadata).
 * Returns null if neither source has data.
 */
export function getCatchCoordinates(c: Catch): LatLng | null {
  if (c.device_lat != null && c.device_lng != null) {
    return { latitude: c.device_lat, longitude: c.device_lng };
  }
  if (c.exif_lat != null && c.exif_lng != null) {
    return { latitude: c.exif_lat, longitude: c.exif_lng };
  }
  return null;
}

/**
 * Default map region centred on Australia, used when no catch data is available.
 */
export const AUSTRALIA_REGION = {
  latitude: -25.2744,
  longitude: 133.7751,
  latitudeDelta: 35,
  longitudeDelta: 35,
};
