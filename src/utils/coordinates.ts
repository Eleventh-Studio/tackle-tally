import type { Catch } from '@/types';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Resolve the best available coordinates for a catch.
 * Prefers EXIF GPS (where the photo was taken = where the catch happened)
 * over device GPS (where the user was when they logged it — same place for
 * live captures, but misleading for retrospective gallery uploads).
 * Returns null if neither source has data.
 */
export function getCatchCoordinates(c: Catch): LatLng | null {
  if (c.exif_lat != null && c.exif_lng != null) {
    return { latitude: c.exif_lat, longitude: c.exif_lng };
  }
  if (c.device_lat != null && c.device_lng != null) {
    return { latitude: c.device_lat, longitude: c.device_lng };
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
