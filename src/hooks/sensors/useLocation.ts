import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  status: PermissionStatus;
  requestPermission: () => Promise<boolean>;
}

/**
 * Returns the device's current GPS position.
 * Requests permission on mount if not yet determined.
 */
export function useLocation(): LocationState {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [status, setStatus] = useState<PermissionStatus>('undetermined');

  const requestPermission = async (): Promise<boolean> => {
    const { status: s } = await Location.requestForegroundPermissionsAsync();
    setStatus(s === 'granted' ? 'granted' : 'denied');
    return s === 'granted';
  };

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(async ({ status: s }) => {
      if (s === 'granted') {
        setStatus('granted');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } else if (s === 'denied') {
        setStatus('denied');
      } else {
        await requestPermission();
      }
    });
  }, []);

  return { latitude, longitude, status, requestPermission };
}
