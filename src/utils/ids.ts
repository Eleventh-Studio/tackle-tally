/**
 * Generate a unique ID.
 * React Native 0.74+ (New Architecture) has `crypto.randomUUID()` available.
 * Falls back to a timestamp-based ID if not available.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
