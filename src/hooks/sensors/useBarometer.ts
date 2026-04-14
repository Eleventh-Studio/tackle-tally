import { useState, useEffect } from 'react';
import { Barometer } from 'expo-sensors';

interface BarometerState {
  pressureHpa: number | null;
  isAvailable: boolean;
}

/**
 * Reads barometric pressure from the device sensor.
 * Returns null if the sensor is unavailable (common on older devices).
 * Stops listening when the component unmounts.
 */
export function useBarometer(): BarometerState {
  const [pressureHpa, setPressureHpa] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let subscription: ReturnType<typeof Barometer.addListener> | null = null;

    Barometer.isAvailableAsync().then((available) => {
      setIsAvailable(available);
      if (available) {
        subscription = Barometer.addListener(({ pressure }) => {
          setPressureHpa(pressure);
        });
        Barometer.setUpdateInterval(2000);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return { pressureHpa, isAvailable };
}
