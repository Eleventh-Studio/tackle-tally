import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  exifLat: number | null;
  exifLng: number | null;
  exifTimestamp: string | null;
}

/**
 * Abstracts expo-image-picker for both camera capture and library selection.
 * Always requests EXIF data — GPS and timestamp are used to enrich catch records.
 *
 * iOS note: EXIF GPS is only present if the user has granted location permission
 * to the camera app. We store whatever we get; device GPS from useLocation is
 * the fallback source.
 */
export function useCamera() {
  const launchCamera = async (): Promise<PickedImage | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        exif: true,
      });

      if (result.canceled || !result.assets[0]) return null;
      return parseAsset(result.assets[0]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('not available')) {
        Alert.alert('Camera unavailable', 'Use the photo library instead.');
      }
      return null;
    }
  };

  const launchLibrary = async (): Promise<PickedImage | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      exif: true,
    });

    if (result.canceled || !result.assets[0]) return null;
    return parseAsset(result.assets[0]);
  };

  return { launchCamera, launchLibrary };
}

function parseAsset(asset: ImagePicker.ImagePickerAsset): PickedImage {
  const exif = asset.exif as Record<string, unknown> | undefined;

  let exifLat: number | null = null;
  let exifLng: number | null = null;
  let exifTimestamp: string | null = null;

  if (exif) {
    // GPS
    const gps = exif.GPS as Record<string, unknown> | undefined;
    if (gps?.GPSLatitude && gps?.GPSLongitude) {
      exifLat = parseDms(gps.GPSLatitude, gps.GPSLatitudeRef as string);
      exifLng = parseDms(gps.GPSLongitude, gps.GPSLongitudeRef as string);
    }

    // Timestamp
    const dt = exif.DateTimeOriginal as string | undefined;
    if (dt) {
      // EXIF format: "2026:04:14 09:32:11" → ISO
      exifTimestamp = dt.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    }
  }

  return { uri: asset.uri, exifLat, exifLng, exifTimestamp };
}

function parseDms(dms: unknown, ref: string): number | null {
  if (!Array.isArray(dms) || dms.length !== 3) return null;
  const [degrees, minutes, seconds] = dms as number[];
  const decimal = degrees + minutes / 60 + seconds / 3600;
  return ref === 'S' || ref === 'W' ? -decimal : decimal;
}
