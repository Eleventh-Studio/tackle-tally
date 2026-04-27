import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, Pressable, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatches } from '@/hooks/useCatches';
import { formatMonthYear } from '@/utils/formatters';
import { getCatchTimestamp } from '@/utils/timestamps';
import { colors } from '@/theme';
import type { Catch } from '@/types';

const { width } = Dimensions.get('window');
const COLUMNS = 3;
const GAP = 2;
const TILE_SIZE = (width - GAP * (COLUMNS + 1)) / COLUMNS;

export function GalleryScreen() {
  const { catches, loadCatches } = useCatches();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadCatches(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCatches();
    setRefreshing(false);
  };

  // Group by month
  const grouped = catches.reduce<Record<string, Catch[]>>((acc, c) => {
    const key = formatMonthYear(getCatchTimestamp(c));
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  if (catches.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
        <View className="flex-1 items-center justify-center gap-y-3">
          <Text className="text-5xl">📷</Text>
          <Text className="text-foreground font-bold text-lg">No photos yet</Text>
          <Text className="text-muted text-sm">Log a catch to build your gallery</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121212' }}>
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {Object.entries(grouped).map(([month, items]) => (
        <View key={month}>
          <Text className="text-xs text-muted font-semibold uppercase tracking-widest px-4 py-3">
            {month}
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: GAP, paddingHorizontal: GAP }}>
            {items.map((c) => (
              <Pressable key={c.id} className="active:opacity-80">
                <Image
                  source={{ uri: c.photo_uri }}
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                  className="bg-surface-raised"
                  resizeMode="cover"
                />
                <View className="absolute bottom-1 left-1 right-1">
                  <Text className="text-white text-[10px] font-semibold bg-black/50 rounded px-1" numberOfLines={1}>
                    {c.species}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <View className="h-8" />
    </ScrollView>
    </SafeAreaView>
  );
}
