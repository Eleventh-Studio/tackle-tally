/**
 * Pure formatting utilities — no React, no side effects.
 */

/** e.g. "2h 15m" or "45m" */
export function formatDuration(startedAt: string, endedAt?: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const ms = end - start;
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/** e.g. "14 Apr 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "2:34 PM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** e.g. "14 Apr 2026 · 2:34 PM" */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** e.g. "April 2026" for gallery grouping */
export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  });
}

/** e.g. "1013 hPa" */
export function formatPressure(hpa?: number | null): string {
  if (!hpa) return '—';
  return `${Math.round(hpa)} hPa`;
}
