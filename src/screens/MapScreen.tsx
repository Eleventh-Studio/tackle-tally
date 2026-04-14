import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useCatches } from '@/hooks/useCatches';
import { getCatchCoordinates, AUSTRALIA_REGION } from '@/utils/coordinates';
import { colors } from '@/theme';

export function MapScreen() {
  const router = useRouter();
  const { catches, loadCatches } = useCatches();

  useEffect(() => { loadCatches(); }, []);

  const located = useMemo(
    () => catches.filter((c) => getCatchCoordinates(c) !== null),
    [catches]
  );

  const initialRegion = useMemo(() => {
    if (located.length === 0) return AUSTRALIA_REGION;
    const coords = located.map((c) => getCatchCoordinates(c)!);
    const lat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
    const lng = coords.reduce((s, c) => s + c.longitude, 0) / coords.length;
    const latSpread = Math.max(...coords.map((c) => Math.abs(c.latitude - lat))) * 2.5 + 0.05;
    const lngSpread = Math.max(...coords.map((c) => Math.abs(c.longitude - lng))) * 2.5 + 0.05;
    return { latitude: lat, longitude: lng, latitudeDelta: latSpread, longitudeDelta: lngSpread };
  }, [located]);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <View className="px-4 py-3 border-b border-border">
        <Text className="text-2xl font-black text-foreground uppercase tracking-widest">Map</Text>
        <Text className="text-xs text-muted mt-0.5">
          {located.length > 0
            ? `${located.length} catch${located.length === 1 ? '' : 'es'} located`
            : 'No catches with GPS data yet'}
        </Text>
      </View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        userInterfaceStyle="dark"
      >
        {located.map((c) => {
          const coord = getCatchCoordinates(c)!;
          return (
            <Marker
              key={c.id}
              coordinate={coord}
              onPress={() => router.push(`/catches/${c.id}`)}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.accent,
                  borderWidth: 2.5,
                  borderColor: '#121212',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13, lineHeight: 16 }}>🎣</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
