import type { Catch } from '@/types';

/**
 * When the catch actually happened. Prefers the EXIF DateTimeOriginal
 * (verifiable photo metadata) over the system-generated log time, so a
 * retrospective upload from gallery shows the real catch time, not the
 * upload time.
 */
export function getCatchTimestamp(c: Catch): string {
  return c.taken_at ?? c.created_at;
}

/** True when EXIF capture time differs from log time by more than a tolerance. */
export function isRetrospective(c: Catch, toleranceMs = 2 * 60 * 1000): boolean {
  if (!c.taken_at) return false;
  return Math.abs(new Date(c.created_at).getTime() - new Date(c.taken_at).getTime()) > toleranceMs;
}
