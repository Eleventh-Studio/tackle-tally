import React, { useEffect } from 'react';
import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { StatCard, SectionHeader } from '@/components/ds';
import { useStats } from '@/hooks/useStats';
import { useCatches } from '@/hooks/useCatches';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatSize, lengthFromCm } from '@/utils/units';
import { colors } from '@/theme';

export function ProfileScreen() {
  const router = useRouter();
  const { loadCatches } = useCatches();
  const stats = useStats();
  const { lengthUnit, weightUnit } = useSettingsStore();

  useEffect(() => { loadCatches(); }, []);

  const maxCount = Math.max(...stats.speciesBreakdown.map((s) => s.count), 1);

  const biggestLengthDisplay = stats.biggestCatch?.length_cm
    ? `${Math.round(lengthFromCm(stats.biggestCatch.length_cm, lengthUnit))}${lengthUnit}`
    : '—';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-4 pb-8 gap-y-6"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-black text-foreground uppercase tracking-widest">Profile</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={8}
          className="active:opacity-60"
        >
          <Settings size={22} color={colors.foreground} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Featured catch */}
      {stats.biggestCatch && (
        <View className="bg-surface rounded-card border border-border overflow-hidden">
          <Image
            source={{ uri: stats.biggestCatch.photo_uri }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="p-4">
            <Text className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">
              Biggest Catch
            </Text>
            <Text className="text-foreground font-black text-xl">
              {stats.biggestCatch.species ?? 'Unknown species'}
            </Text>
            {(stats.biggestCatch.length_cm || stats.biggestCatch.weight_g) && (
              <Text className="text-muted">
                {formatSize(
                  stats.biggestCatch.length_cm,
                  stats.biggestCatch.weight_g,
                  lengthUnit,
                  weightUnit
                )}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Stats summary */}
      <View>
        <SectionHeader title="My Stats" />
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-row gap-x-3 w-full">
            <StatCard value={stats.totalCatches} label="Catches" accent />
            <StatCard value={stats.uniqueSpecies} label="Species" />
          </View>
          <View className="flex-row gap-x-3 w-full">
            <StatCard value={stats.totalSessions} label="Sessions" />
            <StatCard value={biggestLengthDisplay} label="Biggest" />
          </View>
        </View>
      </View>

      {/* Species chart */}
      {stats.speciesBreakdown.length > 0 && (
        <View>
          <SectionHeader title="Top Species" />
          <View className="gap-y-3">
            {stats.speciesBreakdown.slice(0, 10).map(({ species, count }) => (
              <View key={species} className="gap-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-foreground text-sm font-semibold" numberOfLines={1}>
                    {species}
                  </Text>
                  <Text className="text-muted text-sm">{count}</Text>
                </View>
                <View className="h-2 bg-surface-raised rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
