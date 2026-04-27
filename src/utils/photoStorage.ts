import { Directory, File, Paths } from 'expo-file-system';

// Picked images land in the OS cache directory by default — iOS may purge
// cache entries under storage pressure, which would silently invalidate the
// photo_uri stored against a catch. Persist them under documents/photos/<id>.
const photosDir = new Directory(Paths.document, 'photos');

function ensurePhotosDir(): void {
  if (!photosDir.exists) photosDir.create({ intermediates: true });
}

function extensionFor(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:[?#].*)?$/);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Copy a freshly picked photo into the app's persistent documents directory
 * and return the new URI. Safe to call once per catch — the destination
 * filename is derived from the catch id so retries are idempotent.
 */
export function persistCatchPhoto(catchId: string, srcUri: string): string {
  ensurePhotosDir();
  const dest = new File(photosDir, `${catchId}.${extensionFor(srcUri)}`);
  if (dest.exists) dest.delete();
  new File(srcUri).copy(dest);
  return dest.uri;
}

/** Best-effort delete of a catch's persisted photo. Never throws. */
export function deleteCatchPhoto(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Photo already gone or never persisted — nothing to do.
  }
}
